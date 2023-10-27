from datetime import timedelta
from time import sleep
from django.core import mail
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.exceptions import ObjectDoesNotExist
from django.test import TestCase, Client
from django.utils import timezone

from core.fileupload.models import Tag, Family, File, License, Analysis, AnalysisResult
from django.core.files.base import ContentFile
from core.fileupload.utils import get_triggerable_analyses
from core.user.models import User, EmailSendTask, run_tasks
from ddueruemweb.settings import PASSWORD_RESET_TIMEOUT_DAYS
from core.jobs.hourly.check_user_activation_period_expired import Job as InactiveUserJob


# ####################### MODEL TESTS #######################
# details, see https://docs.djangoproject.com/en/3.2/topics/testing/overview/
# When tests interact with the database use `import django.test.TestCase` rather than `unittest.TestCase`
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
        user._email_user(subject=expected_subject, message=expected_message, from_email=expected_sender_email)
        # run_tasks is usually executed regularly by a background process, but we have to run it manually during tests
        run_tasks()
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(len(EmailSendTask.objects.all()), 0)

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
        Creates user with a given join date and returns the created user
        """
        expected_pw = "12345678!"
        user = User.objects.create_user(email=user_email, password=expected_pw)
        user.date_joined = date_joined
        user.save()
        pass


class AnalysisTests(TestCase):
    license_label = License._default_license
    family_label = "Family label"
    family_description = "Family description"
    tag_label = "Tag label"
    tag_description = "Tag description"
    other_tag_label = "Other tag label"

    file_label = "File label"
    file_description = "File description"
    file_version = "1.0.0"
    file_content = b"""<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?>
    <featureModel>
        <properties/>
        <struct>
        </struct>
    </featureModel>"""

    def setUp(self):
        self.owner = User.objects.create_superuser(email="ow@n.er", password="asdfghj")
        self.license = License.objects.create(label=self.license_label)
        self.family = Family.objects.create(
            label=self.family_label,
            description=self.family_description,
            owner=self.owner,
        )
        self.tag = Tag.objects.create(
            label=self.tag_label,
            description=self.tag_description,
            owner=self.owner,
            is_public=True,
        )
        self.file = File.objects.create(
            owner=self.owner,
            label=self.file_label,
            description=self.file_description,
            tags=[self.tag],
            version=self.file_version,
            license=self.license,
            local_file=ContentFile(self.file_content, "file.xml"),
            family=self.family,
        )

    def assertQuerySetEquals(self, queryset, expected):
        """Checks if all expected results are in the queryset and all elements in the queryset are expected."""
        ids = [analysis_result.id for analysis_result in queryset]

        for id in ids:
            self.assertIn(id, expected)

        for expected_id in expected:
            self.assertIn(expected_id, ids)


    def test_get_triggerable_analyses(self):
        first_analysis = Analysis()
        first_analysis.save()
        first_analysis_result = AnalysisResult(file_id=self.file.id, analysis_id=first_analysis.id, result="\{\}")
        first_analysis_result.save()

        second_analysis = Analysis()
        second_analysis.save()
        second_analysis_result = AnalysisResult(file_id=self.file.id, analysis_id=second_analysis.id,  result="\{\}")
        second_analysis_result.save()

        third_analysis = Analysis()
        third_analysis.save()
        third_analysis.depends_on.add(first_analysis)
        third_analysis.depends_on.add(second_analysis)
        third_analysis_result = AnalysisResult(file_id=self.file.id, analysis_id=third_analysis.id)
        third_analysis_result.save()

        fourth_analysis = Analysis()
        fourth_analysis.save()
        fourth_analysis.depends_on.add(third_analysis)
        fourth_analysis_result = AnalysisResult(file_id=self.file.id, analysis_id=fourth_analysis.id)
        fourth_analysis_result.save()

        fifth_analysis = Analysis()
        fifth_analysis.save()
        fifth_analysis.depends_on.add(first_analysis)
        fifth_analysis.depends_on.add(second_analysis)
        fifth_analysis.depends_on.add(third_analysis)
        fifth_analysis_result = AnalysisResult(file_id=self.file.id, analysis_id=fifth_analysis.id)
        fifth_analysis_result.save()

        self.assertQuerySetEquals(get_triggerable_analyses(), [first_analysis_result.id, second_analysis_result.id, third_analysis_result.id])

    def test_get_triggerable_analyses_empty(self):
        self.assertQuerySetEquals(get_triggerable_analyses(), [])

    def test_get_triggerable_analyses_one(self):
        first_analysis = Analysis()
        first_analysis.save()
        first_analysis_result = AnalysisResult(file_id=self.file.id, analysis_id=first_analysis.id)
        first_analysis_result.save()

        self.assertQuerySetEquals(get_triggerable_analyses(), [first_analysis_result.id])

    def test_get_triggerable_analyses_non_dependent(self):
        first_analysis = Analysis()
        first_analysis.save()
        first_analysis_result = AnalysisResult(file_id=self.file.id, analysis_id=first_analysis.id)
        first_analysis_result.save()

        second_analysis = Analysis()
        second_analysis.save()
        second_analysis_result = AnalysisResult(file_id=self.file.id, analysis_id=second_analysis.id)
        second_analysis_result.save()

        self.assertQuerySetEquals(get_triggerable_analyses(), [first_analysis_result.id, second_analysis.id])

    def test_get_triggerable_analyses_dependent(self):
        first_analysis = Analysis()
        first_analysis.save()
        first_analysis_result = AnalysisResult(file_id=self.file.id, analysis_id=first_analysis.id)
        first_analysis_result.save()

        second_analysis = Analysis()
        second_analysis.save()
        second_analysis.depends_on.add(first_analysis)
        second_analysis_result = AnalysisResult(file_id=self.file.id, analysis_id=second_analysis.id)
        second_analysis_result.save()

        self.assertQuerySetEquals(get_triggerable_analyses(), [first_analysis_result.id])

    def test_get_triggerable_analyses_dependent_done(self):
        first_analysis = Analysis()
        first_analysis.save()
        first_analysis_result = AnalysisResult(file_id=self.file.id, analysis_id=first_analysis.id, result="\{\}")
        first_analysis_result.save()

        second_analysis = Analysis()
        second_analysis.save()
        second_analysis.depends_on.add(first_analysis)
        second_analysis_result = AnalysisResult(file_id=self.file.id, analysis_id=second_analysis.id)
        second_analysis_result.save()

        self.assertQuerySetEquals(get_triggerable_analyses(), [first_analysis_result.id, second_analysis_result.id])


# ####################### SINGLE ADMIN PANEL TESTS #######################
# Many tests could profit of build in Selenium support
# https://docs.djangoproject.com/en/dev/topics/testing/tools/#testing-responses
class UserAdminPanelTests(TestCase):
    """
    Tests for the admin panel. These tests require a working User model.
    """
    client = Client()

    def setUp(self):
        superuser = User.objects.create_superuser(email="ad@m.in", password="12345678!")  # is_active per default
        User.objects.create_staffuser(email="st@a.ff", password="12345678!")
        User.objects.create_user(email="du@s.er", password="12345678!")
        active_user = User.objects.create_user(email="au@s.er", password="12345678!")
        active_user.is_active = True
        active_user.save()
        self.assertIs(len(User.objects.all()), 4)

    def test_valid_logins(self):
        client = self.client
        # if login was successful, admin panel does a redirect (302) otherwise it returns 200
        self.assertEqual(
            client.post('/admin/login/?next=/admin/', {'username': 'ad@m.in', 'password': '12345678!'}).status_code,
            302)
        staff_user = User.objects.get(email='st@a.ff')
        staff_user.is_active = True
        staff_user.save()
        self.assertEqual(
            client.post('/admin/login/?next=/admin/', {'username': 'st@a.ff', 'password': '12345678!'}).status_code,
            302)

    def test_invalid_logins(self):
        client = self.client
        self.assertEqual(
            client.post('/admin/login/?next=/admin/', {'username': 'du@s.er', 'password': '12345678!'}).status_code,
            200)
        self.assertEqual(
            client.post('/admin/login/?next=/admin/', {'username': 'au@s.er', 'password': '12345678!'}).status_code,
            200)
        # staff user is still inactive, so no login to admin panel
        self.assertEqual(
            client.post('/admin/login/?next=/admin/', {'username': 'st@a.ff', 'password': '12345678!'}).status_code,
            200)

    def test_routes_accessible(self):
        client = self.client
        user = User.objects.get(email='ad@m.in')
        response = client.post('/admin/login/?next=/admin/', {'username': user.email, 'password': '12345678!'})
        self.assertEqual(response.status_code, 302)
        self.assertEqual(client.get(f'/admin/').status_code, 200)
        # -----CORE_USER-----
        self.assertEqual(client.get(f'/admin/core_user/user/').status_code, 200)
        # filter by superuser flag
        self.assertEqual(client.get(f'/admin/core_user/user/?is_superuser__exact=1').status_code, 200)
        self.assertEqual(client.get(f'/admin/core_user/user/add/').status_code, 200)
        # routes for changing yourself
        self.assertEqual(client.get(f'/admin/core_user/user/{user.id}/change/').status_code, 200)
        self.assertEqual(client.get(f'/admin/core_user/user/{user.id}/history/').status_code, 200)
        # routes for changing another user
        other_user_id = User.objects.get(email="du@s.er").id
        self.assertEqual(client.get(f'/admin/core_user/user/{other_user_id}/change/').status_code, 200)
        self.assertEqual(client.get(f'/admin/core_user/user/{other_user_id}/history/').status_code, 200)


class FileAdminPanelTests(TestCase):
    """
    Tests for the admin panel. These tests require a working User and File model.
    """
    client = Client()
    family_label = 'myTestFamily'
    license_label = License._default_license

    def setUp(self):
        License.objects.create(label=self.license_label)  # there should only be 1 license present
        o = User.objects.create_superuser(email="ad@m.in", password="12345678!")  # is_active per default
        Family.objects.create(owner=o, label=self.family_label,
                              description='some description')  # there should only be 1 family present
        self.assertIs(len(User.objects.all()), 1)
        # if login was successful, admin panel does a redirect (302) otherwise it returns 200
        self.assertEqual(self.client.post('/admin/login/?next=/admin/',
                                          {'username': 'ad@m.in', 'password': '12345678!'}).status_code, 302)

    def test_add_alter_delete_single_file(self):
        self.assertIs(len(File.objects.all()), 0)
        # add a file
        f = File()
        expected_owner = User.objects.get(email='ad@m.in')
        expected_description = 'A binary test file'
        f.owner = expected_owner
        f.family = Family.objects.get(pk=1)
        f.description = expected_description
        f.license = License.objects.get(pk=1)
        f.local_file = SimpleUploadedFile("a/pathTo/ulFile.txt", b"File content needs to be in bytes!")
        f.save()
        self.assertIs(len(File.objects.all()), 1)
        f = File.objects.get(id=1)
        self.assertEqual(f.owner, expected_owner)
        self.assertEqual(f.description, expected_description)
        self.assertEqual(f.license.label, self.license_label)
        self.assertEqual(f.family.label, self.family_label)
        self.assertEqual(f.version, None)
        # how many tags are there ?
        self.assertEqual(len(f.tags.all()), 0)
        now = timezone.now()
        self.assertTrue(now - timedelta(seconds=1) <= f.uploaded_at <= now)
        # alter added file
        f = File.objects.get(id=1)
        expected_description = 'new description'
        f.description = expected_description
        f.save()
        f = File.objects.get(id=1)
        self.assertEqual(f.description, expected_description)
        # delete file
        self.assertIs(len(File.objects.all()), 1)
        File.objects.get(id=1).delete()
        self.assertIs(len(File.objects.all()), 0)

    def test_file_routes_accessible(self):
        client = self.client
        user = User.objects.get(email='ad@m.in')
        self.assertEqual(client.get(f'/admin/core_fileupload/file/').status_code, 200)
        self.assertEqual(client.get(f'/admin/core_fileupload/file/add/').status_code, 200)
        # add file
        f = File()
        f.owner = User.objects.get(email='ad@m.in')
        f.description = 'A binary test file'
        f.license = License.objects.get(pk=1)
        f.family = Family.objects.get(pk=1)
        f.local_file = SimpleUploadedFile("a/pathTo/ulFile.txt", b"File content needs to be in bytes!")
        f.save()
        # try to change the only file which is uploaded
        self.assertIs(len(File.objects.all()), 1)
        self.assertEqual(client.get(f'/admin/core_fileupload/file/1/change/').status_code, 200)
        self.assertEqual(client.get(f'/admin/core_fileupload/file/1/history/').status_code, 200)


class TagAdminPanelTests(TestCase):
    """
    Tests for the admin panel. These tests require a working User, File and Tag model.
    """
    client = Client()
    family_label = 'myTestFamily'
    license_label = License._default_license

    def setUp(self):
        License.objects.create(label=self.license_label)  # there should only be 1 license present
        o = User.objects.create_superuser(email="ad@m.in", password="12345678!")  # is_active per default
        Family.objects.create(owner=o, label=self.family_label,
                              description='some description')  # there should only be 1 family present
        User.objects.create_staffuser(email="st@a.ff", password="12345678!")
        User.objects.create_user(email="du@s.er", password="12345678!")
        active_user = User.objects.create_user(email="au@s.er", password="12345678!")
        active_user.is_active = True
        active_user.save()
        self.assertIs(len(User.objects.all()), 4)
        # if login was successful, admin panel does a redirect (302) otherwise it returns 200
        self.assertEqual(self.client.post('/admin/login/?next=/admin/',
                                          {'username': 'ad@m.in', 'password': '12345678!'}).status_code, 302)

    def test_add_alter_delete_single_tag(self):
        self.assertIs(len(Tag.objects.all()), 0)
        expected_label = 'testingTag'
        # add a tag
        t = Tag()
        t.owner = User.objects.get(email='ad@m.in')
        t.label = expected_label
        t.description = ''
        t.is_public = True
        t.save()
        self.assertIs(len(Tag.objects.all()), 1)
        t = Tag.objects.get(id=1)
        self.assertEqual(t.label, expected_label)
        self.assertIsNotNone(t.description)
        self.assertEqual(t.description, '')
        self.assertTrue(t.is_public)
        now = timezone.now()
        self.assertTrue(now - timedelta(seconds=1) <= t.date_created <= now)
        # alter added tag
        expected_description = 'use this tag only for ...'
        t = Tag.objects.get(id=1)
        expected_label = 'new testingTag'
        t.label = expected_label
        t.description = expected_description
        t.save()
        t = Tag.objects.get(id=1)
        self.assertEqual(t.label, expected_label)
        self.assertEqual(t.description, expected_description)
        # delete tag
        self.assertIs(len(Tag.objects.all()), 1)
        Tag.objects.get(id=1).delete()
        self.assertIs(len(Tag.objects.all()), 0)

    def test_tag_routes_accessible(self):
        client = self.client
        user = User.objects.get(email='ad@m.in')
        self.assertEqual(client.get(f'/admin/core_fileupload/tag/').status_code, 200)
        self.assertEqual(client.get(f'/admin/core_fileupload/tag/add/').status_code, 200)
        # add tag
        t = Tag()
        t.label = 'testTag'
        t.owner = user
        t.is_public = True
        t.save()
        # try to change the only file which is uploaded
        self.assertIs(len(Tag.objects.all()), 1)
        self.assertEqual(client.get(f'/admin/core_fileupload/tag/1/change/').status_code, 200)
        self.assertEqual(client.get(f'/admin/core_fileupload/tag/1/history/').status_code, 200)

    def test_tag_a_file(self):
        client = self.client
        user = User.objects.get(email='ad@m.in')
        f = File()
        expected_description = 'A binary test file'
        f.owner = user
        f.description = expected_description
        f.license = License.objects.get(pk=1)
        f.family = Family.objects.get(pk=1)
        f.local_file = SimpleUploadedFile("a/pathTo/ulFile.txt", b"File content needs to be in bytes!")
        f.save()
        self.assertIs(len(File.objects.all()), 1)
        t = Tag()
        t.label = 'testTag'
        t.owner = user
        t.is_public = True
        t.save()
        self.assertIs(len(Tag.objects.all()), 1)
        self.assertEqual(client.get(f'/admin/core_fileupload/file/1/change/').status_code, 200)
        f = File.objects.get(id=1)
        f.tags.add(t)
        f.save()
        f = File.objects.get(id=1)
        self.assertEqual(f.tags.get(id=1), t)
