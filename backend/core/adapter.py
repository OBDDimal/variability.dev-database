from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from allauth.account.utils import user_email
from allauth.utils import email_address_exists
from rest_framework.exceptions import ValidationError

class AccountAPIAdapter(DefaultSocialAccountAdapter):
    def populate_user(self, request, sociallogin, data):
        user = super().populate_user(request, sociallogin, data)
        user.is_active = True
        return user

    def is_auto_signup_allowed(self, request, sociallogin):
        email = user_email(sociallogin.user)
        if email:
            if email_address_exists(email):
                raise ValidationError('Local user with same email already exists.')
        return True
