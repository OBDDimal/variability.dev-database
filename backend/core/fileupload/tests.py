import json
import os

from pathlib import Path
from rest_framework.test import APITestCase
from django.test.client import MULTIPART_CONTENT, encode_multipart, BOUNDARY
from django.core.files.base import ContentFile

from core.fileupload.models import Family, Tag, License, File
from core.user.models import User


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
        c = self.client
        l_res = c.post('/auth/login/', {'email': 'ad@m.in', 'password': '12345678!'})
        content_as_dict = json.loads(l_res.content.decode("utf-8"))
        token = content_as_dict['access']
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
        f_res = c.post('/files/', msg_as_multipart,
                       content_type=MULTIPART_CONTENT,
                       HTTP_AUTHORIZATION='Bearer ' + token)
        # print(f"\n{f_res.status_code} {f_res.content}")
        self.assertEqual(f_res.status_code, 201)
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
        f_res = c.post('/files/', msg_as_multipart,
                       content_type=MULTIPART_CONTENT,
                       HTTP_AUTHORIZATION='Bearer ' + token)
        # print(f"\n{f_res.status_code} {f_res.content}")
        self.assertEqual(f_res.status_code, 201)

    def test_tags_required(self):
        c = self.client
        l_res = c.post('/auth/login/', {'email': 'ad@m.in', 'password': '12345678!'})
        content_as_dict = json.loads(l_res.content.decode("utf-8"))
        token = content_as_dict['access']
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
        f_res = c.post('/files/', msg_as_multipart,
                       content_type=MULTIPART_CONTENT,
                       HTTP_AUTHORIZATION='Bearer ' + token)
        # print(f"\n{f_res.status_code} {f_res.content}")
        self.assertEqual(f_res.status_code, 201)

    def test_create_G6_after_upload(self):
        c = self.client
        l_res = c.post('/auth/login/', {'email': 'ad@m.in', 'password': '12345678!'})
        content_as_dict = json.loads(l_res.content.decode("utf-8"))
        token = content_as_dict['access']
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
        f_res = c.post('/files/', msg_as_multipart,
                       content_type=MULTIPART_CONTENT,
                       HTTP_AUTHORIZATION='Bearer ' + token)
        # print(f"\n{f_res.status_code} {f_res.content}")
        self.assertEqual(f_res.status_code, 201)
