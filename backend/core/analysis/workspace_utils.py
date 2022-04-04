import os
from pathlib import Path


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


def _create_entrypoint(file_name):
    # TODO add filename to start analysis instead starting example
    return '#!/bin/bash\n' \
           './ddueruem.py -h &&' \
           './setup.py buddy cudd &&' \
           './ddueruem.py examples/berkeleydb.dimacs'


def create_workspace(work_dir):
    """
    Create relevant folders for analysis of a Feature Model.
    Generated structure:
    <work_dir>:
        logs/
        reports/
        files/

    Args:
        absolut_path path to folder where analysis folders are stored. Ending with no / or \
    """
    # create if not exist
    Path(work_dir).mkdir(parents=True, exist_ok=True)
    print(f"{work_dir}{os.path.sep}logs")
    Path(f"{work_dir}{os.path.sep}logs").mkdir(parents=True, exist_ok=True)
    Path(f"{work_dir}{os.path.sep}reports").mkdir(parents=True, exist_ok=True)
    Path(f"{work_dir}{os.path.sep}files").mkdir(parents=True, exist_ok=True)
    pass
