import time
import docker
import logging

from docker.errors import DockerException

from core.utils import write_to_file
from .workspace_utils import _create_dockerfile, _create_entrypoint
from .models import DockerProcess, Analysis
import os
from pathlib import Path
from multiprocessing import Process

from .workspace_utils import create_workspace

logging.basicConfig(level=logging.INFO, format='[%(levelname)s] (%(threadName)-10s) %(message)s', )
logger = logging.getLogger(__name__)
client = docker.from_env()

MAX_RAM = 32
MAX_CPU = 16


# ------------------------------- Image Management -------------------------------
def create_or_reuse_image(process):
    """
    Creates new ddueruem image or find present image.
    Returns ddueruem image.
    """
    nested_image_tags = map(lambda nested_image: nested_image.tags, client.images.list())
    # [[..]] to [..] and skip '' == flatten (for novice)
    all_image_tags = [item for sublist in nested_image_tags for item in sublist]
    image_tag = 'ddueruem:latest'
    if image_tag not in all_image_tags:
        image = _create_image(process)
        logger.warning('Created new ddueruem image')
        return image
    logger.warning('Found present ddueruem image')
    return client.images.get(image_tag)


def _create_image(process):
    """
    Checks if the files 'Dockerfile' and 'entrypoint.sh' are present in the given folder path.
    If not these files are created

    Returns created image
        Details:
    """
    # assure that work_dir always ends with path seperator
    work_dir = process.working_directory
    folder_content = os.listdir(work_dir if work_dir[-1] == os.path.sep else f"{work_dir}{os.path.sep}")
    if 'Dockerfile' not in folder_content:
        write_to_file(_create_dockerfile('ddueruem'), f'{work_dir}{os.path.sep}Dockerfile')
        logger.warning('Dockerfile created')
    if 'entrypoint.sh' not in folder_content:
        write_to_file(_create_entrypoint(process.file_to_analyse), f'{work_dir}{os.path.sep}entrypoint.sh')
        logger.warning('entrypoint.sh created')
    image, _ = client.images.build(path=work_dir, tag='ddueruem')
    return image


def _delete_image():
    """
    Forcefully deletes an image and returns True if it was possible.
    """
    try:
        client.images.remove(image='ddueruem:latest', force=True)
        return True
    except Exception:
        return False


# ------------------------------- Container Management -------------------------------
def create_container(process):
    """
   Copies the file to analyse in the working directory (assuming that the folders files/, logs/ and reports/
   are  already present there) and then creates a container from the (already present) ddueruem image.

    Args:
        process: The process the container is based on

    Returns:
        The created container. The container has to be started manually
    """
    # copy selected file into /files directory
    file = process.file_to_analyse
    with file.local_file.open('r') as f:
        write_to_file('\n'.join(f.readlines()),
                      f'{process.working_directory}{os.path.sep}files{os.path.sep}fileToAnalyse.xml')
    repo_name = 'ddueruem'
    ram, cpu = get_ram_and_cpu(process)
    try:
        container = client.containers.create(
            f'{repo_name}:latest',  # tag of image to use
            detach=True,
            cpu_count=cpu,
            mem_limit=f'{ram}g',
            name=f'p-{process.id}',
            volumes={
                f"{process.working_directory}{os.path.sep}logs": {'bind': '/ddueruem/_log', 'mode': 'rw'},
                f"{process.working_directory}{os.path.sep}reports": {'bind': '/ddueruem/_reports', 'mode': 'rw'},
                f"{process.working_directory}{os.path.sep}files": {'bind': '/ddueruem/files', 'mode': 'rw'},
            },
        )
        return container
    except DockerException as de:
        logger.error(f'ERROR: Could not create container with message {str(de)}')
        return None


def start_container(new_container, process):
    """
    Checks if a new process can be started and does so if possible

    Args:
        new_container: The container object that should be started
        process: The Process object containing meta information to the container

    """
    # TODO: Enable queuing
    ram, cpu = get_ram_and_cpu(process)
    container = create_container(process)
    logger.info(f'\nRAM: {ram}/{MAX_RAM}\nCPU: {cpu}/{MAX_CPU}\n' +
                f'p_id: {process.id}\tf_id: {process.file_to_analyse}\n{process.library}')
    used_ram = 0
    used_cpu_cores = 0
    # get all active containers and add up their requirements
    active_containers = 0
    for container in client.containers.list():
        if container.name.startswith('p-'):
            container_id = int(container.name.split('-')[1])
            process = DockerProcess.objects.get(pk=container_id)
            process_ram, process_cpu = get_ram_and_cpu(process)
            used_ram += process_ram
            used_cpu_cores += process_cpu
            active_containers += 1
    logger.debug(f'Found {active_containers} active container(s)')
    logger.debug(f'process: {process}\tram/max: {used_ram}/{MAX_CPU}\tcpu/max: {used_cpu_cores}/{MAX_CPU}')
    # start the container
    logger.debug('Starting new container')
    new_container.start()
    # start monitoring progress
    monitor = Process(target=check_for_finished_container, args=(process,))
    process.working = True
    process.save()
    monitor.start()
    pass


def get_containers():
    """
    Returns a list of all started/running containers starting with 'p-'
    """
    out = []
    for container in client.containers.list():
        if container.name.startswith('p-'):
            out.append(container)
    return out


def get_ram_and_cpu(process):
    """
    Splits the Database representation of a processes resources into ram and cpu

    Returns:
        Ram: The memory that the process wants to request
        Cpu: The amount of cpu cores the process wants to request
    """
    resources = process.resources.split('-')
    return int(resources[0]), int(resources[1])


# ------------------------------- Monitor Analysis -------------------------------
def start_analysis(process, delete_image=False):
    """
    Starting the analysis means:
     - prepare workspace
     - prepare docker image
     - start container with analysis (includes monitoring)
    Note that when calling this method, the working_directory field should already be filled.
    """
    work_dir = process.working_directory
    logger.info('Searching for workspace ...')
    if not Path(work_dir).is_dir():
        create_workspace(work_dir)
        logger.info(f'Created workspace {work_dir}')
    else:
        logger.info(f'Reusing existing workspace {work_dir}')
    if not Path(f'{work_dir}{os.path.sep}Dockerfile').is_file():
        write_to_file(_create_dockerfile('ddueruem'), f'{work_dir}{os.path.sep}Dockerfile')
        logger.info(f'Created Dockerfile for {work_dir}')
    if not Path(f'{work_dir}{os.path.sep}entrypoint.sh').is_file():
        write_to_file(_create_entrypoint(process.file_to_analyse), f'{work_dir}{os.path.sep}entrypoint.sh')
        logger.info(f'Created entrypoint.sh for {work_dir}')
    if delete_image:
        logger.info('Deleting image ...')
        logger.info(f'{_delete_image()}\ndone!')
        logger.info('Check dockerfile present ...')
    _ = create_or_reuse_image(process)
    container = create_container(process)
    if container is not None:
        start_container(container, process)
    else:
        logger.warning('Aborting analysis because container could not be started!')


def check_for_finished_container(process):
    """
    Call this async with multiprocessing.
    Checks if the analysis output files ending with .order and .bdd are present
    """
    name = f'p-{process.id}'
    containers_names = [c.name for c in get_containers()]
    while name in containers_names:
        time.sleep(1)
        logger.debug(f"still running analysis container {name}")
        containers_names = [c.name for c in get_containers()]
    # container has finished. Get results
    logger.debug('analysis done!')
    work_dir = f'{process.working_directory}{os.path.sep}reports'
    file_names = [f for f in os.listdir(work_dir) if os.path.isfile(os.path.join(work_dir, f))]
    order_content = ''
    report_content = ''
    for name in file_names:
        if '.order' in name:
            with open(f'{work_dir}{os.path.sep}{name}', 'r') as f:
                order_content = f.read()
        if '.bdd' in name:
            with open(f'{work_dir}{os.path.sep}{name}', 'r') as f:
                report_content = f.read()
    logger.debug('write results to database')
    if order_content == '':
        logger.warning('Could not find order file for analysis or is empty')
    elif report_content == '':
        logger.warning('Could not find report file for analysis or is empty')
    else:
        # DockerProcess.objects.get(id=process.id).delete()
        Analysis.objects.create(report=report_content, order=order_content, process=process)
    logger.debug('Pruning stopped containers')
    client.containers.prune()
    logger.debug('done!')



