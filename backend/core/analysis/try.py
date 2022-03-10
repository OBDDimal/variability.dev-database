import os
import docker
import threading
import time
from .models import DockerProcess, Analysis

absolute_path = os.path.abspath('')
report_path = f'{absolute_path}/../_reports'
log_path = f'{absolute_path}/../_log'


class containerManager(threading.Thread):

    def __init__(self):
        threading.Thread.__init__(self)
        self.running = False
        self.queued_containers = []
        # Note: only stores the process ids, not the actual containers
        self.started_containers = []

    def run(self):
        global containerManagerThread
        self.running = True
        while self.running:
            # check for any processes that might have ended
            self.update_finished_processes()
            # stop the thread if there are no more processes to queue
            if len(self.queued_containers) == 0:
                # but only if all started processes already finished
                if len(self.started_containers) > 0:
                    time.sleep(1)
                    continue
                self.running = False
                # replace the containerManager thread
                containerManagerThread = containerManager()
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

    def update_finished_processes(self):
        '''
        Checks the output directories for output files of running processes,
        and if all of them are available, adds them to the
        database and confirms that the process was stopped
        '''
        # dictionary to keep track of all new files
        new_analysis = dict([(id, {'report': '', 'order': '', 'changed': False})
                             for id in self.started_containers])
        # all files in the output directory
        reports = [file for file in os.listdir(
            report_path) if os.path.isfile(f'{report_path}/{file}')]
        for report in reports:
            # check if the file name is valid
            if '-' not in report or '.' not in report:
                continue

            # get process id
            id = report.split('-')[0]
            if not id.isdigit():
                continue
            id = int(id)
            # check if the process with that id is currently running
            if id in self.started_containers:
                file_ending = report.split('.')[-1]
                if file_ending == 'order':
                    new_analysis[id]['order'] = report
                    new_analysis[id]['changed'] = True
                else:
                    new_analysis[id]['report'] = report
                    new_analysis[id]['changed'] = True
        # check for every element in the dictionary if both expected files were found
        for id in new_analysis:
            analysis_data = new_analysis[id]
            if not analysis_data['changed'] or analysis_data['report'] == '' or analysis_data['order'] == '':
                continue
            # update finished process
            self.started_containers.remove(id)
            process = DockerProcess.objects.filter(id=id)
            # check if there exists a matching process object
            if len(process) == 0:
                continue
            process = process.first()

            def get_file_content(path):
                '''Reads an entire file and returns its content as a UTF-8 string'''
                if os.path.exists(path):
                    with open(path, 'r', encoding='utf-8') as file:
                        return file.read()
                else:
                    return ''

            order_content = get_file_content(
                report_path + '/' + analysis_data['order'])
            report_content = get_file_content(
                report_path + '/' + analysis_data['report'])
            # save finished object to the database
            Analysis.objects.create(
                process=process, report=report_content, order=order_content).save()

    def is_started(self):
        return self.running


client = docker.from_env()

MAX_RAM = 32
MAX_CPU = 16

containerManagerThread = containerManager()


def get_running_process_ids():
    '''
    Returns:
        A list of ids of all started container processes
    '''
    return containerManagerThread.started_containers


def create_container(process):
    '''
    Creates a new Docker Container from the specified container
    Args:
        process: The process the container is based on
    Returns:
        The created container. The container has to be started manually
    '''
    # copy selected file into /files directory
    file = process.file
    ram, cpu = get_ram_and_cpu(process)
    file_name = f'{process.id}-{file.name}'
    file_path = f'../ddueruem/files/{file_name}'
    file_obj = open(file_path, 'w')
    file_obj.write(file.content)
    file_obj.close()

    container = client.containers.create(
        'ddueruem',

        command=f'./ddueruem.py files/{file_name} --lib {process.library}',
        detach=True,
        cpu_count=cpu,
        mem_limit=f'{ram}g',
        name=f'p-{process.id}',
        volumes={
            log_path: {'bind': '/ddueruem/_log', 'mode': 'rw'},
            report_path: {'bind': '/ddueruem/_reports', 'mode': 'rw'},
            f'{absolute_path}/../ddueruem/files': {'bind': '/ddueruem/files', 'mode': 'rw'},
        },
    )
    return container


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
    container = create_container(process)
    # ram, cpu, f'p-{process.id}', process.file, process.library)
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
        used_ram += process_ram
        used_cpu_cores += process_cpu
    if used_ram + ram <= MAX_RAM and used_cpu_cores + cpu <= MAX_CPU:
        # start the container
        new_container.start()
        containerManagerThread.started_containers.append(process.id)
        # make sure the manager thread is running
        if not containerManagerThread.is_started():
            containerManagerThread.start()
        return True
    return False
