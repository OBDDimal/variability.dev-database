import docker
from django.core.files.base import ContentFile
from transpiler.utils import write_to_file
from pathlib import Path
import os

client = docker.from_env()
repo_name = 'ddueruem-web'


def create_dockerfile1(repo_name):
    """
    Returns content of dockerfile that clones from given git repository.
    """
    file_content = 'FROM python:3\n' \
                   'RUN apt update && apt install -y git\n' \
                   'RUN apt install -y make && apt install -y build-essential\n' \
                   f'RUN git clone https://github.com/h3ssto/{repo_name}.git\n' \
                   f'RUN cd {repo_name}/\n' \
                   'RUN pip install -r requirements_min.txt \n' \
                   'RUN ./ddueruem.py -h\n' \
                   'RUN ./setup.py buddy cudd\n' \
                   'RUN \n' \
                   'RUN ./ddueruem.py examples/sandwich.dimacs --lib buddy \n' \
                   f'RUN ./ddueruem.py examples/berkeleydb.dimacs\n'
    return file_content


# print(client.images.list())
write_to_file(create_dockerfile1(repo_name), 'dockerfile')
dockerfile_pah = f'{Path(__file__).resolve().parent}'
print(dockerfile_pah)
print(client.images.build(path=dockerfile_pah))
"""
print(client.containers.run('ubuntu',
                            'apt update &&' +
                            'apt install -y git &&' +
                            'git --version &&'
                            f'git clone https://github.com/h3ssto/{repo_name}.git &&' +
                            'echo Hello World'))
"""
