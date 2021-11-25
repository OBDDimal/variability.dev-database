from django_extensions.management.jobs import BaseJob

from core.user.models import User


class Job(BaseJob):
    """
    Sample for jobs.
    Details, see https://django-extensions.readthedocs.io/en/latest/jobs_scheduling.html#create-a-job
    """
    help = "My sample job."

    def execute(self):
        # executing empty sample job

        pass
