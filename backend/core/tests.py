from datetime import timedelta
from django.test import TestCase
from django.utils import timezone
from core.user.models import User


# details, see https://docs.djangoproject.com/en/3.2/topics/testing/overview/
# When tests interactive with db use  import django.test.TestCase rather than unittest.TestCase
class UserModelTests(TestCase):
    def setUp(self):
        User.objects.create_superuser(email="a@dm.in", password="00")
        User.objects.create_staffuser(email="mo@derat.or", password="01")
        User.objects.create_user(email="u@s.er", password="10")

    def test_create_new_user(self):
        expected_id = 4
        expected_email = "newu@s.er"
        expected_pw = "10"
        user = User.objects.create_user(email=expected_email, password=expected_pw)
        self.assertIs(user.id, expected_id)
        self.assertEqual(user.email, expected_email)
        self.assertFalse(user.is_active)
        self.assertFalse(user.is_staff)
        self.assertIn(user.date_joined, [timezone.now() - timedelta(seconds=1), timezone.now()])
        self.assertIsNotNone(user.institute)
        self.assertIsNotNone(user.bio)
