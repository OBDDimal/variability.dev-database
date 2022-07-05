import json
import os

from pathlib import Path
from rest_framework import status
from rest_framework.test import APITestCase
from django.test.client import MULTIPART_CONTENT, encode_multipart, BOUNDARY
from django.core.files.base import ContentFile

from core.fileupload.models import Family, Tag, License, File
from core.user.models import User


class AuthenticationTest(APITestCase):
    def setUp(self):
        User.objects.create_superuser(email="ad@m.in", password="12345678!")

        # create_superuser always sets `is_active` to True
        u = User.objects.create_superuser(email="in@acti.ve", password="!87654321")
        u.is_active = False
        u.save()

        # create_user always sets `is_active` to False
        u = User.objects.create_user(email="u@s.er", password="12345678!")
        u.is_active = True
        u.save()

    def test_correct_login(self):
        res = self.client.post("/auth/login/", {'email': 'ad@m.in', 'password': '12345678!'})
        json = res.json()
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(json["user"]["email"], "ad@m.in")
        self.assertEqual(json["user"]["is_active"], True)
        self.assertIn("access", json)
        self.assertIn("refresh", json)

        res = self.client.post("/auth/login/", {"email": "u@s.er", "password": "12345678!"})
        json = res.json()
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(json["user"]["email"], "u@s.er")
        self.assertEqual(json["user"]["is_active"], True)
        self.assertIn("access", json)
        self.assertIn("refresh", json)


    def test_wrong_login(self):
        res = self.client.post("/auth/login/", {"email": "ad@m.in", "password": "123456"})
        json = res.json()
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("detail", json)


    def test_login_inactive(self):
        res = self.client.post("/auth/login/", {"email": "in@acti.ve", "password": "!87654321"})
        json = res.json()
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("detail", json)


    def test_refresh(self):
        res = self.client.post("/auth/login/", {"email": "ad@m.in", "password": "12345678!"})
        json = res.json()
        refresh = json["refresh"]

        res = self.client.post("/auth/refresh/", {"refresh": refresh})
        json = res.json()
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("access", json)

        res = self.client.post("/auth/refresh/", {"refresh": "123456789"})
        json = res.json()
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("detail", json)


class TagTest(APITestCase):
    family_label = ''
    license_label = License._default_license

    def setUp(self):
        User.objects.create_superuser(email="ad@m.in", password="12345678!")
        User.objects.create_superuser(email="u@s.er", password="!87654321")

    def test_tag_creation(self):
        self.client.login(email="ad@m.in", password="12345678!")

        res = self.client.post("/tags/", {"label": "testlabel", "description": "testdescription", "is_public": True})
        json = res.json()
        first_id = json["id"]
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        res = self.client.get(f"/tags/{first_id}/")
        json = res.json()
        self.assertEqual(json["label"], "testlabel")
        self.assertEqual(json["description"], "testdescription")
        self.assertEqual(json["owner"], True)
        self.assertEqual(json["is_public"], True)

        res = self.client.post("/tags/", {"label": "otherlabel", "description": "otherdescription", "is_public": False})
        json = res.json()
        second_id = json["id"]
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        res = self.client.get(f"/tags/{second_id}/")
        json = res.json()
        self.assertEqual(json["label"], "otherlabel")
        self.assertEqual(json["description"], "otherdescription")
        self.assertEqual(json["owner"], True)
        self.assertEqual(json["is_public"], False)

        self.client.logout()
        self.client.login(email="u@s.er", password="!87654321")

        res = self.client.get(f"/tags/{first_id}/")
        json = res.json()
        self.assertEqual(json["label"], "testlabel")
        self.assertEqual(json["description"], "testdescription")
        self.assertEqual(json["owner"], False)
        self.assertEqual(json["is_public"], True)

        #res = self.client.get(f"/tags/{second_id}/")
        #json = res.json()
        #self.assertEqual(json["label"], "otherlabel")
        #self.assertEqual(json["description"], "otherdescription")
        #self.assertEqual(json["owner"], False)
        #self.assertEqual(json["is_public"], False)


class FamilyTest(APITestCase):
    family_label = ''
    license_label = License._default_license

    def setUp(self):
        User.objects.create_superuser(email="ad@m.in", password="12345678!")

    def test_family_creation(self):
        self.client.login(email="ad@m.in", password="12345678!")

        res = self.client.post("/families/", {"label": "testfamily", "description": "testdescription"})
        json = res.json()
        first_id = json["id"]
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        res = self.client.get(f"/families/{first_id}/")
        json = res.json()
        self.assertEqual(json["label"], "testfamily")
        self.assertEqual(json["description"], "testdescription")
        self.assertEqual(json["owner"], True)

        res = self.client.post("/families/", {"label": "otherfamily", "description": "otherdescription"})
        json = res.json()
        second_id = json["id"]
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        res = self.client.get(f"/families/{second_id}/")
        json = res.json()
        self.assertEqual(json["label"], "otherfamily")
        self.assertEqual(json["description"], "otherdescription")
        self.assertEqual(json["owner"], True)

        self.client.logout()
        self.client.login(email="u@s.er", password="!87654321")

        res = self.client.get(f"/families/{first_id}/")
        json = res.json()
        self.assertEqual(json["label"], "testfamily")
        self.assertEqual(json["description"], "testdescription")
        self.assertEqual(json["owner"], False)


class FileUploadWithTagsTests(APITestCase):
    family_label = 'myTestFamily'
    license_label = License._default_license
    upload_file_content = b"""<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?>
    <featureModel>
        <properties/>
        <struct>
        </struct>
    </featureModel>"""

    def setUp(self):
        License.objects.create(label=self.license_label)
        o = User.objects.create_superuser(email="ad@m.in", password="12345678!")
        Family.objects.create(owner=o, label=self.family_label, description='Family description')
        Tag(owner=User.objects.get(email='ad@m.in'),
            label='cool',
            description='cool testing description',
            is_public=True).save()
        Tag(owner=User.objects.get(email='ad@m.in'),
            label='short',
            description='very shot desc.',
            is_public=False).save()

    def test_new_version_of(self):
        self.client.login(email="ad@m.in", password="12345678!")
        parent_file = ContentFile(self.upload_file_content, "test.xml")
        raw_data = {
            "description": "some description text",
            "label": "my_file_name",
            "local_file": parent_file,
            "family": 1,
            "license": 1,
            "tags": '[{"id": "2", "label": "Tobi"},{"id": "1", "label": "Eric Test"}]'}
        msg_as_multipart = encode_multipart(data=raw_data, boundary=BOUNDARY)
        # print(f"Raw data to user: {raw_data}")
        # print("Sending first file to backend...")
        f_res = self.client.post('/files/', msg_as_multipart,
                       content_type=MULTIPART_CONTENT)
        # print(f"\n{f_res.status_code} {f_res.content}")
        self.assertEqual(f_res.status_code, status.HTTP_201_CREATED)
        # create new version file
        new_file = ContentFile(self.upload_file_content, "test_new.xml")
        raw_data = {
            "description": "some description text",
            "label": "new_my_file_name",
            "local_file": new_file,
            "family": 1,
            "license": 1,
            "new_version_of": 1,
            "tags": '[]'}
        msg_as_multipart = encode_multipart(data=raw_data, boundary=BOUNDARY)
        # print(f"Raw data to user: {raw_data}")
        # print("Sending new version of first file to backend...")
        f_res = self.client.post('/files/', msg_as_multipart,
                       content_type=MULTIPART_CONTENT)
        # print(f"\n{f_res.status_code} {f_res.content}")
        self.assertEqual(f_res.status_code, status.HTTP_201_CREATED)

    def test_tags_required(self):
        self.client.login(email="ad@m.in", password="12345678!")
        # both ways work, difference is type of local_file before sending
        # file = SimpleUploadedFile("a/pathTo/ulFile.txt", b"File content needs to be in bytes!")
        file = ContentFile(self.upload_file_content, "test.xml")
        raw_data = {
            "description": "some description text",
            "label": "my_file_name",
            "local_file": file,
            "family": 1,
            "license": 1,
            # only the tag ids are used internally. labels wont be checked and will be overwritten by the tag labels
            # in database
            "tags": '[{"id": "2", "label": "Tobi"},{"id": "1", "label": "Eric Test"}]'}
        msg_as_multipart = encode_multipart(data=raw_data, boundary=BOUNDARY)
        # MULTIPART_CONTENT == multipart/form-data; boundary=BoUnDaRyStRiNg
        # print(f"Raw data to user: {raw_data}")
        # print("Sending data to backend...")
        f_res = self.client.post('/files/', msg_as_multipart,
                       content_type=MULTIPART_CONTENT)
        # print(f"\n{f_res.status_code} {f_res.content}")
        self.assertEqual(f_res.status_code, status.HTTP_201_CREATED)

    def test_create_G6_after_upload(self):
        self.client.login(email="ad@m.in", password="12345678!")
        # prepare to upload xmlExamples/npc.xml
        path = f"{Path(__file__).resolve().parent.parent.parent}{os.path.sep}transpiler{os.path.sep}xmlExamples{os.path.sep}"
        file_content = ''
        with open(path + 'npc.xml', 'r') as file:
            file_content = file.read().replace('\n', '')
        file = ContentFile(bytes(file_content, encoding='utf8'), "test.xml")
        raw_data = {
            "description": "some description text",
            "label": "my_file_name",
            "local_file": file,
            "family": 1,
            "license": 1,
            "tags": '[{"id": "2", "label": "short"},{"id": "1", "label": "cool"}]'}
        msg_as_multipart = encode_multipart(data=raw_data, boundary=BOUNDARY)
        # MULTIPART_CONTENT == multipart/form-data; boundary=BoUnDaRyStRiNg
        # print(f"Raw data to user: {raw_data}")
        # print("Sending data to backend...")
        f_res = self.client.post('/files/', msg_as_multipart,
                       content_type=MULTIPART_CONTENT)
        # print(f"\n{f_res.status_code} {f_res.content}")
        self.assertEqual(f_res.status_code, status.HTTP_201_CREATED)
