import json
import os
import io
import zipfile

from pathlib import Path
from rest_framework import status
from rest_framework.test import APITestCase
from django.test.client import MULTIPART_CONTENT, encode_multipart, BOUNDARY
from django.test import override_settings
from django.core.files.base import ContentFile

from core.fileupload.models import Family, Tag, License, File
from core.fileupload.utils import generate_random_string
from core.fileupload.viewsets import BulkUploadApiView
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

    def test_correct_login_admin(self):
        res = self.client.post(
            "/auth/login/", {"email": "ad@m.in", "password": "12345678!"}
        )
        json = res.json()
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(json["user"]["email"], "ad@m.in")
        self.assertEqual(json["user"]["is_active"], True)
        self.assertIn("access", json)
        self.assertIn("refresh", json)

    def test_correct_login_user(self):
        res = self.client.post(
            "/auth/login/", {"email": "u@s.er", "password": "12345678!"}
        )
        json = res.json()
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(json["user"]["email"], "u@s.er")
        self.assertEqual(json["user"]["is_active"], True)
        self.assertIn("access", json)
        self.assertIn("refresh", json)

    def test_wrong_login_admin(self):
        res = self.client.post(
            "/auth/login/", {"email": "ad@m.in", "password": "123456"}
        )
        json = res.json()
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("detail", json)

    def test_wrong_login_user(self):
        res = self.client.post(
            "/auth/login/", {"email": "u@s.er", "password": "123456"}
        )
        json = res.json()
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("detail", json)

    def test_login_inactive(self):
        res = self.client.post(
            "/auth/login/", {"email": "in@acti.ve", "password": "!87654321"}
        )
        json = res.json()
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("detail", json)

    def test_refresh_admin(self):
        res = self.client.post(
            "/auth/login/", {"email": "ad@m.in", "password": "12345678!"}
        )
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

    def test_refresh_user(self):
        res = self.client.post(
            "/auth/login/", {"email": "u@s.er", "password": "12345678!"}
        )
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
        self.admin = User.objects.create_superuser(
            email="ad@m.in", password="12345678!"
        )
        self.user = User.objects.create_user(email="u@s.er", password="!87654321")
        Tag.objects.create(
            label=self.tag_label,
            description=self.tag_description,
            owner=self.owner,
            is_public=True,
        )
        Tag.objects.create(
            label=self.other_tag_label,
            description=self.other_tag_description,
            owner=self.owner,
            is_public=False,
        )

    def test_tag_list_logged_in_owner(self):
        # Licenses are listable when logged in
        self.client.force_authenticate(self.owner)
        res = self.client.get("/tags/")
        json = res.json()
        self.assertEqual(len(json), 2)

    def test_tag_list_logged_in_admin(self):
        # Licenses are listable when logged in
        self.client.force_authenticate(self.admin)
        res = self.client.get("/tags/")
        json = res.json()
        self.assertEqual(len(json), 2)

    def test_tag_list_logged_out(self):
        # Public licenses are listable when logged out
        res = self.client.get("/tags/")
        json = res.json()
        self.assertEqual(len(json), 1)

    def test_tag_list_logged_in_other_user(self):
        # Public licenses are listable when logged in as another user
        self.client.force_authenticate(self.user)
        res = self.client.get("/tags/")
        json = res.json()
        self.assertEqual(len(json), 1)

    def test_tag_retrieve_logged_in_owner(self):
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

    def test_tag_retrieve_logged_in_admin(self):
        # Tags are retrievable as owner
        self.client.force_authenticate(self.admin)

        res = self.client.get("/tags/1/")
        json = res.json()
        self.assertEqual(json["label"], self.tag_label)
        self.assertEqual(json["description"], self.tag_description)
        self.assertEqual(json["owner"], False)
        self.assertEqual(json["is_public"], True)

        res = self.client.get("/tags/2/")
        json = res.json()
        self.assertEqual(json["label"], self.other_tag_label)
        self.assertEqual(json["description"], self.other_tag_description)
        self.assertEqual(json["owner"], False)
        self.assertEqual(json["is_public"], False)

    def test_tag_retrieve_logged_in_other_user(self):
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

    def test_tag_retrieve_logged_out(self):
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

    def test_tag_create_admin(self):
        self.client.force_authenticate(self.owner)

        res = self.client.post(
            "/tags/",
            {"label": "testlabel", "description": "testdescription", "is_public": True},
        )
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        json = res.json()
        first_id = json["id"]
        res = self.client.get(f"/tags/{first_id}/")
        json = res.json()
        self.assertEqual(json["label"], "testlabel")
        self.assertEqual(json["description"], "testdescription")
        self.assertEqual(json["owner"], True)
        self.assertEqual(json["is_public"], True)

        res = self.client.post(
            "/tags/",
            {
                "label": "otherlabel",
                "description": "otherdescription",
                "is_public": False,
            },
        )
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

    def test_tag_create_user(self):
        # Tags with is_public=True can not be created by non-admins
        self.client.force_authenticate(self.user)
        res = self.client.post(
            "/tags/",
            {"label": "testlabel", "description": "testdescription", "is_public": True},
        )
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        # Tags with is_public=False can be created by non-admins
        res = self.client.post(
            "/tags/",
            {
                "label": "testlabel",
                "description": "testdescription",
                "is_public": False,
            },
        )
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        json = res.json()
        first_id = json["id"]
        res = self.client.get(f"/tags/{first_id}/")
        json = res.json()
        self.assertEqual(json["label"], "testlabel")
        self.assertEqual(json["description"], "testdescription")
        self.assertEqual(json["owner"], True)
        self.assertEqual(json["is_public"], False)

    def test_tag_create_logged_out(self):
        # Tags with is_public=True can not be created by an unauthenticated user
        self.client.force_authenticate(None)
        res = self.client.post(
            "/tags/",
            {"label": "testlabel", "description": "testdescription", "is_public": True},
        )
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

        # Tags with is_public=False can not be created by an unauthenticated user
        self.client.force_authenticate(None)
        res = self.client.post(
            "/tags/",
            {
                "label": "testlabel",
                "description": "testdescription",
                "is_public": False,
            },
        )
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_tag_destroy_logged_out(self):
        # Tags are not destroyable by an unauthenticated user
        res = self.client.delete("/tags/1/")
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)
        res = self.client.get("/tags/1/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_tag_destroy_logged_in_other_user(self):
        # Tags are not destroyable by an authenticated user that is not the owner
        self.client.force_authenticate(self.user)

        res = self.client.delete("/tags/1/")
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)
        res = self.client.get("/tags/1/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_tag_destroy_logged_in_owner(self):
        # Tags are destroyable by the owner
        self.client.force_authenticate(self.owner)

        res = self.client.delete("/tags/1/")
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        res = self.client.get("/tags/1/")
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_tag_destroy_logged_in_admin(self):
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
        self.admin = User.objects.create_superuser(
            email="ad@m.in", password="12345678!"
        )
        self.user = User.objects.create_user(email="u@s.er", password="!87654321")
        Family.objects.create(
            label=self.family_label,
            description=self.family_description,
            owner=self.owner,
        )
        Family.objects.create(
            label=self.other_family_label,
            description=self.other_family_description,
            owner=self.owner,
        )

    def test_family_list_logged_in(self):
        # Families are listable when logged in
        self.client.force_authenticate(self.owner)
        res = self.client.get("/families/")
        json = res.json()
        self.assertEqual(len(json), 2)

    def test_family_list_logged_out(self):
        # Families are listable when logged out
        self.client.force_authenticate(None)
        res = self.client.get("/families/")
        json = res.json()
        self.assertEqual(len(json), 2)

    def test_family_retrieve_logged_in(self):
        # Families are retrievable when logged in
        self.client.force_authenticate(self.owner)
        res = self.client.get("/families/1/")
        json = res.json()
        self.assertEqual(json["label"], self.family_label)
        self.assertEqual(json["description"], self.family_description)
        self.assertEqual(json["owner"], True)

    def test_family_retrieve_logged_out(self):
        # Families are retrievable when logged out
        self.client.force_authenticate(None)
        res = self.client.get("/families/1/")
        json = res.json()
        self.assertEqual(json["label"], self.family_label)
        self.assertEqual(json["description"], self.family_description)
        self.assertEqual(json["owner"], False)

    def test_family_create_logged_in(self):
        self.client.force_authenticate(self.owner)

        res = self.client.post(
            "/families/", {"label": "testfamily", "description": "testdescription"}
        )
        json = res.json()
        first_id = json["id"]
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        res = self.client.get(f"/families/{first_id}/")
        json = res.json()
        self.assertEqual(json["label"], "testfamily")
        self.assertEqual(json["description"], "testdescription")
        self.assertEqual(json["owner"], True)

        res = self.client.post(
            "/families/", {"label": "otherfamily", "description": "otherdescription"}
        )
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

    def test_family_create_logged_out(self):
        self.client.force_authenticate(None)

        res = self.client.post(
            "/families/", {"label": "testfamily", "description": "testdescription"}
        )
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_family_update_logged_out(self):
        # Families are not updateable by an unauthenticated user
        res = self.client.put(
            "/families/1/",
            {
                "label": self.other_family_label,
                "description": self.other_family_description,
            },
        )
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_family_update_logged_in_other_user(self):
        # Families are not updateable by another non-admin user
        self.client.force_authenticate(self.user)
        res = self.client.put(
            "/families/1/",
            {
                "label": self.other_family_label,
                "description": self.other_family_description,
            },
        )
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_family_update_logged_in_owner(self):
        # Families are updatable by owner
        self.client.force_authenticate(self.owner)
        res = self.client.put(
            "/families/1/",
            {
                "label": self.other_family_label,
                "description": self.other_family_description,
            },
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_family_update_logged_in_admin(self):
        # Families are updatable by an admin
        self.client.force_authenticate(self.admin)
        res = self.client.put(
            "/families/1/",
            {
                "label": self.other_family_label,
                "description": self.other_family_description,
            },
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)


class LicenseTest(APITestCase):
    license_label = License._default_license
    other_license_label = "Test license"

    def setUp(self):
        self.admin = User.objects.create_superuser(
            email="ad@m.in", password="12345678!"
        )
        self.user = User.objects.create_user(email="u@s.er", password="!87654321")
        License.objects.create(label=self.license_label)
        License.objects.create(label=self.other_license_label)

    def test_license_list_logged_in_admin(self):
        # Licenses are listable when logged in
        self.client.force_authenticate(self.admin)
        res = self.client.get("/licenses/")
        json = res.json()
        self.assertEqual(len(json), 2)

    def test_license_list_logged_in_user(self):
        # Licenses are listable when logged in with non-admin user
        self.client.force_authenticate(self.user)
        res = self.client.get("/licenses/")
        json = res.json()
        self.assertEqual(len(json), 2)

    def test_license_list_logged_out(self):
        # Licenses are listable when logged out
        self.client.force_authenticate(None)
        res = self.client.get("/licenses/")
        json = res.json()
        self.assertEqual(len(json), 2)

    def test_license_retrieve_logged_in_admin(self):
        # License is retrievable when logged in
        self.client.force_authenticate(self.admin)
        res = self.client.get("/licenses/1/")
        json = res.json()
        self.assertEqual(json["label"], self.license_label)

    def test_license_retrieve_logged_in_user(self):
        # License is retrievable when logged in with non-admin user
        self.client.force_authenticate(self.user)
        res = self.client.get("/licenses/1/")
        json = res.json()
        self.assertEqual(json["label"], self.license_label)

    def test_license_retrieve_logged_out(self):
        # License is also retrievable when logged out
        self.client.force_authenticate(None)
        res = self.client.get("/licenses/1/")
        json = res.json()
        self.assertEqual(json["label"], self.license_label)


class FileUploadTest(APITestCase):
    license_label = License._default_license
    other_license_label = "Test license"
    family_label = "Family label"
    family_description = "Family description"
    other_family_label = "Other family label"
    other_family_description = "Other family description"
    tag_label = "Tag label"
    tag_description = "Tag description"
    other_tag_label = "Other tag label"
    other_tag_description = "Other tag description"

    file_label = "File label"
    file_description = "File description"
    file_version = "1.0.0"
    file_content = b"""<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?>
    <featureModel>
        <properties/>
        <struct>
        </struct>
    </featureModel>"""

    other_file_label = "Other file label"
    other_file_description = "Other file description"
    other_file_version = "2.0.0"
    other_file_content = b"""<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?>
    <featureModel>
        <properties/>
        <struct>
        </struct>
    </featureModel>"""

    def setUp(self):
        self.owner = User.objects.create_superuser(email="ow@n.er", password="asdfghj")
        self.admin = User.objects.create_superuser(
            email="ad@m.in", password="12345678!"
        )
        self.user = User.objects.create_user(email="u@s.er", password="!87654321")
        self.license = License.objects.create(label=self.license_label)
        self.other_license = License.objects.create(label=self.other_license_label)
        self.family = Family.objects.create(
            label=self.family_label,
            description=self.family_description,
            owner=self.owner,
        )
        self.other_family = Family.objects.create(
            label=self.other_family_label,
            description=self.other_family_description,
            owner=self.owner,
        )
        self.tag = Tag.objects.create(
            label=self.tag_label,
            description=self.tag_description,
            owner=self.owner,
            is_public=True,
        )
        self.other_tag = Tag.objects.create(
            label=self.other_tag_label,
            description=self.other_tag_description,
            owner=self.owner,
            is_public=False,
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
        self.other_file = File.objects.create(
            owner=self.owner,
            label=self.other_file_label,
            description=self.other_file_description,
            tags=[self.tag, self.other_tag],
            version=self.other_file_version,
            license=self.other_license,
            local_file=ContentFile(self.other_file_content, "other_file.xml"),
            family=self.other_family,
            is_confirmed=True,
        )

    def test_file_retrieve_logged_in_owner(self):
        # Files are retrievable when logged in with owner
        self.client.force_authenticate(self.owner)
        res = self.client.get("/files/1/")
        json = res.json()
        self.assertEqual(json["label"], self.file_label)
        self.assertEqual(json["description"], self.file_description)
        self.assertEqual(len(json["tags"]), 1)
        self.assertEqual(json["tags"][0]["id"], self.tag.id)
        self.assertEqual(json["version"], self.file_version)
        self.assertEqual(json["license"]["id"], self.license.id)
        self.assertEqual(json["family"]["id"], self.family.id)

        res = self.client.get("/files/2/")
        json = res.json()
        self.assertEqual(json["label"], self.other_file_label)
        self.assertEqual(json["description"], self.other_file_description)
        self.assertEqual(len(json["tags"]), 2)
        self.assertEqual(json["tags"][0]["id"], self.tag.id)
        self.assertEqual(json["tags"][1]["id"], self.other_tag.id)
        self.assertEqual(json["version"], self.other_file_version)
        self.assertEqual(json["license"]["id"], self.other_license.id)
        self.assertEqual(json["family"]["id"], self.other_family.id)

    def test_file_retrieve_logged_in_admin(self):
        # Files are retrievable when logged in with admin
        self.client.force_authenticate(self.admin)
        res = self.client.get("/files/1/")
        json = res.json()
        self.assertEqual(json["label"], self.file_label)
        self.assertEqual(json["description"], self.file_description)
        self.assertEqual(len(json["tags"]), 1)
        self.assertEqual(json["tags"][0]["id"], self.tag.id)
        self.assertEqual(json["version"], self.file_version)
        self.assertEqual(json["license"]["id"], self.license.id)
        self.assertEqual(json["family"]["id"], self.family.id)

        res = self.client.get("/files/2/")
        json = res.json()
        self.assertEqual(json["label"], self.other_file_label)
        self.assertEqual(json["description"], self.other_file_description)
        self.assertEqual(len(json["tags"]), 2)
        self.assertEqual(json["tags"][0]["id"], self.tag.id)
        self.assertEqual(json["tags"][1]["id"], self.other_tag.id)
        self.assertEqual(json["version"], self.other_file_version)
        self.assertEqual(json["license"]["id"], self.other_license.id)
        self.assertEqual(json["family"]["id"], self.other_family.id)

    def test_file_retrieve_logged_in_non_owner(self):
        # Files are retrievable when logged in with non-owner
        self.client.force_authenticate(self.user)
        res = self.client.get("/files/1/")
        json = res.json()
        self.assertEqual(json["label"], self.file_label)
        self.assertEqual(json["description"], self.file_description)
        self.assertEqual(len(json["tags"]), 1)
        self.assertEqual(json["tags"][0]["id"], self.tag.id)
        self.assertEqual(json["version"], self.file_version)
        self.assertEqual(json["license"]["id"], self.license.id)
        self.assertEqual(json["family"]["id"], self.family.id)

        res = self.client.get("/files/2/")
        json = res.json()
        self.assertEqual(json["label"], self.other_file_label)
        self.assertEqual(json["description"], self.other_file_description)
        self.assertEqual(len(json["tags"]), 2)
        self.assertEqual(json["tags"][0]["id"], self.tag.id)
        self.assertEqual(json["tags"][1]["id"], self.other_tag.id)
        self.assertEqual(json["version"], self.other_file_version)
        self.assertEqual(json["license"]["id"], self.other_license.id)
        self.assertEqual(json["family"]["id"], self.other_family.id)

    def test_file_retrieve_logged_out(self):
        # Files are retrievable when logged out
        self.client.force_authenticate(None)
        res = self.client.get("/files/1/")
        json = res.json()
        self.assertEqual(json["label"], self.file_label)
        self.assertEqual(json["description"], self.file_description)
        self.assertEqual(len(json["tags"]), 1)
        self.assertEqual(json["tags"][0]["id"], self.tag.id)
        self.assertEqual(json["version"], self.file_version)
        self.assertEqual(json["license"]["id"], self.license.id)
        self.assertEqual(json["family"]["id"], self.family.id)

        res = self.client.get("/files/2/")
        json = res.json()
        self.assertEqual(json["label"], self.other_file_label)
        self.assertEqual(json["description"], self.other_file_description)
        self.assertEqual(len(json["tags"]), 2)
        self.assertEqual(json["tags"][0]["id"], self.tag.id)
        self.assertEqual(json["tags"][1]["id"], self.other_tag.id)
        self.assertEqual(json["version"], self.other_file_version)
        self.assertEqual(json["license"]["id"], self.other_license.id)
        self.assertEqual(json["family"]["id"], self.other_family.id)

    def test_file_list_logged_in_owner(self):
        # Files are listable when logged in with owner
        self.client.force_authenticate(self.owner)
        res = self.client.get("/files/")
        json = res.json()
        self.assertEqual(len(json), 2)

    def test_file_retrieve_logged_in_admin(self):
        # Files are listable when logged in with admin
        self.client.force_authenticate(self.admin)
        res = self.client.get("/files/")
        json = res.json()
        self.assertEqual(len(json), 2)

    def test_file_retrieve_logged_in_non_owner(self):
        # Files are listable when logged in with non-owner
        self.client.force_authenticate(self.user)
        res = self.client.get("/files/")
        json = res.json()
        self.assertEqual(len(json), 2)

    def test_file_retrieve_logged_out(self):
        # Files are listable when logged out
        self.client.force_authenticate(None)
        res = self.client.get("/files/")
        json = res.json()
        self.assertEqual(len(json), 2)

    def test_file_destroy_logged_in_owner(self):
        # Files are destroyable when logged in with owner
        self.client.force_authenticate(self.owner)
        res = self.client.delete("/files/1/")
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        res = self.client.get("/files/1/")
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_file_destroy_logged_in_admin(self):
        # Files are destroyable when logged in with admin
        self.client.force_authenticate(self.admin)
        res = self.client.delete("/files/1/")
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        res = self.client.get("/files/1/")
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_file_destroy_logged_in_non_owner(self):
        # Files are not destroyable when logged in with non-owner
        self.client.force_authenticate(self.user)
        res = self.client.delete("/files/1/")
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)
        res = self.client.get("/files/1/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_file_destroy_logged_out(self):
        # Files are not destroyable when logged out
        self.client.force_authenticate(None)
        res = self.client.delete("/files/1/")
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)
        res = self.client.get("/files/1/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)


class UnconfirmedFileUploadTest(APITestCase):
    license_label = License._default_license
    other_license_label = "Test license"
    family_label = "Family label"
    family_description = "Family description"
    other_family_label = "Other family label"
    other_family_description = "Other family description"
    tag_label = "Tag label"
    tag_description = "Tag description"
    other_tag_label = "Other tag label"
    other_tag_description = "Other tag description"

    file_label = "File label"
    file_description = "File description"
    file_version = "1.0.0"
    file_content = b"""<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?>
    <featureModel>
        <properties/>
        <struct>
        </struct>
    </featureModel>"""

    other_file_label = "Other file label"
    other_file_description = "Other file description"
    other_file_version = "2.0.0"
    other_file_content = b"""<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?>
    <featureModel>
        <properties/>
        <struct>
        </struct>
    </featureModel>"""

    def setUp(self):
        self.owner = User.objects.create_superuser(email="ow@n.er", password="asdfghj")
        self.admin = User.objects.create_superuser(
            email="ad@m.in", password="12345678!"
        )
        self.user = User.objects.create_user(email="u@s.er", password="!87654321")
        self.license = License.objects.create(label=self.license_label)
        self.other_license = License.objects.create(label=self.other_license_label)
        self.family = Family.objects.create(
            label=self.family_label,
            description=self.family_description,
            owner=self.owner,
        )
        self.other_family = Family.objects.create(
            label=self.other_family_label,
            description=self.other_family_description,
            owner=self.owner,
        )
        self.tag = Tag.objects.create(
            label=self.tag_label,
            description=self.tag_description,
            owner=self.owner,
            is_public=True,
        )
        self.other_tag = Tag.objects.create(
            label=self.other_tag_label,
            description=self.other_tag_description,
            owner=self.owner,
            is_public=False,
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
        self.other_file = File.objects.create(
            owner=self.owner,
            label=self.other_file_label,
            description=self.other_file_description,
            tags=[self.tag, self.other_tag],
            version=self.other_file_version,
            license=self.other_license,
            local_file=ContentFile(self.other_file_content, "other_file.xml"),
            family=self.other_family,
            is_confirmed=True,
        )

    def test_file_retrieve_logged_in_owner(self):
        # Unconfirmed files are retrievable when logged in with owner
        self.client.force_authenticate(self.owner)
        res = self.client.get("/files/uploaded/unconfirmed/1/")
        json = res.json()
        self.assertEqual(json["label"], self.file_label)
        self.assertEqual(json["description"], self.file_description)
        self.assertEqual(len(json["tags"]), 1)
        self.assertEqual(json["tags"][0]["id"], self.tag.id)
        self.assertEqual(json["version"], self.file_version)
        self.assertEqual(json["license"]["id"], self.license.id)
        self.assertEqual(json["family"]["id"], self.family.id)

        # Confirmed files are not retrievable when logged in with owner
        res = self.client.get("/files/uploaded/unconfirmed/2/")
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_file_retrieve_logged_in_admin(self):
        # Unconfirmed files are retrievable when logged in with admin
        self.client.force_authenticate(self.admin)
        res = self.client.get("/files/uploaded/unconfirmed/1/")
        json = res.json()
        self.assertEqual(json["label"], self.file_label)
        self.assertEqual(json["description"], self.file_description)
        self.assertEqual(len(json["tags"]), 1)
        self.assertEqual(json["tags"][0]["id"], self.tag.id)
        self.assertEqual(json["version"], self.file_version)
        self.assertEqual(json["license"]["id"], self.license.id)
        self.assertEqual(json["family"]["id"], self.family.id)

        # Confirmed files are not retrievable when logged in with admin
        res = self.client.get("/files/uploaded/unconfirmed/2/")
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_file_retrieve_logged_in_non_owner(self):
        # Unconfirmed files are retrievable when logged in with non-owner
        self.client.force_authenticate(self.user)
        res = self.client.get("/files/uploaded/unconfirmed/1/")
        json = res.json()
        self.assertEqual(json["label"], self.file_label)
        self.assertEqual(json["description"], self.file_description)
        self.assertEqual(len(json["tags"]), 1)
        self.assertEqual(json["tags"][0]["id"], self.tag.id)
        self.assertEqual(json["version"], self.file_version)
        self.assertEqual(json["license"]["id"], self.license.id)
        self.assertEqual(json["family"]["id"], self.family.id)

        # Confirmed files are not retrievable when logged in with non-owner
        res = self.client.get("/files/uploaded/unconfirmed/2/")
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_file_retrieve_logged_out(self):
        # Unconfirmed files are retrievable when logged out
        self.client.force_authenticate(None)
        res = self.client.get("/files/uploaded/unconfirmed/1/")
        json = res.json()
        self.assertEqual(json["label"], self.file_label)
        self.assertEqual(json["description"], self.file_description)
        self.assertEqual(len(json["tags"]), 1)
        self.assertEqual(json["tags"][0]["id"], self.tag.id)
        self.assertEqual(json["version"], self.file_version)
        self.assertEqual(json["license"]["id"], self.license.id)
        self.assertEqual(json["family"]["id"], self.family.id)

        # Confirmed files are not retrievable when logged out
        res = self.client.get("/files/uploaded/unconfirmed/2/")
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_file_list_logged_in_owner(self):
        # Unconfirmed files are listable when logged in with owner
        self.client.force_authenticate(self.owner)
        res = self.client.get("/files/uploaded/unconfirmed/")
        json = res.json()
        self.assertEqual(len(json), 1)
        self.assertEqual(json[0]["label"], self.file_label)

    def test_file_list_logged_in_admin(self):
        # Unconfirmed files are listable when logged in with admin
        self.client.force_authenticate(self.admin)
        res = self.client.get("/files/uploaded/unconfirmed/")
        json = res.json()
        self.assertEqual(len(json), 1)
        self.assertEqual(json[0]["label"], self.file_label)

    def test_file_list_logged_in_non_owner(self):
        # Unconfirmed files are listable when logged in with non-owner
        self.client.force_authenticate(self.user)
        res = self.client.get("/files/uploaded/unconfirmed/")
        json = res.json()
        self.assertEqual(len(json), 1)
        self.assertEqual(json[0]["label"], self.file_label)

    def test_file_list_logged_out(self):
        # Unconfirmed files are listable when logged out
        self.client.force_authenticate(None)
        res = self.client.get("/files/uploaded/unconfirmed/")
        json = res.json()
        self.assertEqual(len(json), 1)
        self.assertEqual(json[0]["label"], self.file_label)


class BulkUploadTest(APITestCase):
    license_label = License._default_license
    other_license_label = "Test license"
    family_label = "Family label"
    family_description = "Family description"
    other_family_label = "Other family label"
    other_family_description = "Other family description"
    user_family_label = "User family label"
    user_family_description = "User family description"
    tag_label = "Tag label"
    tag_description = "Tag description"
    other_tag_label = "Other tag label"
    other_tag_description = "Other tag description"

    file_label = "File label"
    file_description = "File description"
    file_version = "1.0.0"
    file_contents = b"""<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?>
    <featureModel>
        <properties/>
        <struct>
        </struct>
    </featureModel>"""

    other_file_label = "Other file label"
    other_file_description = "Other file description"
    other_file_version = "2.0.0"
    other_file_contents = b"""<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?>
    <featureModel>
        <properties/>
        <struct>
        </struct>
    </featureModel>"""

    invalid_file_contents = b"This is not valid xml"

    def setUp(self):
        self.owner = User.objects.create_superuser(email="ow@n.er", password="asdfghj")
        self.admin = User.objects.create_superuser(
            email="ad@m.in", password="12345678!"
        )
        self.user = User.objects.create_user(email="u@s.er", password="!87654321")
        self.license = License.objects.create(label=self.license_label)
        self.other_license = License.objects.create(label=self.other_license_label)
        self.family = Family.objects.create(
            label=self.family_label,
            description=self.family_description,
            owner=self.owner,
        )
        self.other_family = Family.objects.create(
            label=self.other_family_label,
            description=self.other_family_description,
            owner=self.owner,
        )
        self.user_family = Family.objects.create(
            label=self.user_family_label,
            description=self.user_family_description,
            owner=self.user,
        )
        self.tag = Tag.objects.create(
            label=self.tag_label,
            description=self.tag_description,
            owner=self.owner,
            is_public=True,
        )
        self.other_tag = Tag.objects.create(
            label=self.other_tag_label,
            description=self.other_tag_description,
            owner=self.owner,
            is_public=False,
        )

    @override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
    def test_upload_logged_in_owner(self):
        # Files are uploadable when logged in with owner
        self.client.force_authenticate(self.owner)
        file = ContentFile(self.file_contents, "file.xml")
        other_file = ContentFile(self.other_file_contents, "other_file.xml")
        files = [
            {
                "description": self.file_description,
                "label": self.file_label,
                "file": "1",
                "family": self.family.id,
                "license": self.license.id,
                "version": self.file_version,
                "tags": [self.tag.id],
            },
            {
                "description": self.other_file_description,
                "label": self.other_file_label,
                "file": "2",
                "family": self.other_family.id,
                "license": self.other_license.id,
                "version": self.other_file_version,
                "tags": [self.tag.id, self.other_tag.id],
            },
        ]
        raw_data = {"files": json.dumps(files), "1": file, "2": other_file}
        data = encode_multipart(data=raw_data, boundary=BOUNDARY)

        res = self.client.post("/bulk-upload/", data, content_type=MULTIPART_CONTENT)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

    @override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
    def test_upload_logged_in_admin(self):
        # Files are uploadable when logged in with admin
        self.client.force_authenticate(self.admin)
        file = ContentFile(self.file_contents, "file.xml")
        other_file = ContentFile(self.other_file_contents, "other_file.xml")
        files = [
            {
                "description": self.file_description,
                "label": self.file_label,
                "file": "1",
                "family": self.family.id,
                "license": self.license.id,
                "version": self.file_version,
                "tags": [self.tag.id],
            },
            {
                "description": self.other_file_description,
                "label": self.other_file_label,
                "file": "2",
                "family": self.other_family.id,
                "license": self.other_license.id,
                "version": self.other_file_version,
                "tags": [self.tag.id, self.other_tag.id],
            },
        ]
        raw_data = {"files": json.dumps(files), "1": file, "2": other_file}
        data = encode_multipart(data=raw_data, boundary=BOUNDARY)

        res = self.client.post("/bulk-upload/", data, content_type=MULTIPART_CONTENT)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

    @override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
    def test_upload_logged_in_non_owner(self):
        # Files are not uploadable when logged in with non-owner
        self.client.force_authenticate(self.user)
        file = ContentFile(self.file_contents, "file.xml")
        other_file = ContentFile(self.other_file_contents, "other_file.xml")
        files = [
            {
                "description": self.file_description,
                "label": self.file_label,
                "file": "1",
                "family": self.family.id,
                "license": self.license.id,
                "version": self.file_version,
                "tags": [self.tag.id],
            },
            {
                "description": self.other_file_description,
                "label": self.other_file_label,
                "file": "2",
                "family": self.other_family.id,
                "license": self.other_license.id,
                "version": self.other_file_version,
                "tags": [self.tag.id, self.other_tag.id],
            },
        ]
        raw_data = {"files": json.dumps(files), "1": file, "2": other_file}
        data = encode_multipart(data=raw_data, boundary=BOUNDARY)

        res = self.client.post("/bulk-upload/", data, content_type=MULTIPART_CONTENT)
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        # Files are uploadable when logged in with non-owner if tags are public
        self.client.force_authenticate(self.user)
        file = ContentFile(self.file_contents, "file.xml")
        other_file = ContentFile(self.other_file_contents, "other_file.xml")
        files = [
            {
                "description": self.file_description,
                "label": self.file_label,
                "file": "1",
                "family": self.user_family.id,
                "license": self.license.id,
                "version": self.file_version,
                "tags": [self.tag.id],
            },
            {
                "description": self.other_file_description,
                "label": self.other_file_label,
                "file": "2",
                "family": self.user_family.id,
                "license": self.other_license.id,
                "version": self.other_file_version,
                "tags": [self.tag.id],
            },
        ]
        raw_data = {"files": json.dumps(files), "1": file, "2": other_file}
        data = encode_multipart(data=raw_data, boundary=BOUNDARY)

        res = self.client.post("/bulk-upload/", data, content_type=MULTIPART_CONTENT)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

    @override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
    def test_upload_logged_out(self):
        # Files are not uploadable when logged out
        self.client.force_authenticate(None)
        file = ContentFile(self.file_contents, "file.xml")
        other_file = ContentFile(self.other_file_contents, "other_file.xml")
        files = [
            {
                "description": self.file_description,
                "label": self.file_label,
                "file": "1",
                "family": self.family.id,
                "license": self.license.id,
                "version": self.file_version,
                "tags": [self.tag.id],
            },
            {
                "description": self.other_file_description,
                "label": self.other_file_label,
                "file": "2",
                "family": self.other_family.id,
                "license": self.other_license.id,
                "version": self.other_file_version,
                "tags": [self.tag.id, self.other_tag.id],
            },
        ]
        raw_data = {"files": json.dumps(files), "1": file, "2": other_file}
        data = encode_multipart(data=raw_data, boundary=BOUNDARY)

        res = self.client.post("/bulk-upload/", data, content_type=MULTIPART_CONTENT)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    @override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
    def test_upload_invalid_xml(self):
        self.client.force_authenticate(self.owner)
        file = ContentFile(self.invalid_file_contents, "file.xml")
        files = [
            {
                "description": self.file_description,
                "label": self.file_label,
                "file": "1",
                "family": self.family.id,
                "license": self.license.id,
                "version": self.file_version,
                "tags": [self.tag.id],
            },
        ]
        raw_data = {"files": json.dumps(files), "1": file}
        data = encode_multipart(data=raw_data, boundary=BOUNDARY)

        res = self.client.post("/bulk-upload/", data, content_type=MULTIPART_CONTENT)
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)


class ZipUploadTest(APITestCase):
    license_label = License._default_license
    family_label = "Family label"
    family_description = "Family description"
    user_family_label = "User family label"
    user_family_description = "User family description"
    tag_label = "Tag label"
    tag_description = "Tag description"
    other_tag_label = "Other tag label"
    other_tag_description = "Other tag description"

    file_label = "File label"
    file_description = "File description"
    file_contents = b"""<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?>
    <featureModel>
        <properties/>
        <struct>
        </struct>
    </featureModel>"""

    other_file_contents = b"""<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?>
    <featureModel>
        <properties/>
        <struct>
        </struct>
    </featureModel>"""

    invalid_file_contents = b"This is not valid xml"

    def setUp(self):
        self.owner = User.objects.create_superuser(email="ow@n.er", password="asdfghj")
        self.admin = User.objects.create_superuser(
            email="ad@m.in", password="12345678!"
        )
        self.user = User.objects.create_user(email="u@s.er", password="!87654321")
        self.license = License.objects.create(label=self.license_label)
        self.family = Family.objects.create(
            label=self.family_label,
            description=self.family_description,
            owner=self.owner,
        )
        self.user_family = Family.objects.create(
            label=self.user_family_label,
            description=self.user_family_description,
            owner=self.user,
        )
        self.tag = Tag.objects.create(
            label=self.tag_label,
            description=self.tag_description,
            owner=self.owner,
            is_public=True,
        )
        self.other_tag = Tag.objects.create(
            label=self.other_tag_label,
            description=self.other_tag_description,
            owner=self.owner,
            is_public=False,
        )

    @override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
    def test_upload_logged_in_owner(self):
        # Files are uploadable when logged in with owner
        self.client.force_authenticate(self.owner)

        buffer = io.BytesIO()

        zip_file = zipfile.ZipFile(buffer, "a", zipfile.ZIP_DEFLATED, False)
        zip_file.writestr("file.xml", self.file_contents)
        zip_file.writestr("other_file.xml", self.other_file_contents)
        zip_file.close()

        files = {
            "description": self.file_description,
            "label": self.file_label,
            "family": self.family.id,
            "license": self.license.id,
            "tags": [self.tag.id, self.other_tag.id],
        }

        raw_data = {
            "files": json.dumps(files),
            "file": ContentFile(buffer.getvalue(), "file.zip"),
        }
        data = encode_multipart(data=raw_data, boundary=BOUNDARY)

        res = self.client.post("/zip-upload/", data, content_type=MULTIPART_CONTENT)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

    @override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
    def test_upload_logged_in_admin(self):
        # Files are uploadable when logged in with admin
        self.client.force_authenticate(self.admin)

        buffer = io.BytesIO()

        zip_file = zipfile.ZipFile(buffer, "a", zipfile.ZIP_DEFLATED, False)
        zip_file.writestr("file.xml", self.file_contents)
        zip_file.writestr("other_file.xml", self.other_file_contents)
        zip_file.close()

        files = {
            "description": self.file_description,
            "label": self.file_label,
            "family": self.family.id,
            "license": self.license.id,
            "tags": [self.tag.id, self.other_tag.id],
        }

        raw_data = {
            "files": json.dumps(files),
            "file": ContentFile(buffer.getvalue(), "file.zip"),
        }
        data = encode_multipart(data=raw_data, boundary=BOUNDARY)

        res = self.client.post("/zip-upload/", data, content_type=MULTIPART_CONTENT)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

    @override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
    def test_upload_logged_in_non_owner(self):
        # Files are not uploadable when logged in with non-owner
        self.client.force_authenticate(self.user)

        buffer = io.BytesIO()

        zip_file = zipfile.ZipFile(buffer, "a", zipfile.ZIP_DEFLATED, False)
        zip_file.writestr("file.xml", self.file_contents)
        zip_file.writestr("other_file.xml", self.other_file_contents)
        zip_file.close()

        files = {
            "description": self.file_description,
            "label": self.file_label,
            "family": self.family.id,
            "license": self.license.id,
            "tags": [self.tag.id, self.other_tag.id],
        }

        raw_data = {
            "files": json.dumps(files),
            "file": ContentFile(buffer.getvalue(), "file.zip"),
        }
        data = encode_multipart(data=raw_data, boundary=BOUNDARY)

        res = self.client.post("/zip-upload/", data, content_type=MULTIPART_CONTENT)
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        # Files are uploadable when logged in with non-owner if tags are public
        files = {
            "description": self.file_description,
            "label": self.file_label,
            "family": self.user_family.id,
            "license": self.license.id,
            "tags": [self.tag.id],
        }

        raw_data = {
            "files": json.dumps(files),
            "file": ContentFile(buffer.getvalue(), "file.zip"),
        }
        data = encode_multipart(data=raw_data, boundary=BOUNDARY)

        res = self.client.post("/zip-upload/", data, content_type=MULTIPART_CONTENT)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

    @override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
    def test_upload_logged_out(self):
        # Files are not uploadable when logged out
        self.client.force_authenticate(None)

        buffer = io.BytesIO()

        zip_file = zipfile.ZipFile(buffer, "a", zipfile.ZIP_DEFLATED, False)
        zip_file.writestr("file.xml", self.file_contents)
        zip_file.writestr("other_file.xml", self.other_file_contents)
        zip_file.close()

        files = {
            "description": self.file_description,
            "label": self.file_label,
            "family": self.family.id,
            "license": self.license.id,
            "tags": [self.tag.id, self.other_tag.id],
        }

        raw_data = {
            "files": json.dumps(files),
            "file": ContentFile(buffer.getvalue(), "file.zip"),
        }
        data = encode_multipart(data=raw_data, boundary=BOUNDARY)

        res = self.client.post("/zip-upload/", data, content_type=MULTIPART_CONTENT)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    @override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
    def test_upload_invalid_xml(self):
        self.client.force_authenticate(self.owner)

        buffer = io.BytesIO()

        zip_file = zipfile.ZipFile(buffer, "a", zipfile.ZIP_DEFLATED, False)
        zip_file.writestr("file.xml", self.invalid_file_contents)
        zip_file.writestr("other_file.xml", self.other_file_contents)
        zip_file.close()

        files = {
            "description": self.file_description,
            "label": self.file_label,
            "family": self.family.id,
            "license": self.license.id,
            "tags": [self.tag.id, self.other_tag.id],
        }

        raw_data = {
            "files": json.dumps(files),
            "file": ContentFile(buffer.getvalue(), "file.zip"),
        }
        data = encode_multipart(data=raw_data, boundary=BOUNDARY)

        res = self.client.post("/zip-upload/", data, content_type=MULTIPART_CONTENT)
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)


class ConfirmUploadTest(APITestCase):
    license_label = License._default_license
    family_label = "Family label"
    family_description = "Family description"
    tag_label = "Tag label"
    tag_description = "Tag description"

    file_label = "File label"
    file_description = "File description"
    file_version = "1.0.0"
    file_content = b"""<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?>
    <featureModel>
        <properties/>
        <struct>
        </struct>
    </featureModel>"""

    other_file_label = "Other file label"
    other_file_description = "Other file description"
    other_file_version = "2.0.0"
    other_file_content = b"""<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?>
    <featureModel>
        <properties/>
        <struct>
        </struct>
    </featureModel>"""

    def setUp(self):
        self.owner = User.objects.create_superuser(email="ow@n.er", password="asdfghj")
        self.user = User.objects.create_user(email="u@s.er", password="!87654321")
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
        self.confirmation_token = generate_random_string(30)
        self.file = File.objects.create(
            owner=self.owner,
            label=self.file_label,
            description=self.file_description,
            tags=[self.tag],
            version=self.file_version,
            license=self.license,
            local_file=ContentFile(self.file_content, "file.xml"),
            family=self.family,
            confirmation_token=self.confirmation_token,
        )
        self.other_file = File.objects.create(
            owner=self.owner,
            label=self.other_file_label,
            description=self.other_file_description,
            tags=[self.tag],
            version=self.other_file_version,
            license=self.license,
            local_file=ContentFile(self.other_file_content, "other_file.xml"),
            family=self.family,
            confirmation_token=self.confirmation_token,
        )

    def test_confirm_token_logged_in_owner(self):
        self.client.force_authenticate(self.owner)

        confirmation_token = self.confirmation_token
        res = self.client.get(f"/files/uploaded/unconfirmed/{self.file.id}/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        res = self.client.get(f"/files/uploaded/unconfirmed/{self.other_file.id}/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        res = self.client.get(
            f"/files/uploaded/unconfirmed/confirm/{confirmation_token}/"
        )
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

        res = self.client.get(f"/files/uploaded/unconfirmed/{self.file.id}/")
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)
        res = self.client.get(f"/files/uploaded/unconfirmed/{self.other_file.id}/")
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)
        res = self.client.get(f"/files/{self.file.id}/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        res = self.client.get(f"/files/{self.other_file.id}/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_confirm_token_logged_in_non_owner(self):
        self.client.force_authenticate(self.user)

        confirmation_token = self.confirmation_token
        res = self.client.get(f"/files/uploaded/unconfirmed/{self.file.id}/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        res = self.client.get(f"/files/uploaded/unconfirmed/{self.other_file.id}/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        res = self.client.get(
            f"/files/uploaded/unconfirmed/confirm/{confirmation_token}/"
        )
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

        res = self.client.get(f"/files/uploaded/unconfirmed/{self.file.id}/")
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)
        res = self.client.get(f"/files/uploaded/unconfirmed/{self.other_file.id}/")
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)
        res = self.client.get(f"/files/{self.file.id}/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        res = self.client.get(f"/files/{self.other_file.id}/")

    def test_confirm_token_logged_out(self):
        self.client.force_authenticate(None)

        confirmation_token = self.confirmation_token
        res = self.client.get(f"/files/uploaded/unconfirmed/{self.file.id}/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        res = self.client.get(f"/files/uploaded/unconfirmed/{self.other_file.id}/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        res = self.client.get(
            f"/files/uploaded/unconfirmed/confirm/{confirmation_token}/"
        )
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

        res = self.client.get(f"/files/uploaded/unconfirmed/{self.file.id}/")
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)
        res = self.client.get(f"/files/uploaded/unconfirmed/{self.other_file.id}/")
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)
        res = self.client.get(f"/files/{self.file.id}/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        res = self.client.get(f"/files/{self.other_file.id}/")


class DeleteUploadTest(APITestCase):
    license_label = License._default_license
    family_label = "Family label"
    family_description = "Family description"
    tag_label = "Tag label"
    tag_description = "Tag description"

    file_label = "File label"
    file_description = "File description"
    file_version = "1.0.0"
    file_content = b"""<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?>
    <featureModel>
        <properties/>
        <struct>
        </struct>
    </featureModel>"""

    other_file_label = "Other file label"
    other_file_description = "Other file description"
    other_file_version = "2.0.0"
    other_file_content = b"""<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?>
    <featureModel>
        <properties/>
        <struct>
        </struct>
    </featureModel>"""

    def setUp(self):
        self.owner = User.objects.create_superuser(email="ow@n.er", password="asdfghj")
        self.user = User.objects.create_user(email="u@s.er", password="!87654321")
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
        self.confirmation_token = generate_random_string(30)
        self.file = File.objects.create(
            owner=self.owner,
            label=self.file_label,
            description=self.file_description,
            tags=[self.tag],
            version=self.file_version,
            license=self.license,
            local_file=ContentFile(self.file_content, "file.xml"),
            family=self.family,
            confirmation_token=self.confirmation_token,
        )
        self.other_file = File.objects.create(
            owner=self.owner,
            label=self.other_file_label,
            description=self.other_file_description,
            tags=[self.tag],
            version=self.other_file_version,
            license=self.license,
            local_file=ContentFile(self.other_file_content, "other_file.xml"),
            family=self.family,
            confirmation_token=self.confirmation_token,
        )
        self.confirmed_file = File.objects.create(
            owner=self.owner,
            label=self.other_file_label,
            description=self.other_file_description,
            tags=[self.tag],
            version=self.other_file_version,
            license=self.license,
            local_file=ContentFile(self.other_file_content, "other_file.xml"),
            family=self.family,
            is_confirmed=True,
            confirmation_token=generate_random_string(30),
        )

    def test_delete_token_logged_in_owner(self):
        self.client.force_authenticate(self.owner)

        confirmation_token = self.confirmation_token
        res = self.client.get(f"/files/uploaded/unconfirmed/{self.file.id}/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        res = self.client.get(f"/files/uploaded/unconfirmed/{self.other_file.id}/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        res = self.client.get(
            f"/files/uploaded/unconfirmed/delete/{confirmation_token}/"
        )
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)

        res = self.client.get(f"/files/uploaded/unconfirmed/{self.file.id}/")
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)
        res = self.client.get(f"/files/uploaded/unconfirmed/{self.other_file.id}/")
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)
        res = self.client.get(f"/files/{self.file.id}/")
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)
        res = self.client.get(f"/files/{self.other_file.id}/")
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_delete_token_logged_in_non_owner(self):
        self.client.force_authenticate(self.user)

        confirmation_token = self.confirmation_token
        res = self.client.get(f"/files/uploaded/unconfirmed/{self.file.id}/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        res = self.client.get(f"/files/uploaded/unconfirmed/{self.other_file.id}/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        res = self.client.get(
            f"/files/uploaded/unconfirmed/delete/{confirmation_token}/"
        )
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)

        res = self.client.get(f"/files/uploaded/unconfirmed/{self.file.id}/")
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)
        res = self.client.get(f"/files/uploaded/unconfirmed/{self.other_file.id}/")
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)
        res = self.client.get(f"/files/{self.file.id}/")
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)
        res = self.client.get(f"/files/{self.other_file.id}/")
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_delete_token_logged_out(self):
        self.client.force_authenticate(None)

        confirmation_token = self.confirmation_token
        res = self.client.get(f"/files/uploaded/unconfirmed/{self.file.id}/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        res = self.client.get(f"/files/uploaded/unconfirmed/{self.other_file.id}/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        res = self.client.get(
            f"/files/uploaded/unconfirmed/delete/{confirmation_token}/"
        )
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)

        res = self.client.get(f"/files/uploaded/unconfirmed/{self.file.id}/")
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)
        res = self.client.get(f"/files/uploaded/unconfirmed/{self.other_file.id}/")
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)
        res = self.client.get(f"/files/{self.file.id}/")
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)
        res = self.client.get(f"/files/{self.other_file.id}/")
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_delete_token_cannot_delete_confirmed_file(self):
        self.client.force_authenticate(None)

        confirmation_token = self.confirmation_token
        res = self.client.get(f"/files/uploaded/confirmed/{self.confirmed_file.id}/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        res = self.client.get(
            f"/files/uploaded/unconfirmed/delete/{self.confirmed_file.confirmation_token}/"
        )
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        res = self.client.get(f"/files/uploaded/confirmed/{self.confirmed_file.id}/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
