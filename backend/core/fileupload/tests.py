import json

from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APITestCase
from django.test.client import MULTIPART_CONTENT, encode_multipart, BOUNDARY
from django.core.files.base import ContentFile

from core.fileupload.models import File, Tag
from core.user.models import User


class TobiRageTests(APITestCase):

    def setUp(self):
        User.objects.create_superuser(email="ad@m.in", password="12345678!")

    def test_tags_required(self):
        c = self.client
        l_res = c.post('/auth/login/', {'email': 'ad@m.in', 'password': '12345678!'})
        content_as_dict = json.loads(l_res.content.decode("utf-8"))
        # print(f"{type(content_as_dict)} {content_as_dict}")
        token = content_as_dict['access']
        # both ways work, difference is type of local_file before sending
        # file = SimpleUploadedFile("a/pathTo/ulFile.txt", b"File content needs to be in bytes!")
        file = ContentFile(b"foo", "test.xml")
        t1 = Tag()
        t1.creator = User.objects.get(email='ad@m.in')
        t1.label = 'cool'
        t1.description = 'cool testing des'
        t1.is_public = True
        t1.save()
        t2 = Tag()
        t2.creator = User.objects.get(email='ad@m.in')
        t2.label = 'short'
        t2.description = 'short testing des'
        t2.is_public = True
        t2.save()
        tags = []
        for t in [t1, t2]:
            tags.append({"id": t.id, "label": t.label})

        raw_data = {
            "description": "some description text",
            "local_file": file,
            "license": File.LICENSES[0],
            "tags": '[{"id": "2", "label": "Tobi"},{"id": "1", "label": "Eric Test"}]'}
        msg_as_multipart = encode_multipart(data=raw_data, boundary=BOUNDARY)
        # MULTIPART_CONTENT == multipart/form-data; boundary=BoUnDaRyStRiNg
        print(f"Raw data to user: {raw_data}")
        print("Sending data to backend...")
        f_res = c.post('/files/', msg_as_multipart,
                       content_type=MULTIPART_CONTENT,
                       HTTP_AUTHORIZATION='Bearer ' + token)
        print(f"\n{f_res.status_code} {f_res.content}")
