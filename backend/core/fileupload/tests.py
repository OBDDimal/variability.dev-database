import json
import os

from pathlib import Path
from rest_framework.test import APITestCase
from django.test.client import MULTIPART_CONTENT, encode_multipart, BOUNDARY
from django.core.files.base import ContentFile

from core.fileupload.models import File, Tag
from core.fileupload.models.family import Family
from core.user.models import User
from core.fileupload.githubmirror.github_manager import eval_repo, post_file_in_pull_request


class GithubMirrorTests(APITestCase):
    upload_file_content = b"""<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?>
          <featureModel>
              <properties/>
              <struct>
              </struct>
          </featureModel>"""

    def setUp(self):
        user = User.objects.create_superuser(email="ad@m.in", password="12345678!")

    def _tag_and_upload_file(self, file_label, file_name, new_version_of=None):
        """
        create feature model via API. If new_version_of is of type File then the new_version_of field
        in the backend and API call is set accordingly.

        returns File with id 1 if new_version_of is None otherwise it returns File with id 2
        """
        c = self.client
        user = User.objects.get(email="ad@m.in")
        l_res = c.post('/auth/login/', {'email': 'ad@m.in', 'password': '12345678!'})
        content_as_dict = json.loads(l_res.content.decode("utf-8"))
        token = content_as_dict['access']
        file = ContentFile(self.upload_file_content, file_name)
        t1 = Tag()
        t1.owner = User.objects.get(email='ad@m.in')
        t1.label = 'cool'
        t1.description = 'cool testing des'
        t1.is_public = True
        t1.save()
        t2 = Tag()
        t2.owner = User.objects.get(email='ad@m.in')
        t2.label = 'short'
        t2.description = 'short testing des'
        t2.is_public = True
        t2.save()
        fam, created = Family.objects.get_or_create(label='myFMFamily', description='with fancy des', owner_id=user.id)
        fam.save()
        raw_data = {
            "description": "some description text",
            "label": file_label,
            "local_file": file,
            "family": str(fam),
            "license": File.LICENSES[0],
            "tags": '[{"id": "2", "label": "Tobi"},{"id": "1", "label": "Eric Test"}]'}
        if new_version_of is not None:
            raw_data.update({'new_version_of': str(new_version_of)})
        msg_as_multipart = encode_multipart(data=raw_data, boundary=BOUNDARY)
        # print(f"Raw data to user: {raw_data}")
        # print("Sending first file to backend...")
        f_res = c.post('/files/', msg_as_multipart,
                       content_type=MULTIPART_CONTENT,
                       HTTP_AUTHORIZATION='Bearer ' + token)
        return File.objects.get(id=1) if new_version_of is None else File.objects.get(id=2)

    def test_mirror_file_in_github_api(self):
        file = self._tag_and_upload_file("fm_test3", "nameof.xml")
        # eval_repo()
        # post_file_in_pull_request(file=file)
        file = self._tag_and_upload_file("fm_test4", "nameof.xml", file)
        # post_file_in_pull_request(file=file)


class FileUploadWithTagsTests(APITestCase):
    upload_file_content = b"""<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?>
    <featureModel>
        <properties/>
        <struct>
        </struct>
    </featureModel>"""

    def setUp(self):
        User.objects.create_superuser(email="ad@m.in", password="12345678!")

    def test_new_version_of(self):
        c = self.client
        l_res = c.post('/auth/login/', {'email': 'ad@m.in', 'password': '12345678!'})
        content_as_dict = json.loads(l_res.content.decode("utf-8"))
        token = content_as_dict['access']
        parent_file = ContentFile(self.upload_file_content, "test.xml")
        t1 = Tag()
        t1.owner = User.objects.get(email='ad@m.in')
        t1.label = 'cool'
        t1.description = 'cool testing des'
        t1.is_public = True
        t1.save()
        t2 = Tag()
        t2.owner = User.objects.get(email='ad@m.in')
        t2.label = 'short'
        t2.description = 'short testing des'
        t2.is_public = True
        t2.save()
        raw_data = {
            "description": "some description text",
            "label": "my_file_name",
            "local_file": parent_file,
            "license": File.LICENSES[0],
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
            "license": File.LICENSES[0],
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
        t1 = Tag()
        t1.owner = User.objects.get(email='ad@m.in')
        t1.label = 'cool'
        t1.description = 'cool testing des'
        t1.is_public = True
        t1.save()
        t2 = Tag()
        t2.owner = User.objects.get(email='ad@m.in')
        t2.label = 'short'
        t2.description = 'short testing des'
        t2.is_public = True
        t2.save()
        tags = []
        for t in [t1, t2]:
            tags.append({"id": t.id, "label": t.label})

        raw_data = {
            "description": "some description text",
            "label": "my_file_name",
            "local_file": file,
            "license": File.LICENSES[0],
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

        t1 = Tag()
        t1.owner = User.objects.get(email='ad@m.in')
        t1.label = 'cool'
        t1.description = 'cool testing des'
        t1.is_public = True
        t1.save()
        t2 = Tag()
        t2.owner = User.objects.get(email='ad@m.in')
        t2.label = 'short'
        t2.description = 'short testing des'
        t2.is_public = True
        t2.save()

        raw_data = {
            "description": "some description text",
            "label": "my_file_name",
            "local_file": file,
            "license": File.LICENSES[0],
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
