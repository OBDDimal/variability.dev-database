from django.http.response import HttpResponse
from django.shortcuts import render, redirect, get_object_or_404

from .models import Analysis, ProcessCreationForm, DockerProcess
from .dockerManager import start_or_queue_process, get_running_process_ids

def overview(request):
    '''
    Displays an overview over all current processes

    Currently WIP
    '''
    if len(get_running_process_ids()) == 0 and len(Analysis.objects.all()) == 0:
        return HttpResponse('There are no process running currently')
    else:
        return render(request, 'dockerManager/overview.html', {
            'running_analysis': DockerProcess.objects.filter(id__in=get_running_process_ids()),
            'finished_analysis': Analysis.objects.all(),
        })


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
        return redirect('/analysis/')
    else:
        form = ProcessCreationForm()
    return render(request, 'dockerManager/new.html', {'form': form})


def report(request, process_id):
    '''
    Displays the raw file content of the analysis report'''
    analysis = get_object_or_404(Analysis, process__id=process_id)
    lines = analysis.report.replace('\n', '<br>')
    return HttpResponse(lines)


def order(request, process_id):
    '''
    Displays the raw file content of the analysis odering information'''
    analysis = get_object_or_404(Analysis, process__id=process_id)
    lines = analysis.order.replace('\n', '<br>')
    return HttpResponse(lines)
