import json

from rest_framework import status
from rest_framework.test import APITestCase
from core.user.models import User


class UserInfoTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_superuser(email="u@s.er", password="!87654321")

    def test_get_logged_in_user(self):
        self.client.force_authenticate(self.user)

        res = self.client.get("/user-info/")
        json = res.json()
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(json["id"], self.user.id)
        self.assertEqual(json["email"], self.user.email)
        self.assertEqual(json["is_active"], True)

    def test_get_logged_out(self):
        self.client.force_authenticate(None)

        res = self.client.get("/user-info/")
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)
