from django.core.signing import Signer
from django.utils.encoding import force_bytes, force_text
from django.utils import timezone
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_str


def generate_one_time_link(user):
    """
    Generates a token which is signed with the SECRET_KEY from settings.py,
    details: https://docs.djangoproject.com/en/3.2/topics/signing/
    @param user includes parameters for hashing. This needs to contain at least the user email and creation timestamp
    :return:
    """
    return urlsafe_base64_encode(force_bytes(Signer().sign_object(user)))


def get_attributes_of_one_time_link(token):
    return Signer().unsign_object((force_str(urlsafe_base64_decode(token))))
