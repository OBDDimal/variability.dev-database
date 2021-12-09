#!/bin/bash

while !</dev/tcp/db/5432; do echo "Connecting" && sleep 1; done;
python manage.py makemigrations
python manage.py migrate --run-syncdb 
uwsgi --http "0.0.0.0:8000" --module ddueruemweb.wsgi --master --processes 1 --threads 1
