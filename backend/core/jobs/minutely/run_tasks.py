from django_extensions.management.jobs import MinutelyJob
from datetime import timedelta
from django.utils import timezone

from core.user.models import run_tasks
from ddueruemweb.settings import PASSWORD_RESET_TIMEOUT_DAYS
import logging

logger = logging.getLogger(__name__)


class Job(MinutelyJob):
    """
    This job runs every minute and runs all background tasks.
    """
    help = "Run background tasks"

    def execute(self):
        logger.info("[CRONJOB] Starting task runner...")
        run_tasks()
        logger.info("[CRONJOB] Done.")
        pass
