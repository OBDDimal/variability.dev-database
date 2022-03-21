import json

from django.core.files.base import ContentFile
from django.test import TestCase

# Create your tests here.
from django.test.client import MULTIPART_CONTENT, encode_multipart, BOUNDARY
from rest_framework.test import APITestCase

from core.analysis.docker_manager import check_for_finished_container
from core.analysis.models import DockerProcess, RESOURCE_OPTIONS, LIBRARIES
from core.fileupload.models import Tag, File
from core.fileupload.models.family import Family
from core.fileupload.models.license import License
from core.user.models import User
from core.analysis.tryM import MonitorContainerWorker


class DockerManagerTest(APITestCase):
    upload_file_content = b"""<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?>
          <featureModel>
              <properties/>
              <struct>
              </struct>
          </featureModel>"""

    def _tag_and_upload_file(self, file_label, file_name, new_version_of=None):
        """
        create feature model via API. If new_version_of is of type File then the new_version_of field
        in the backend and API call is set accordingly.

        returns File with id 1 if new_version_of is None otherwise it returns File with id 2
        """
        c = self.client
        user = User.objects.get(email="ad@m.in")
        l_res = c.post('/auth/login/', {'email': 'ad@m.in', 'password': '12345678!'})
        License.objects.create(label=License._default_license)
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
            "family": 1,
            "license": 1,
            "tags": '[{"id": "2", "label": "Tobi"},{"id": "1", "label": "Eric Test"}]'}
        if new_version_of is not None:
            raw_data.update({'new_version_of': str(new_version_of)})
        msg_as_multipart = encode_multipart(data=raw_data, boundary=BOUNDARY)
        f_res = c.post('/files/', msg_as_multipart,
                       content_type=MULTIPART_CONTENT,
                       HTTP_AUTHORIZATION='Bearer ' + token)
        return File.objects.get(id=1) if new_version_of is None else File.objects.get(id=2)

    def setUp(self):
        self.user = User.objects.create_superuser(email="ad@m.in", password="12345678!")

    def test_foo(self):
        file = self._tag_and_upload_file("fm_test3", "nameof.xml")
        dp = DockerProcess.objects.create(file_to_analyse=file, owner=self.user, resources='4-1',
                                          library='buddy')
        wdir = '/home/eric/Uni/SE-Projekt/ddueruem-web/1_myFIle'
        # MonitorContainerWorker(wdir, dp).run()
        check_for_finished_container(dp, wdir)
