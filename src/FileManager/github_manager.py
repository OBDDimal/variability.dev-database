# github api wrapper thats used: pyGithub
from github import Github

from .models import File
# github token is stored as a system variable for security reasons
import os
import re

#repo_name = 'h3ssto/ddueruem-web'
repo_name = 'Sean-Duft/github-api-tests'
g = Github(login_or_token=os.getenv('GITHUB_TOKEN'))


def get_files_from_repo(full_access=False):
    '''
    Returns all files that are present in the main branch of the repository.

    Paths that the method looks for files in are:
        - files/public
        - files/private

    Args:
        full_access: Toggle between public files if False and public + private files if True

    Returns:
        A list of all file names in the repository 
    '''
    repo = g.get_repo(repo_name)
    if 'files' not in [file.path for file in repo.get_contents('')]:
        return []
    if 'files/public' not in [file.path for file in repo.get_contents('files')]:
        public_files = []
    else:
        public_files = repo.get_contents('files/public')
    if full_access:
        if 'files/private' not in [file.path for file in repo.get_contents('files')]:
            return public_files
        private_files = repo.get_contents('files/private')
        return public_files + private_files
    return public_files


def post_file_in_pull_request(file, file_name, branch_name='main'):
    '''
    Takes the given file and posts commits it in a new branch to the repository,
    and creates a pull request with this new branch.

    Args:
        file: the File object that should be commited to github
        file_name: The name that the file should be named as in github
        branch_name: The name of the branch that the new branch should be based on and merged into
    '''
    access = 'public' if file.public else 'private'

    # define path the new file is commited to
    path = 'files/' + access + '/' + str(file.id) + '-' + file_name
    filtered_file_name = re.sub(r'\W+', '', file_name)

    create_branch(branch_name=filtered_file_name)
    create_or_update_file(path, file_name, file.content,
                          branch_name=filtered_file_name)
    create_new_pull_request(branch_name, filtered_file_name)


def create_branch(branch_name, base='main'):
    '''
    Creates a new branch in the github repo

    Args:
        branch_name: The name of the new branch 
        base: The name of the base branch that the new branch is based on
    '''
    repo = g.get_repo(repo_name)
    # check if branch already name exists
    base_branch = repo.get_branch(base)
    if branch_name not in map(lambda x: x.name, repo.get_branches()):
        repo.create_git_ref(ref='refs/heads/' + branch_name,
                            sha=base_branch.commit.sha)


def create_or_update_file(path, file_name, file_content, branch_name, repository_name=repo_name):
    '''
    Creates a new file in the git repository, or if a file with the same name already exists in that branch, overrides its content

    Args:
        path: The folder path the file is created under
        file_name: The name of the file 
        file_content: The content of the file as a String
        branch_name: The name of the branch that the file should be created/updated in
        repository_name: Name of the repository
    '''

    repo = g.get_repo(repository_name)

    all_files = []
    contents = repo.get_contents("", ref=branch_name)
    while contents:
        file = contents.pop(0)
        if file.type == "dir":
            contents.extend(repo.get_contents(file.path, ref=branch_name))
        else:
            all_files.append(file.path)
    if path in all_files:
        file_to_update = repo.get_contents(path, ref=branch_name)
        repo.update_file(
            path, f'Updated file: {file_name}', file_content, sha=file_to_update.sha, branch=branch_name)
    else:
        repo.create_file(path, f'Added a new file: {file_name}',
                         file_content, branch=branch_name)


def create_new_pull_request(base, head):
    '''
    Creates a new pull request in the repository

    Args:
        base: The branch that the head branch should be merged into
        head: The branch that the pull request is 
    '''
    repo = g.get_repo(repo_name)
    # check if pull request already exists
    # get sha of head branch
    if head not in [branch.name for branch in repo.get_branches()]:
        return
    pull_requests = list(filter(lambda p: p.head.ref == head, repo.get_pulls()))
    if(len(pull_requests) == 0):
        # create a pull request
        body = f'Added a new file'
        repo.create_pull(title='Added a new file', body=body,
                         base=base, head=head)
