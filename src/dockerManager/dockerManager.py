from os import cpu_count
import docker
import threading
import time
from .models import DockerProcess


class containerManager(threading.Thread):

    def __init__(self):
        threading.Thread.__init__(self)
        self.running = False

    def run(self):
        self.running = True
        while self.running:
            # stop the thread if there are no more processes to queue
            if len(queued_containers) == 0:
                self.running = False
                return
            container = queued_containers[0]
            # get process to the container
            process = DockerProcess.objects.get(pk=container.name)
            if start_process(container, process):
                queued_containers = queued_containers[1:]
            else:
                # wait a second then check again
                time.sleep(1)

    def is_running(self):
        return self.running


client = docker.from_env()

MAX_RAM = 32
MAX_CPU = 16

queued_containers = []
containerManagerThread = containerManager()


def create_container(ram, cpu, name):
    return client.containers.create(
        'ubuntu',
        command='echo Hello World',
        detach=True,
        cpu_count=cpu,
        mem_limit=f'{ram}g',
        name=name
    )

def get_ram_and_cpu(resource):
    resources = resource.split('-')
    return int(resources[0]), int(resources[1])


def start_or_queue_process(process):
    ram, cpu = get_ram_and_cpu(process.resources)
    container = create_container(ram, cpu, process.id)
    if not start_process(container, process):
        queued_containers.append((container, process))


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
        process = DockerProcess.objects.get(pk=container.name)
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
