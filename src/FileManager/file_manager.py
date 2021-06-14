from .models import File
from . import github_manager as gm

def get_all_files(admin_access):
    file_list = File.objects.all()
    if not admin_access:
        file_list = file_list.filter(public=True)
    return file_list

def get_accepted_files(admin_access):
    github_file_list = gm.get_files_from_repo(admin_access)
    file_ids = [file.name.split('-')[0] for file in github_file_list]

    database_files = File.objects.all()
    file_list = database_files.filter(id__in=file_ids)

    if not admin_access:
        file_list = file_list.filter(public=True)
    
    return file_list