import logging
import os
import threading
import time

from core.analysis.models import DockerProcess, Analysis

logging.basicConfig(level=logging.DEBUG,
                    format='[%(levelname)s] (%(threadName)-10s) %(message)s',
                    )
logger = logging.getLogger(__name__)


class MonitorContainerThread(threading.Thread):
    """
    Run container and write report to database when finished
    """

    # private fields self.
    # queued_containers
    # started_containers

    def __init__(self):
        logger.debug("Starting thread")
        threading.Thread.__init__(self)
        self.running = False
        self.queued_containers = []
        # Note: only stores the process ids, not the actual containers
        self.started_containers = []
        logger.debug("Starting Done")

    def run(self):
        """
        Starts the process that actively monitors the running containers
        """
        self.running = True
        while self.running:
            # check for any processes that might have ended
            print('running')
            self.update_finished_processes()
            # stop the thread if there are no more processes to queue
            if len(self.queued_containers) == 0:
                # but only if all started processes already finished
                if len(self.started_containers) > 0:
                    time.sleep(1)
                    continue
                self.running = False
                return
            container = self.queued_containers[0]
            # get process to the container
            container_id = int(container.name.split('-')[1])
            process = DockerProcess.objects.get(pk=container_id)
            if False:
                # if start_process(container, process):
                self.queued_containers = self.queued_containers[1:]
            else:
                # wait a second then check again
                time.sleep(1)

    def update_finished_processes(self):
        """
        Checks the output directories for output files of running processes,
        and if all of them are available, adds them to the
        database and confirms that the process was stopped
        """
        # dictionary to keep track of all new files
        print('update_finished')
        new_analysis = dict([(id, {'report': '', 'order': '', 'changed': False})
                             for id in self.started_containers])
        # all files in the output directory
        """
        reports = [file for file in os.listdir(report_path) if os.path.isfile(f'{report_path}/{file}')]
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
                #Reads an entire file and returns its content as a UTF-8 string
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
        """
        pass

    def is_started(self):
        return self.running
