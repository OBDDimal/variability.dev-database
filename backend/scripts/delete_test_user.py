from core.user.models import User

def run():
    test_email = "cypress@uni-ulm.de"
    User.objects.filter(email=test_email).delete()