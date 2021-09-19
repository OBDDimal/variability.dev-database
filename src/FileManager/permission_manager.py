from django.http import HttpResponse
from http import HTTPStatus
from .models import Token
from django.shortcuts import get_object_or_404
import time


def requires_valid_token(func):
    '''
    Decorater used for methods that require admin acess to perform correctly

    Params:
        request: 
    '''
    def wrapper_check_for_token(*args, **kwargs):
        request = args[0]
        if request.method == 'GET':
            params = request.GET
        elif request.method == 'POST':
            params = request.POST
        else:
            return HttpResponse('Request type not supported', status=HTTPStatus.METHOD_NOT_ALLOWED.value)
        if 'token' not in params:
            return HttpResponse('Method requires a valid access token. No token specified', status=HTTPStatus.UNAUTHORIZED.value)
        token = params['token']
        database_token = get_object_or_404(Token, value=token)
        if not database_token.is_valid():
            return HttpResponse('Supplied access token not valid', HTTPStatus.FORBIDDEN.value)
        else:
            database_token.last_request = time.time()
            database_token.requests_remaining -= 1
            return func(*args, **kwargs)
    return wrapper_check_for_token
