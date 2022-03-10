import logging
import docker
import os
from transpiler.utils import write_to_file

logger = logging.getLogger(__name__)

# ------------------------------- Image Management -------------------------------
client = docker.from_env()



def create_or_reuse_image(work_dir):
    """
    Creates new ddueruem image or find present image.
    Returns ddueruem image.
    """
    nested_image_tags = map(lambda nested_image: nested_image.tags, client.images.list())
    # [[..]] to [..] and skip '' == flatten (for novice)
    all_image_tags = [item for sublist in nested_image_tags for item in sublist]
    image_tag = 'ddueruem:latest'
    if image_tag not in all_image_tags:
        image = _create_image(work_dir)
        logger.warning('Created new ddueruem image')
        return image
    logger.warning('Found present ddueruem image')
    return client.images.get(image_tag)


def _delete_image():
    """
    Forcefully deletes an image and returns True if it was possible.
    """
    try:
        client.images.remove(image='ddueruem:latest', force=True)
        return True
    except Exception:
        return False


def _create_image(work_dir):
    """
    Checks if the files 'Dockerfile' and 'entrypoint.sh' are present in the given folder path.
    If not these files are created

    Returns created image
        Details:
    """
    folder_content = os.listdir(work_dir)
    if 'Dockerfile' not in folder_content:
        write_to_file(_create_dockerfile('ddueruem'), f'{work_dir}{os.path.sep}Dockerfile')
        logger.warning('Dockerfile created')
    if 'entrypoint.sh' not in folder_content:
        write_to_file(_create_entrypoint(), f'{work_dir}{os.path.sep}entrypoint.sh')
        logger.warning('entrypoint.sh created')
    image, _ = client.images.build(path=work_dir, tag='ddueruem')
    return image


def _create_dockerfile(repo_name):
    """
    Returns content of dockerfile that clones from given git repository.
    """
    return 'FROM python:3\n' \
           'RUN apt update && apt install -y git\n' \
           'RUN apt install -y make && apt install -y build-essential\n' \
           f'RUN git clone https://github.com/h3ssto/{repo_name}.git\n' \
           f'WORKDIR {repo_name}/\n' \
           'RUN pip install -r requirements_min.txt\n' \
           'COPY entrypoint.sh entrypoint.sh\n' \
           'CMD ["./entrypoint.sh"]\n'


def _create_entrypoint():
    return '#!/bin/bash\n' \
           './ddueruem.py -h &&' \
           './setup.py buddy cudd &&' \
           './ddueruem.py examples/sandwich.dimacs --lib buddy &&' \
           './ddueruem.py examples/berkeleydb.dimacs'
