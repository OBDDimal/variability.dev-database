from core.fileupload.models import Family

def run():
    test_label = "cypressfamilylabel"
    test_description = "cypressfamilydescription"
    Family.objects.filter(label=test_label, description=test_description).delete()