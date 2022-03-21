# from module: pyGithub, details: https://pygithub.readthedocs.io/en/latest/examples/Repository.html
import os
import re

from django.template.loader import render_to_string
from django.utils.html import strip_tags
from github import Github
import logging

from core.user.models import User

logger = logging.getLogger(__name__)
init_repo_name = 'wurstbroteater/djangoProject'
init_branch = 'main'
token = os.getenv('GITHUB_TOKEN')

g = Github(login_or_token=token)


def mirror_to_github(file):
    """
    Checks the repository and commits the file as new pull request and informs staff and admin about new PR.
    """
    eval_repo()
    link = post_file_in_pull_request(file=file).issue_url.replace('api.github.com/repos', 'github.com').replace(
        '/issues/', '/pull/')
    html_message = render_to_string('email/file_mirror_notify_admin_email.html', {
        'user': str(file.owner),
        'protocol': 'http',
        'link': link
    })
    plain_message = strip_tags(html_message)
    file.mirrored = True
    file.save()
    for to_notify in User.objects.filter(is_staff=True) | User.objects.filter(is_superuser=True):
        to_notify._email_user(
            '[Staff] DDueruem new mirror request', plain_message, html_message=html_message)
    pass


def eval_repo(repo_name=init_repo_name):
    """
    Checks if the given GitHub repository contains a files' folder. If not it will be created.
    Returns true if the repo already contains a file folder and false otherwise
    """
    repo = g.get_repo(repo_name)
    repo_content = repo.get_contents('')
    folders = []
    # assure folders only
    while repo_content:
        current = repo_content.pop(0)
        if current.type == "dir":
            folders.append(current)
    folders = [file.path for file in folders]  # file names only instead of ContentFile(path=...)
    has_file_folder = 'files' in folders
    if not has_file_folder:
        logger.warning(f"[Mirror]: Creating 'files' folder in repo {repo_name}")
        repo.create_file("files/.gitkeep", "created files folder", "", branch=init_branch)
    return has_file_folder


# -----------------------------Code taken from 'deprecated' branch and slightly modified --------------------------
def get_files_from_repo(full_access=False, repo_name=init_repo_name):
    """
    Returns all files that are present in the main branch of the repository.

    Paths that the method looks for files in are:
        - files/public
        - files/private

    Args:
        full_access: Toggle between public files if False and public + private files if True

    Returns:
        A list of all file names in the repository 
    """
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


def post_file_in_pull_request(file, branch_name=init_branch, repo_name=init_repo_name):
    """ 
    Takes the given file and posts commits it in a new branch to the repository
    and creates a pull request with this new branch.

    Args:
        file: the File object that should be committed to GitHub
        branch_name: The name of the branch that the new branch should be based on and merged into
    """
    # access = 'public' if file.public else 'private'
    access = 'public'  # at the moment we do not support private models
    # define file path
    root_path = 'files/' + access + '/' + str(file.family.label)
    fm_path = root_path + '/' + file.label
    filtered_file_name = re.sub(r'\W+', '', file.label)
    with file.local_file.open('r') as f:
        file_content = ''.join(f.readlines())
    create_branch(branch_name=filtered_file_name, repo_name=repo_name)
    # alter feature model xml
    fname = file.label + '.xml'
    create_or_update_file(fm_path, fname, file_content, branch_name=filtered_file_name, repository_name=repo_name)
    # alter feature model readme
    attributes = fm_to_markdown(file)
    md_name = 'readme.md'
    create_or_update_file(fm_path, md_name, attributes, branch_name=filtered_file_name, repository_name=repo_name)
    # alter feature model family readme
    attributes = fmf_to_markdown(file.family)
    md_name = 'readme.md'
    create_or_update_file(root_path, md_name, attributes, branch_name=filtered_file_name, repository_name=repo_name)
    # alter feature model family changelog
    content = f"On '{file.uploaded_at}' the feature model '{file.label}' was uploaded by '{file.owner}'\n"
    md_name = 'fmf_changelog'
    create_or_update_file(root_path, md_name, content, overwrite=False, branch_name=filtered_file_name,
                          repository_name=repo_name)
    return create_new_pull_request(branch_name, filtered_file_name, repo_name=repo_name)


def fmf_to_markdown(family):
    """
    Returns the attributes of a Feature Model Family as markdown
    """
    return f"# Feature Model Family {family.label}\n" \
           f"{family.description}\n" \
           f"The uploader is **{' '.join(str(family.owner))}**\n"


def fm_to_markdown(file):
    """
    Returns the attributes of a File as markdown
    """
    return f"# Feature Model {file.label}\n" \
           f"This feature model was uploaded at {file.uploaded_at}. The uploader is **{' '.join(str(file.owner))}**\n" \
           f"{file.description}\n" \
           "## License\n" \
           "The feature model was published with the following license:\n" \
           f"{file.license}\n" \
           "## Feature Model Family\n" \
           f"This Feature Model belongs to {str(file.family).split(':')[1]}\n"


def create_branch(branch_name, base=init_branch, repo_name=init_repo_name):
    """
    Creates a new branch in the GitHub repo

    Args:
        branch_name: The name of the new branch 
        base: The name of the base branch that the new branch is based on
    """
    repo = g.get_repo(repo_name)
    # check if branch already name exists
    base_branch = repo.get_branch(base)
    if branch_name not in map(lambda x: x.name, repo.get_branches()):
        repo.create_git_ref(ref='refs/heads/' + branch_name,
                            sha=base_branch.commit.sha)


def create_or_update_file(path, file_name, file_content, branch_name, overwrite=True, repository_name=init_repo_name):
    """
    Creates a new file in the git repository, or if a file with the same name already exists in that branch,
    overwrites its content if override is True (per default) otherwise file content will be updated.

    Args:
        path: The folder path the file is created under
        file_name: The name of the file 
        file_content: The content of the file as a String
        branch_name: The name of the branch that the file should be created/updated in
        overwrite: Boolean flag indicating if an existing file should be overwritten (true) or updated (false)
        repository_name: Name of the repository
    """

    repo = g.get_repo(repository_name)

    all_files = []
    contents = repo.get_contents("", ref=branch_name)
    while contents:
        file = contents.pop(0)
        if file.type == "dir":
            contents.extend(repo.get_contents(file.path, ref=branch_name))
        else:
            all_files.append(file.path)

    path = path + '/' + file_name
    if path in all_files:
        file_to_update = repo.get_contents(path, ref=branch_name)
        if not overwrite:
            file_content = repo.get_contents(path).decoded_content.decode() + file_content
        return repo.update_file(path, f'Updated file: {file_name}', file_content, sha=file_to_update.sha,
                                branch=branch_name)
    else:
        return repo.create_file(path, f'Added a new file: {file_name}', file_content, branch=branch_name)


def create_new_pull_request(base, head, repo_name=init_repo_name):
    """
    Creates a new pull request in the repository

    Args:
        base: The branch that the head branch should be merged into
        head: The branch that the pull request is 
    """
    repo = g.get_repo(repo_name)
    # check if pull request already exists
    # get sha of head branch
    if head not in [branch.name for branch in repo.get_branches()]:
        return
    pull_requests = list(
        filter(lambda p: p.head.ref == head, repo.get_pulls()))
    if len(pull_requests) == 0:
        # create a pull request
        body = 'Added a new feature model and stored relevant information in readme.md'
        return repo.create_pull(title='[Upload Mirror] added new Feature Model', body=body, base=base, head=head)
