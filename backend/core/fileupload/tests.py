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
    tag_label = "Tag label"
    tag_description = "Tag description"
    other_tag_label = "Other tag label"
    other_tag_description = "Other tag description"

    def setUp(self):
        self.owner = User.objects.create_superuser(email="ow@n.er", password="asdfghj")
        self.admin = User.objects.create_superuser(email="ad@m.in", password="12345678!")
        self.user = User.objects.create_user(email="u@s.er", password="!87654321")
        Tag.objects.create(label=self.tag_label, description=self.tag_description, owner=self.owner, is_public=True)
        Tag.objects.create(label=self.other_tag_label, description=self.other_tag_description, owner=self.owner, is_public=False)

    def test_tag_list(self):
        # Licenses are listable when logged in
        self.client.force_authenticate(self.owner)
        res = self.client.get("/tags/")
        json = res.json()
        self.assertEqual(len(json), 2)

        # Public licenses are listable when logged out
        self.client.force_authenticate(None)
        res = self.client.get("/tags/")
        json = res.json()
        self.assertEqual(len(json), 1)

        # Public licenses are listable when logged in as another user
        self.client.force_authenticate(None)
        res = self.client.get("/tags/")
        json = res.json()
        self.assertEqual(len(json), 1)

    def test_tag_retrieve(self):
        # Tags are retrievable as owner
        self.client.force_authenticate(self.owner)

        res = self.client.get("/tags/1/")
        json = res.json()
        self.assertEqual(json["label"], self.tag_label)
        self.assertEqual(json["description"], self.tag_description)
        self.assertEqual(json["owner"], True)
        self.assertEqual(json["is_public"], True)

        res = self.client.get("/tags/2/")
        json = res.json()
        self.assertEqual(json["label"], self.other_tag_label)
        self.assertEqual(json["description"], self.other_tag_description)
        self.assertEqual(json["owner"], True)
        self.assertEqual(json["is_public"], False)

        # Tags are retrievable as other authenticated user
        self.client.force_authenticate(self.user)

        res = self.client.get("/tags/1/")
        json = res.json()
        self.assertEqual(json["label"], self.tag_label)
        self.assertEqual(json["description"], self.tag_description)
        self.assertEqual(json["owner"], False)
        self.assertEqual(json["is_public"], True)

        # Private tags are not retrievable as other authenticated user
        res = self.client.get("/tags/2/")
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

        # Tags are retrievable as unauthenticated user
        self.client.force_authenticate(None)

        res = self.client.get("/tags/1/")
        json = res.json()
        self.assertEqual(json["label"], self.tag_label)
        self.assertEqual(json["description"], self.tag_description)
        self.assertEqual(json["owner"], False)
        self.assertEqual(json["is_public"], True)

        # Private tags are not retrievable as unauthenticated user
        res = self.client.get("/tags/2/")
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_tag_create(self):
        self.client.force_authenticate(self.owner)

        res = self.client.post("/tags/", {"label": "testlabel", "description": "testdescription", "is_public": True})
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        json = res.json()
        first_id = json["id"]
        res = self.client.get(f"/tags/{first_id}/")
        json = res.json()
        self.assertEqual(json["label"], "testlabel")
        self.assertEqual(json["description"], "testdescription")
        self.assertEqual(json["owner"], True)
        self.assertEqual(json["is_public"], True)

        res = self.client.post("/tags/", {"label": "otherlabel", "description": "otherdescription", "is_public": False})
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        json = res.json()
        second_id = json["id"]
        res = self.client.get(f"/tags/{second_id}/")
        json = res.json()
        self.assertEqual(json["label"], "otherlabel")
        self.assertEqual(json["description"], "otherdescription")
        self.assertEqual(json["owner"], True)
        self.assertEqual(json["is_public"], False)

        res = self.client.force_authenticate(None)
        res = self.client.get(f"/tags/{first_id}/")
        json = res.json()
        self.assertEqual(json["label"], "testlabel")
        self.assertEqual(json["description"], "testdescription")
        self.assertEqual(json["owner"], False)
        self.assertEqual(json["is_public"], True)

        res = self.client.get(f"/tags/{second_id}/")
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

        # Tags with is_public=True can not be created by non-admins
        self.client.force_authenticate(self.user)
        res = self.client.post("/tags/", {"label": "testlabel", "description": "testdescription", "is_public": True})
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        # Tags with is_public=False can be created by non-admins
        res = self.client.post("/tags/", {"label": "testlabel", "description": "testdescription", "is_public": False})
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        json = res.json()
        first_id = json["id"]
        res = self.client.get(f"/tags/{first_id}/")
        json = res.json()
        self.assertEqual(json["label"], "testlabel")
        self.assertEqual(json["description"], "testdescription")
        self.assertEqual(json["owner"], True)
        self.assertEqual(json["is_public"], False)

    def test_tag_destroy(self):
        # Tags are not destroyable by an unauthenticated user
        res = self.client.delete("/tags/1/")
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)
        res = self.client.get("/tags/1/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        # Tags are not destroyable by an authenticated user that is not the owner
        self.client.force_authenticate(self.user)

        res = self.client.delete("/tags/1/")
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)
        res = self.client.get("/tags/1/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        # Tags are destroyable by the owner
        self.client.force_authenticate(self.owner)

        res = self.client.delete("/tags/1/")
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        res = self.client.get("/tags/1/")
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

        # Tags are destroyable by an admin
        self.client.force_authenticate(self.admin)

        res = self.client.delete("/tags/2/")
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        res = self.client.get("/tags/2/")
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)


class FamilyTest(APITestCase):
    family_label = "Family label"
    family_description = "Family description"
    other_family_label = "Other family label"
    other_family_description = "Other family description"

    def setUp(self):
        self.owner = User.objects.create_user(email="ow@n.er", password="asdfghj")
        self.admin = User.objects.create_superuser(email="ad@m.in", password="12345678!")
        self.user = User.objects.create_user(email="u@s.er", password="!87654321")
        Family.objects.create(label=self.family_label, description=self.family_description, owner=self.owner)
        Family.objects.create(label=self.other_family_label, description=self.other_family_description, owner=self.owner)

    def test_family_list(self):
        # Families are listable when logged in
        self.client.force_authenticate(self.owner)
        res = self.client.get("/families/")
        json = res.json()
        self.assertEqual(len(json), 2)

        # Families are listable when logged out
        self.client.force_authenticate(None)
        res = self.client.get("/families/")
        json = res.json()
        self.assertEqual(len(json), 2)

    def test_family_retrieve(self):
        # Families are retrievable when logged in
        self.client.force_authenticate(self.owner)
        res = self.client.get("/families/1/")
        json = res.json()
        self.assertEqual(json["label"], self.family_label)
        self.assertEqual(json["description"], self.family_description)
        self.assertEqual(json["owner"], True)

        # Families are retrievable when logged out
        self.client.force_authenticate(None)
        res = self.client.get("/families/1/")
        json = res.json()
        self.assertEqual(json["label"], self.family_label)
        self.assertEqual(json["description"], self.family_description)
        self.assertEqual(json["owner"], False)

    def test_family_create(self):
        self.client.force_authenticate(self.owner)

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

        self.client.force_authenticate(self.user)

        res = self.client.get(f"/families/{first_id}/")
        json = res.json()
        self.assertEqual(json["label"], "testfamily")
        self.assertEqual(json["description"], "testdescription")
        self.assertEqual(json["owner"], False)

    def test_family_update(self):
        # Families are not updateable by an unauthenticated user
        res = self.client.put("/families/1/", {"label": self.other_family_label, "description": self.other_family_description})
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

        # Families are not updateable by another non-admin user
        self.client.force_authenticate(self.user)
        res = self.client.put("/families/1/", {"label": self.other_family_label, "description": self.other_family_description})
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        # Families are updatable by owner
        self.client.force_authenticate(self.owner)
        res = self.client.put("/families/1/", {"label": self.other_family_label, "description": self.other_family_description})
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        # Families are updatable by an admin
        self.client.force_authenticate(self.admin)
        res = self.client.put("/families/1/", {"label": self.other_family_label, "description": self.other_family_description})
        self.assertEqual(res.status_code, status.HTTP_200_OK)


class LicenseTest(APITestCase):
    license_label = License._default_license
    other_license_label = "Test license"

    def setUp(self):
        self.admin = User.objects.create_superuser(email="ad@m.in", password="12345678!")
        License.objects.create(label=self.license_label)
        License.objects.create(label=self.other_license_label)

    def test_license_list(self):
        # Licenses are listable when logged in
        self.client.force_authenticate(self.admin)
        res = self.client.get("/licenses/")
        json = res.json()
        self.assertEqual(len(json), 2)

        # Licenses are listable when logged out
        self.client.force_authenticate(None)
        res = self.client.get("/licenses/")
        json = res.json()
        self.assertEqual(len(json), 2)

    def test_license_retrieve(self):
        # License is retrievable when logged in
        self.client.force_authenticate(self.admin)
        res = self.client.get("/licenses/1/")
        json = res.json()
        self.assertEqual(json["label"], self.license_label)

        # License is also retrievable when logged out
        self.client.force_authenticate(None)
        res = self.client.get("/licenses/1/")
        json = res.json()
        self.assertEqual(json["label"], self.license_label)


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
