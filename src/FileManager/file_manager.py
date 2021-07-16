from .models import File
from . import github_manager as gm

import hashlib


def get_all_files(admin_access):
    '''
    Returns all files in the database

    Args:
        admin_access: True if the method should also return private files

    Returns:
        A list of all files in the database that meet the access criteria
    '''
    file_list = File.objects.all()
    if not admin_access:
        file_list = file_list.filter(public=True)
    return file_list


def get_accepted_files(admin_access):
    '''
    Returns all database files, that were merged into the main branch of the repository

    Args:
        admin_access: True if the method should also return private files

    Returns:
        A list of all files in the database that are also in the main branch of the repository
    '''
    github_file_list = gm.get_files_from_repo(admin_access)
    file_ids = [file.name.split('-')[0] for file in github_file_list]

    database_files = File.objects.all()
    file_list = database_files.filter(id__in=file_ids)

    if not admin_access:
        file_list = file_list.filter(public=True)

    return file_list


def get_file_hash(file):
    '''
    Returns the sha256 hash of the content of the given File object

    Args:
        file: The File object whose content should be hashed

    Returns:
        the sha256 hash of the files content
    '''
    file_content = '\n'.join(get_file_lines(file))
    return get_string_hash(file_content)


def get_string_hash(file_content):
    '''
    Creates the sha256 hash of the given string

    Args:
        file_content: The Str that should be hashed
    Returns:
        the sha256 hash of file_content

    '''
    byte_string = file_content.encode()
    return hashlib.sha256(byte_string).hexdigest()


def get_file_lines(database_file):
    '''
    Returns a list of all lines contained in the given File object

    Args:
        database_file: The File that should be read

    Returns:
        A list of strings containing the files content
    '''
    file = database_file.file
    file.open(mode='r')
    lines = file.readlines()
    file.close()
    return lines
