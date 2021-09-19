from django.http.response import HttpResponse
from django.shortcuts import get_list_or_404
from django.utils.http import urlunquote
from http import HTTPStatus
from .models import File, FileUploadForm
import json
import re
from . import file_manager as fm
from . import github_manager as gm
from dockerManager import dockerManager as dm
from dockerManager import models as docker_models


def index(request):
    '''
    Displays an overview over all available routes that the API supports
    '''
    response = HttpResponse()
    response.write('<h1>All available API routes:</h1>')
    response.write('api/feature-models/<br>')
    response.write('api/feature-model/&lthash&gt/<br>')
    response.write('api/feature-model/&lthash&gt/analysis/<br>')
    return response


def feature_models(request):
    '''
    Displays all available feature models the user has access to

    '''
    if request.method == 'GET':
        default_filters = File.get_filter_categories()
        model_list = File.objects.all()

        meta = {
            "total_elements": len(model_list)
        }

        # filter model list
        for category in default_filters:
            if category in request.GET:
                filter_value = urlunquote(request.GET[category])
                model_list = list(filter(lambda f: re.match(
                    filter_value, getattr(f, category)), model_list))

        # sort model list
        if 'order-by-property' in request.GET and len(request.GET['order-by-property']) > 0:
            order_attribute = request.GET['order-by-property']
            order = request.GET['order-by-property']
            if len(order_attribute) > 0 and (order_attribute[0] == '-' or order_attribute[0] == '+'):
                order_attribute = order_attribute[1:]
            if order_attribute.lower() in File.get_sortable_fields():
                model_list = model_list.order_by(order)

        response = HttpResponse()

        # pageination
        page_size = 20
        max_page_size = 100
        if 'page_size' in request.GET and request.GET['page_size'].isdigit():
            page_size = min(max_page_size, int(request.GET['page_size']))
            if page_size <= 0:
                page_size = 20
        page_number = 1
        # page number
        if 'page' in request.GET and request.GET['page'].isdigit():
            page_number = max(1, int(request.GET['page']))

        model_list = model_list[(page_number - 1) *
                                page_size: page_number * page_size]
        meta['page_size'] = page_size
        meta['page_number'] = page_number

        # build the data thats returned
        model_data = []
        for model in model_list:
            model_data.append({
                'name': model.name,
                'format': model.format,
                'description': model.description,
                'author': model.author,
                'source': model.source,
                'license': model.license,
                'hash': model.hash,
            })
        response.write(json.dumps({"meta": meta, "data": model_data}))
        return response
    # post a new feature model
    elif request.method == 'POST':
        form = FileUploadForm(request.POST, request.FILES)
        if(form.is_valid()):
            # preprocess the uploaded file
            file_content = form.files['file'].file.read().decode('utf-8')
            file_name = form.files['file'].name

            file_obj = form.save(commit=False)
            file_obj.content = file_content
            file_obj.name = file_name
            file_obj.hash = fm.get_string_hash(file_obj.content)
            file_obj.save()
            gm.post_file_in_pull_request(
                file=file_obj, file_name=file_name)
        return
    else:
        return HttpResponse(status=HTTPStatus.METHOD_NOT_ALLOWED.value)


def feature_model(request, hash):
    '''
    Get detailed information on a specific feature model

    Params:
        request: The django request object
        hash: The sha256 hash of the required file 
    '''
    if not request.method == 'GET':
        return HttpResponse(status=HTTPStatus.METHOD_NOT_ALLOWED.value)
    selected_file = get_list_or_404(File, hash=hash)[0]
    return HttpResponse(json.dumps({
        'name': selected_file.name,
        'format': selected_file.description,
        'description': selected_file.description,
        'author': selected_file.author,
        'source': selected_file.source,
        'license': selected_file.license,
        'hash': hash,
        'content': selected_file.content
    }))


def feature_model_analysis(request, hash):
    if request.method == 'GET':
        return
    elif request.method == 'POST':
        if 'feedback-email' not in request.POST:
            return HttpResponse('No feedback email provided', status=HTTPStatus.BAD_REQUEST.value)
        if 'resources' not in request.POST:
            return HttpResponse('No resource usage specified.', status=HTTPStatus.BAD_REQUEST.value)
        if request.POST['resources'] not in [option[0] for option in docker_models.RESOURCE_OPTIONS]:
            return HttpResponse(f'Invalid resource option', status=HTTPStatus.BAD_REQUEST.value)
        requested_file = get_list_or_404(File, hash=hash)[0]
        new_process = docker_models.DockerProcess.objects.create(file=requested_file,
                                                                 resources=request.POST['resources'], feedback_email=request.POST['feedback-email'])
        dm.start_or_queue_process(new_process)
    else:
        return HttpResponse(status=HTTPStatus.METHOD_NOT_ALLOWED.value)
