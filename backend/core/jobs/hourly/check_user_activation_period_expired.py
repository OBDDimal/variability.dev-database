from django_extensions.management.jobs import HourlyJob
from datetime import timedelta
from django.utils import timezone
from ddueruemweb.settings import PASSWORD_RESET_TIMEOUT_DAYS

from core.user.models import User


class Job(HourlyJob):
    help = "Check user activation period expired"

    def execute(self):
        # executing empty sample job
        print("Starting cleanup user with expired activation period...")
        User.objects.filter(is_active=False, date_joined__lte=timezone.now() - timedelta(
            hours=PASSWORD_RESET_TIMEOUT_DAYS)).order_by('date_joined').delete()
        print("Done.")
        pass
