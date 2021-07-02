from django.http.response import HttpResponse
from django.shortcuts import render, redirect

from .models import ProcessCreationForm, DockerProcess
from .dockerManager import start_or_queue_process

# Create your views here.


def overview(request):
    '''
    Displays an overview over all current processes

    Currently WIP
    '''
    return HttpResponse('There are no process running currently')


def new(request):
    '''
    Displays a form that enables a user to create a new process

    If the request method is POST, the form is validated and a new process is queued or started if possible
    '''
    if request.method == 'POST':
        form = ProcessCreationForm(request.POST)
        if(form.is_valid()):
            process = form.save()
            start_or_queue_process(process)
        return redirect('/analysis')
    else:
        form = ProcessCreationForm()
    return render(request, 'dockerManager/new.html', {'form': form})
