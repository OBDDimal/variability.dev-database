from os import cpu_count
import docker
import threading
import time
from .models import DockerProcess


class containerManager(threading.Thread):

    def __init__(self):
        threading.Thread.__init__(self)
        self.running = False
        self.queued_containers = []

    def run(self):
        '''
        Starts the process that actively monitors the running containers
        '''
        self.running = True
        while self.running:
            # stop the thread if there are no more processes to queue
            if len(self.queued_containers) == 0:
                self.running = False
                return
            container = self.queued_containers[0]
            # get process to the container
            container_id = int(container.name.split('-')[1])
            process = DockerProcess.objects.get(pk=container_id)
            if start_process(container, process):
                self.queued_containers = self.queued_containers[1:]
            else:
                # wait a second then check again
                time.sleep(1)

    def is_running(self):
        return self.running


client = docker.from_env()

MAX_RAM = 32
MAX_CPU = 16

containerManagerThread = containerManager()


def create_container(ram, cpu, name):
    '''
    Creates a new Docker Container with the specified

    Args:
        ram: The maximum amount of memory allowed for the container
        cpu: The amount of CPU cores for this container
        name: The name of the container
    '''
    return client.containers.create(
        'ubuntu',
        command='echo Hello World',
        detach=True,
        cpu_count=cpu,
        mem_limit=f'{ram}g',
        name=name
    )


def get_ram_and_cpu(process):
    '''
    Splits the Database representation of a processes resources into ram and cpu

    Returns:
        Ram: The memory that the process wants to request
        Cpu: The amount of cpu cores the process wants to request
    '''
    resources = process.resources.split('-')
    return int(resources[0]), int(resources[1])


def start_or_queue_process(process):
    '''
    Creates a new docker container based on the database process

    If there are enough resources available to start the container, it
    '''
    ram, cpu = get_ram_and_cpu(process)
    container = create_container(ram, cpu, f'p-{process.id}')
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
    ram, cpu = get_ram_and_cpu(process)
    used_ram = 0
    used_cpu_cores = 0
    # get all active containers and add up their requirements
    for container in client.containers.list():
        container_id = int(container.name.split('-')[1])
        process = DockerProcess.objects.get(pk=container_id)
        process_ram, process_cpu = get_ram_and_cpu(process)
        used_ram += process_ram,
        used_cpu_cores += process_cpu
    if used_ram + ram <= MAX_RAM and used_cpu_cores + cpu <= MAX_CPU:
        # start the container
        new_container.start()
        # make sure the manager thread is running
        if not containerManagerThread.is_running():
            containerManagerThread.start()
        return True
    return False
