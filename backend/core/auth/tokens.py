from django.core.signing import Signer
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode


def encode_user_to_token(user):
    """
    Generates a token which is signed with the SECRET_KEY from settings.py,
    details: https://docs.djangoproject.com/en/3.2/topics/signing/
    throws BadSignature exception
    @param user includes parameters for hashing. This needs to contain at least the user email and creation timestamp
    :return:
    """
    return urlsafe_base64_encode(force_bytes(Signer().sign_object(user)))


def decode_token_to_user(token):
    """
    If the given is string is a token in the sense of this class, then if will return a dict of attributes
    otherwise it throws BadSignature exception
    details: https://docs.djangoproject.com/en/3.2/topics/signing/
    throws BadSignature exception
    @param token includes parameters for hashing. This needs to contain at least the user email and creation timestamp
    :return:
    """
    return Signer().unsign_object((force_str(urlsafe_base64_decode(token))))
