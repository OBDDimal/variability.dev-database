#!/bin/sh

while ! nc -zv db 5432; do echo "Connecting" && sleep 1; done;

python manage.py makemigrations
python manage.py migrate --run-syncdb
gunicorn --bind ":8000" --workers 3 ddueruemweb.wsgi:application

