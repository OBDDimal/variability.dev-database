from django.shortcuts import render, redirect
from core.forms import FileUploadForm


def upload(request):
    if request.method == 'POST':
        form = FileUploadForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            return render(request, 'uploads/upload.html', {
                'form': form
            })
    else:
        form = FileUploadForm()
    return render(request, 'uploads/upload.html', {
        'form': form
    })
