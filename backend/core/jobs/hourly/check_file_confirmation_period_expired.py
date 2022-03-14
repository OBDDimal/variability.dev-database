from django_extensions.management.jobs import HourlyJob
from datetime import timedelta
from django.utils import timezone

from core.fileupload.models import File
from ddueruemweb.settings import PASSWORD_RESET_TIMEOUT_DAYS
import logging

logger = logging.getLogger(__name__)


class Job(HourlyJob):
    """
    This job runs every hour and removes all inactive users where
    the activation period has passed.
    """
    help = "Check file confirmation period expired"

    def execute(self):
        logger.info("[CRONJOB] Starting cleanup file with expired confirmation period...")
        File.objects.filter(is_confirmed=False,
                            uploaded_at__lte=timezone.now() - timedelta(days=PASSWORD_RESET_TIMEOUT_DAYS)).delete()
        logger.info("[CRONJOB] Done.")
        pass
