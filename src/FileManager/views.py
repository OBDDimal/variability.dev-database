from django.http.request import HttpRequest
from django.shortcuts import get_object_or_404, redirect, render
from django.http import HttpResponse
from django.db.models import Q
from django.utils.http import urlunquote

from .models import File, FileUploadForm, Tag 

# general view that lists all available files
def index(request):
    # Admins can see all files
    if(request.user.is_superuser):
        file_list = File.objects.all()
    # Logged in users can see all public as well as their own files
    elif ( request.user.is_authenticated):
        file_list = File.objects.get(Q(uploader=request.user) | Q(uploader=None))
    # Public users can only see public files
    else:
        file_list = File.objects.filter(uploader=None)
    #check if user filtered by tags and filter file_list appropriately
    selected_tag = 'all'
    if(request.method == 'GET' and 'tags' in request.GET):
        selected_tag = urlunquote(request.GET.get('tags'))
        if(not selected_tag == 'all'):
            file_list = file_list.filter(tags__name=selected_tag)

    return render(request, 'FileManager/index.html', {
        'file_list': file_list,
        'tag_list': Tag.objects.all()})

# displays details about a specific file
def file_data(request, file_id):
    return render(request, 'FileManager/uploadForm.html')

# displays a form to upload a new file
def upload_file(request):
    if request.method == 'POST':
        form = FileUploadForm(request.POST, request.FILES)
        if(form.is_valid()):
            uploaded_file = form.save(commit=False)
            if request.user.is_authenticated:
                uploaded_file.uploader = request.user
            uploaded_file.save()
            return redirect('/files/')
    else:
        form = FileUploadForm()
    return render(request, 'FileManager/fileUploadForm.html', {'form':form})

# displays the content of a file as raw text
def file_raw(request, file_id):
    fileObj = get_object_or_404(File, pk=file_id)
    #make sure only appropriate users can see the file
    if not (request.user.is_superuser or fileObj.uploader is None or fileObj.uploader == request.user):
        return HttpResponse('No permissions to view this file')
    file = fileObj.file
    file.open(mode = 'r')
    lines = file.readlines()
    return HttpResponse('<br>'.join(lines))