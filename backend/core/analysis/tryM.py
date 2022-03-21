import logging
import os
import time

from pathlib import Path
from threading import Thread

from core.analysis.docker_utils import get_containers

logging.basicConfig(level=logging.DEBUG,
                    format='[%(levelname)s] (%(threadName)-10s) %(message)s',
                    )
logger = logging.getLogger(__name__)


class MonitorContainerWorker(Thread):

    def __init__(self, work_dir, process):
        Thread.__init__(self)
        self.running = False
        self.work_dir = work_dir
        self.process = process
        self.size_of_reports = {}

    def check_reports(self):
        work_dir = f'{self.work_dir}{os.path.sep}reports'
        file_names = [f for f in os.listdir(work_dir) if os.path.isfile(os.path.join(work_dir, f))]
        # structure is file name : size in bytes
        current_reports = {}
        for name in file_names:
            current_reports.update({name: Path(f"{work_dir}{os.path.sep}{name}").stat().st_size})
        if len(self.size_of_reports) == 0:
            self.size_of_reports = current_reports
        else:
            # check if file size of already present reports has changed
            old_reports = self.size_of_reports
            updated_reports = {}
            for key in old_reports:
                if old_reports[key] != current_reports[key]:
                    updated_reports.update({key: current_reports[key]})
            # TODO: should not be a set here
            new_reports = current_reports.keys() - old_reports
            logger.debug(
                f"old: {old_reports}\ncurrent: {current_reports}\nupdated: {updated_reports}\nnew: {new_reports}")
            return True

    def run(self):
        self.running = True
        while self.running:
            time.sleep(1)
            # update_finished containers
            process_containers = get_containers()
            logger.debug(process_containers)
            self.check_reports()


    def __str__(self):
        # do not change that
        return f"t-{self.process.id}"
