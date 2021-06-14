# github api wrapper thats used: pyGithub
from github import Github

from .models import File
# github token is stored as a system variable for security reasons
import os

#repo_name = 'h3ssto/ddueruem-web'
repo_name = 'Sean-Duft/github-api-tests'
g = Github(login_or_token=os.getenv('GITHUB_TOKEN'))


def get_files_from_repo(full_access=False):
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
    access = 'public' if file.public else 'private'

    # define path the new file is commited to
    path = 'files/' + access + '/' + str(file.id) + '-' + file_name
    # read the file content
    file.file.open(mode='rb')
    file_content = file.file.read().decode('utf-8')
    file.file.close()

    create_branch(branch_name=file_name)
    create_or_update_file(path, file_name, file_content, branch_name=file_name)
    create_new_pull_request(branch_name, file_name)

    # modify new branch to include changes


def create_branch(branch_name, base='main'):
    repo = g.get_repo(repo_name)
    # check if branch already name exists
    base_branch = repo.get_branch(base)
    if branch_name not in map(lambda x: x.name, repo.get_branches()):
        repo.create_git_ref(ref='refs/heads/' + branch_name,
                            sha=base_branch.commit.sha)


def create_or_update_file(path, file_name, file_content, branch_name, repository_name=repo_name):
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
    repo = g.get_repo(repo_name)
    # check if pull request already exists
    pull_requests = repo.get_pulls(head=head)
    if(pull_requests.totalCount == 0):
        # create a pull request
        body = f'Added a new file'
        repo.create_pull(title='Added a new file', body=body,
                         base=base, head=head)
