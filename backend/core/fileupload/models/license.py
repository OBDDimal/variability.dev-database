from django.db import models


class LicenseManager(models.Manager):
    use_in_migrations = True

    def create(self, **kwargs):
        """
        Creates a license. Only admins/staff should be allowed to that.
        Since checking staff_required here is difficult, the serializer
        checks the permissions.
        """
        if kwargs.get('label', None) is None:
            raise TypeError('License label is not set')
        lic = self.model(**kwargs)
        lic.save()
        return lic


class License(models.Model):
    """
    Data Model for a license in the backend
    """
    objects = LicenseManager()
    _default_license = 'CC BY - Mention'

    label = models.TextField(blank=False, default=_default_license)

    def __str__(self):
        # do not change that
        return f"{self.id}"
