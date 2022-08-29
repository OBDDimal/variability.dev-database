from core.user.models import User

def run():
    test_email = "cypress@uni-ulm.de"
    test_pw = "testingIsFun1"
    user = User.objects.create_user(email=test_email, password=test_pw,
                                    is_superuser=True, is_active=True, is_staff=True)