import time
import docker
import logging
from transpiler.utils import write_to_file
from .docker_utils import _delete_image, create_or_reuse_image, get_containers
from .models import DockerProcess, Analysis
import os
from pathlib import Path
from multiprocessing import Process

logging.basicConfig(level=logging.INFO, format='[%(levelname)s] (%(threadName)-10s) %(message)s', )
logger = logging.getLogger(__name__)
client = docker.from_env()

MAX_RAM = 32
MAX_CPU = 16


def create_workspace(wdir):
    """
    Create relevant folders for analysis
    of a Feature Model.
    Generated structure:
    <wdir>:
        logs/
        reports/
        files/

    Args:
        absolut_path path to folder where analysis folders are stored. Ending with no / or \
    """
    # create if not exist
    Path(wdir).mkdir(parents=True, exist_ok=True)
    print(f"{wdir}{os.path.sep}logs")
    Path(f"{wdir}{os.path.sep}logs").mkdir(parents=True, exist_ok=True)
    Path(f"{wdir}{os.path.sep}reports").mkdir(parents=True, exist_ok=True)
    Path(f"{wdir}{os.path.sep}files").mkdir(parents=True, exist_ok=True)
    pass

def create_container(process, work_dir):
    """
   Copies the file to analyse in the working directory (assuming that the folders files/, logs/ and reports/
   are  already present there) and then creates a container from the (already present) ddueruem image.

    Args:
        process: The process the container is based on
        work_dir : path to workspace ending with NO / or \

    Returns:
        The created container. The container has to be started manually
    """
    # copy selected file into /files directory
    file = process.file_to_analyse
    with file.local_file.open('r') as f:
        write_to_file('\n'.join(f.readlines()), f'{work_dir}{os.path.sep}files{os.path.sep}fileToAnalyse.xml')
    repo_name = 'ddueruem'
    ram, cpu = get_ram_and_cpu(process)
    container = client.containers.create(
        f'{repo_name}:latest',  # tag of image to use
        detach=True,
        cpu_count=cpu,
        mem_limit=f'{ram}g',
        name=f'p-{process.id}',
        volumes={
            f"{work_dir}{os.path.sep}logs": {'bind': '/ddueruem/_log', 'mode': 'rw'},
            f"{work_dir}{os.path.sep}reports": {'bind': '/ddueruem/_reports', 'mode': 'rw'},
            f"{work_dir}{os.path.sep}files": {'bind': '/ddueruem/files', 'mode': 'rw'},
        },
    )
    return container


def check_for_finished_container(process, work_dir):
    """
    call this async with multiprocessing
    """
    name = f'p-{process.id}'
    containers_names = [c.name for c in get_containers()]
    while name in containers_names:
        time.sleep(1)
        logger.debug(f"still running analysis container {name}")
        containers_names = [c.name for c in get_containers()]
    # container has finished. Get results
    logger.debug('analysis done!')
    work_dir = f'{work_dir}{os.path.sep}reports'
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
    logger.debug('done!')


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
    logger.info('Creating workspace ...')
    work_dir = f"{path_to_wdir}{os.path.sep}{process.id}_{process.file_to_analyse.label}"
    if not Path(work_dir).is_dir():
        create_workspace(work_dir)
        logger.info(f'Created workspace {work_dir}')
    else:
        logger.info(f'Reusing existing workspace {work_dir}')
    logger.info('Deleting image ...')
    logger.info(f'{_delete_image()}\ndone!')
    logger.info('Check dockerfile present ...')
    _ = create_or_reuse_image(work_dir)
    logger.info('done!')
    ram, cpu = get_ram_and_cpu(process)
    container = create_container(process, work_dir)
    logger.info(f'\nRAM: {ram}/{MAX_RAM}\nCPU: {cpu}/{MAX_CPU}\n' +
                f'p_id: {process.id}\tf_id: {process.file_to_analyse}\n{process.library}')
    # TODO: Enable queuing
    start_process(container, process, work_dir)


def start_process(new_container, process, work_dir):
    """
    Checks if a new process can be started and does so if possible

    Args:
        new_container: The container object that should be started
        process: The Process object containing meta information to the container
        work_dir: path to workspace ending with NO / or \

    Returns:
        True if a new container was started successfully
    """
    used_ram = 0
    used_cpu_cores = 0
    ram, cpu = get_ram_and_cpu(process)
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
    if True or (used_ram + ram <= MAX_RAM and used_cpu_cores + cpu <= MAX_CPU):
        # start the container
        logger.debug('Starting new container')
        new_container.start()
        # start monitoring progress
        monitor = Process(target=check_for_finished_container, args=(process, work_dir))
        process.working = True
        process.save()
        monitor.start()
        # containerManagerThread.started_containers.append(process.id)
        # make sure the manager thread is running
        """
        if not containerManagerThread.is_started():
            containerManagerThread.start()
        """
        return True
    return False
