import docker
import logging

from transpiler.utils import write_to_file
from .container_thread import MonitorContainerThread
from .models import DockerProcess
import os
from pathlib import Path

logging.basicConfig(level=logging.DEBUG,
                    format='[%(levelname)s] (%(threadName)-10s) %(message)s',
                    )
logger = logging.getLogger(__name__)

work_dir = f'{Path(__file__).resolve().parent}{os.path.sep}newAnalysis'
report_path = f'{work_dir}{os.path.sep}nreports'
log_path = f'{work_dir}{os.path.sep}nlogs'
client = docker.from_env()

MAX_RAM = 32
MAX_CPU = 16
containerManagerThread = MonitorContainerThread()


def create_workspace(process, absolut_path):
    """
    Create relevant folders for analysis
    of a Feature Model.
    Generated structure:
    file_id:file_label
        logs/
        reports/
        file/

    Args:
        absolut_path path to folder where analysis folders are stored. Ending with no / or \
    """
    print(absolut_path)
    ws_name = f"{process.file_to_analyse.id}_{process.file_to_analyse.label}"
    ws_dir = f"{absolut_path}{os.pathsep}{ws_name}"
    # create if not exist
    Path(ws_dir).mkdir(parents=True, exist_ok=True)
    Path(f"{ws_dir}{os.pathsep}logs").mkdir(parents=True, exist_ok=True)
    Path(f"{ws_dir}{os.pathsep}reports").mkdir(parents=True, exist_ok=True)
    Path(f"{ws_dir}{os.pathsep}files").mkdir(parents=True, exist_ok=True)
    return ws_dir


def get_running_process_ids():
    """
    Returns:
        A list of ids of all started container processes
    """
    return containerManagerThread.started_containers


def create_container(process, wdir):
    """
    Creates a new Docker Container from the specified image
    and creates all files and folders necessary for the analysis.

    Args:
        process: The process the container is based on

    Returns:
        The created container. The container has to be started manually
    """
    # copy selected file into /files directory
    # write file to analyse in folder
    with process.file_to_analyse.open('r') as f:
        write_to_file(f.readlines(), f'{wdir}{os.pathsep}files{os.pathsep}fileToAnalyse.xml')
    file = process.file_to_analyse
    repo_name = 'ddueruem'
    ram, cpu = get_ram_and_cpu(process)
    container = client.containers.create(
        'ddueruem:latest',  # tag of image to use
        detach=True,
        cpu_count=cpu,
        mem_limit=f'{ram}g',
        name=f'p-{process.id}',
        volumes={
            f"{wdir}{os.pathsep}logs": {'bind': '/ddueruem/_log', 'mode': 'rw'},
            f"{wdir}{os.pathsep}reports": {'bind': '/ddueruem/_reports', 'mode': 'rw'},
            f"{wdir}{os.pathsep}files": {'bind': '/ddueruem/files', 'mode': 'rw'},
        },
    )
    return container


def get_ram_and_cpu(process):
    """
    Splits the Database representation of a processes resources into ram and cpu

    Returns:
        Ram: The memory that the process wants to request
        Cpu: The amount of cpu cores the process wants to request
    """
    resources = process.resources.split('-')
    return int(resources[0]), int(resources[1])


def start_or_queue_process(process, path_to_wdir):
    """
    Creates a new docker container based on the database process

    If there are enough resources available to start the container, it
    """
    wdir = create_workspace(process, path_to_wdir)
    ram, cpu = get_ram_and_cpu(process)
    container = create_container(process, wdir)
    print(ram, cpu, f'p-{process.id}', process.file_to_analyse, process.library)
    if not start_process(container, process):
        containerManagerThread.queued_containers.append((container, process))


def start_process(new_container, process):
    """
    Checks if a new process can be started and does so if possible

    Args:
        new_container: The container object that should be started
        process: The Process object containing meta information to the container

    Returns:
        True if a new container was started successfully
    """
    used_ram = 0
    used_cpu_cores = 0
    ram, cpu = get_ram_and_cpu(process)
    # get all active containers and add up their requirements
    for container in client.containers.list():
        container_id = int(container.name.split('-')[1])
        process = DockerProcess.objects.get(pk=container_id)
        process_ram, process_cpu = get_ram_and_cpu(process)
        used_ram += process_ram
        used_cpu_cores += process_cpu

    print(f'process: {process}\tram/max: {used_ram}/{MAX_CPU}\tcpu/max: {used_cpu_cores}/{MAX_CPU}')
    if True or (used_ram + ram <= MAX_RAM and used_cpu_cores + cpu <= MAX_CPU):
        # start the container
        logging.warning('Starting new container')
        new_container.start()
        containerManagerThread.started_containers.append(process.id)
        # make sure the manager thread is running
        """
        if not containerManagerThread.is_started():
            containerManagerThread.start()
        """
        return True
    return False
