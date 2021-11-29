from datetime import timedelta
from django.core import mail
from django.core.exceptions import ObjectDoesNotExist
from django.test import TestCase
from django.utils import timezone
from core.user.models import User
from ddueruemweb.settings import PASSWORD_RESET_TIMEOUT_DAYS
from core.jobs.hourly.check_user_activation_period_expired import Job as InactiveUserJob


# ####################### DJANGO TESTS #######################
# details, see https://docs.djangoproject.com/en/3.2/topics/testing/overview/
# When tests interactive with db use  import django.test.TestCase rather than unittest.TestCase
class UserModelTests(TestCase):
    """
    Tests for User and UserManager methods
    """

    # def setUp(self):
    # stuff before each test

    def test_save_user_to_db(self):
        expected_id = 1
        expected_email = "newu@s.er"
        expected_pw = "12345678!"
        user = User.objects.save_user(email=expected_email, password=expected_pw)
        self.assertIs(user.id, expected_id)
        self.assertEqual(user.email, expected_email)
        self.assertFalse(user.is_active)
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)
        self.assertTrue(timezone.now() - timedelta(seconds=1) <= user.date_joined <= timezone.now())
        self.assertIsNotNone(user.institute)
        self.assertIsNotNone(user.bio)

    def test_save_user_to_db_invalid(self):
        expected_email = None
        expected_pw = "12345678!"
        with self.assertRaises(TypeError, msg='Email for user is not set'):
            User.objects.save_user(email=expected_email, password=expected_pw)
        expected_email = "newu@s.er"
        expected_pw = None
        with self.assertRaises(TypeError, msg='Password for user is not set'):
            User.objects.save_user(email=expected_email, password=expected_pw)
        expected_email = None
        expected_pw = None
        with self.assertRaises(TypeError, msg='Email for user is not set'):
            User.objects.save_user(email=expected_email, password=expected_pw)

    def test_create_new_user_ignore_presetted_flags(self):
        expected_id = 1
        expected_email = "newu@s.er"
        expected_pw = "12345678!"
        user = User.objects.create_user(email=expected_email, password=expected_pw,
                                        is_superuser=True, is_active=True, is_staff=True)
        self.assertIs(user.id, expected_id)
        self.assertEqual(user.email, expected_email)
        self.assertFalse(user.is_active)
        self.assertFalse(user.is_staff)
        self.assertTrue(timezone.now() - timedelta(seconds=1) <= user.date_joined <= timezone.now())
        self.assertIsNotNone(user.institute)
        self.assertIsNotNone(user.bio)

    def test_create_new_staffuser_ignore_presetted_flags(self):
        expected_id = 1
        expected_email = "newstaffu@s.er"
        expected_pw = "1234567a!"
        user = User.objects.create_staffuser(email=expected_email, password=expected_pw,
                                             is_superuser=True, is_active=True, is_staff=False)
        self.assertIs(user.id, expected_id)
        self.assertEqual(user.email, expected_email)
        self.assertFalse(user.is_active)
        self.assertTrue(user.is_staff)
        self.assertTrue(timezone.now() - timedelta(seconds=1) <= user.date_joined <= timezone.now())
        self.assertIsNotNone(user.institute)
        self.assertIsNotNone(user.bio)

    def test_create_new_superuser_ignore_presetted_flags(self):
        expected_id = 1
        expected_email = "newsuperu@s.er"
        expected_pw = "1234567b?"
        user = User.objects.create_superuser(email=expected_email, password=expected_pw,
                                             is_superuser=False, is_active=False, is_staff=False)
        self.assertIs(user.id, expected_id)
        self.assertEqual(user.email, expected_email)
        self.assertTrue(user.is_active)
        self.assertTrue(user.is_staff)
        self.assertTrue(timezone.now() - timedelta(seconds=1) <= user.date_joined <= timezone.now())
        self.assertIsNotNone(user.institute)
        self.assertIsNotNone(user.bio)

    def test_create_and_email_user(self):
        expected_receiver_email = "newu@s.er"
        expected_pw = "12345678!"
        expected_sender_email = "sender@ema.il"
        expected_subject = "Subject: Test"
        expected_message = "Hello World"

        user = User.objects.create_user(email=expected_receiver_email, password=expected_pw)
        self.assertEqual(user.email, expected_receiver_email)
        user.email_user(subject=expected_subject, message=expected_message, from_email=expected_sender_email)
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].from_email, expected_sender_email)
        self.assertEqual(mail.outbox[0].to, [expected_receiver_email])
        self.assertEqual(mail.outbox[0].subject, expected_subject)
        self.assertEqual(mail.outbox[0].body, expected_message)

    def test_delete_expired_users(self):
        expected_email = "newu@s.er"
        # join date is exactly PASSWORD_RESET_TIMEOUT_DAYS days ago
        expected_date_joined = timezone.now() - timedelta(days=PASSWORD_RESET_TIMEOUT_DAYS)
        self.create_user_with_date_joined(expected_email, expected_date_joined)
        InactiveUserJob().execute()
        self.assertRaises(ObjectDoesNotExist, User.objects.get, email=expected_email)

        # user activation period expired 30 minutes ago
        expected_date_joined = timezone.now() - timedelta(minutes=30) - timedelta(days=PASSWORD_RESET_TIMEOUT_DAYS)
        self.create_user_with_date_joined(expected_email, expected_date_joined)
        InactiveUserJob().execute()
        self.assertRaises(ObjectDoesNotExist, User.objects.get, email=expected_email)

        # user activation period expired 7 days ago
        expected_date_joined = timezone.now() - timedelta(minutes=30) - timedelta(days=PASSWORD_RESET_TIMEOUT_DAYS)
        self.create_user_with_date_joined(expected_email, expected_date_joined)
        InactiveUserJob().execute()
        self.assertRaises(ObjectDoesNotExist, User.objects.get, email=expected_email)

    def test_keep_inactive_user_within_activation_period(self):
        expected_email = "newu@s.er"
        # user joined a view seconds ago
        expected_date_joined = timezone.now() - timedelta(seconds=30)
        self.create_user_with_date_joined(expected_email, expected_date_joined)
        InactiveUserJob().execute()
        user_from_db = User.objects.get(email=expected_email)
        self.assertFalse(user_from_db.is_active)
        self.assertEqual(expected_date_joined, user_from_db.date_joined)
        # reset changes for following tests
        User.objects.filter(email=expected_email).delete()

        # user joined an hour ago
        expected_date_joined = timezone.now() - timedelta(hours=1)
        self.create_user_with_date_joined(expected_email, expected_date_joined)
        InactiveUserJob().execute()
        user_from_db = User.objects.get(email=expected_email)
        self.assertFalse(user_from_db.is_active)
        self.assertEqual(expected_date_joined, user_from_db.date_joined)
        # reset changes for following tests
        User.objects.filter(email=expected_email).delete()

        # user joined a day ago
        expected_date_joined = timezone.now() - timedelta(days=1)
        self.create_user_with_date_joined(expected_email, expected_date_joined)
        InactiveUserJob().execute()
        user_from_db = User.objects.get(email=expected_email)
        self.assertFalse(user_from_db.is_active)
        self.assertEqual(expected_date_joined, user_from_db.date_joined)
        # reset changes for following tests
        User.objects.filter(email=expected_email).delete()

        # user has 30 min left to activate the account
        expected_date_joined = timezone.now() + timedelta(minutes=30) - timedelta(days=PASSWORD_RESET_TIMEOUT_DAYS)
        self.create_user_with_date_joined(expected_email, expected_date_joined)
        InactiveUserJob().execute()
        user_from_db = User.objects.get(email=expected_email)
        self.assertFalse(user_from_db.is_active)
        self.assertEqual(expected_date_joined, user_from_db.date_joined)
        # reset changes for following tests
        User.objects.filter(email=expected_email).delete()

    def test_keep_active_user(self):
        expected_email = "newu@s.er"
        user = User.objects.save_user(email=expected_email, password="12345678!", is_active=True)
        self.assertTrue(user.is_active)
        InactiveUserJob().execute()
        User.objects.get(email=expected_email)

    # ####################### Util methods #######################
    @staticmethod
    def create_user_with_date_joined(user_email, date_joined):
        """
        Creates user with an given join date and returns the created user
        """
        expected_pw = "12345678!"
        user = User.objects.create_user(email=user_email, password=expected_pw)
        user.date_joined = date_joined
        user.save()
        pass
