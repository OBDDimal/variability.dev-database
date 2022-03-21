from django.db import models
from core.user.models import User


class Family(models.Model):
    """
    Data Model for a Feature Model Family in the backend.
    A Feature Model Family consists of 1 to n Feature Models.
    """

    owner = models.ForeignKey(User, on_delete=models.RESTRICT)
    label = models.CharField(blank=False, max_length=255)
    description = models.TextField(blank=True)

    class Meta:
        verbose_name = 'family'
        verbose_name_plural = 'families'

    def __str__(self):
        # do not change that
        return f"{self.id}:{self.label}"
