from django.http.request import HttpRequest
from django.shortcuts import get_object_or_404, redirect, render
from django.http import HttpResponse
from django.utils.http import urlunquote

from .models import File, FileUploadForm, Tag
from . import file_manager as fm
from . import github_manager as gm

# general view that lists all available files

# displays all files that are currently


def index(request):
    '''
        Displays an overview over all available files in the database.
        If the user is logged in as an admin, private files are displayed, else only public files.

        Filters the displayed list if tag is selected and included in the request
    '''
    # Admins can see all files
    admin_access = request.user.is_superuser
    file_list = fm.get_all_files(admin_access)
    # check if user filtered by tags and filter file_list appropriately
    selected_tag = 'all'
    if(request.method == 'GET' and 'tags' in request.GET):
        selected_tag = urlunquote(request.GET.get('tags'))
        if(not selected_tag == 'all'):
            file_list = file_list.filter(tags__name=selected_tag)
            
    return render(request, 'FileManager/index.html', {
        'file_list': file_list,
        'tag_list': Tag.objects.all()})


def accepted(request):
    '''
        Displays all files that are accepted in the repository

        Filters the displayed list if tag is selected and included in the request
    '''
    # Admins can see all files
    admin_access = request.user.is_superuser
    file_list = fm.get_accepted_files(admin_access)
    # check if user filtered by tags and filter file_list appropriately
    selected_tag = 'all'
    if(request.method == 'GET' and 'tags' in request.GET):
        selected_tag = urlunquote(request.GET.get('tags'))
        if(not selected_tag == 'all'):
            file_list = file_list.filter(tags__name=selected_tag)

    return render(request, 'FileManager/index.html', {
        'file_list': file_list,
        'tag_list': Tag.objects.all()})


def file_data(request, file_id):
    '''
    Displays details about a file analysis

    Currently WIP
    '''
    return render(request, 'FileManager/fileOverview.html')


def upload_file(request):
    '''
    Displays a form that lets the user upload a new file to the database

    If the request method is POST, the form is validated and a new file is posted in github as well as stored in the database
    '''
    if request.method == 'POST':
        form = FileUploadForm(request.POST, request.FILES)
        if(form.is_valid()):
            # preprocess the uploaded file
            file_name = request.FILES.get('file').name
            uploaded_file = form.save(commit=False)
            uploaded_file.hash = fm.get_file_hash(uploaded_file)
            uploaded_file.save()
            gm.post_file_in_pull_request(
                file=uploaded_file, file_name=file_name)
            return redirect('/files/')
    else:
        form = FileUploadForm()
    return render(request, 'FileManager/fileUploadForm.html', {'form': form})

# displays the content of a file as raw text


def file_raw(request, file_id):
    '''
    Displays the raw content of a file

    Args:
        file_id: The database id of the file
    '''
    fileObj = get_object_or_404(File, pk=file_id)
    # make sure only appropriate users can see the file
    # if not (request.user.is_superuser or fileObj.uploader is None or fileObj.uploader == request.user):
    #    return HttpResponse('No permissions to view this file')
    lines = fm.get_file_lines(fileObj)
    return HttpResponse('<br>'.join(lines))
