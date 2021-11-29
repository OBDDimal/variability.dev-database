#!/bin/bash
python manage.py makemigrations
python manage.py migrate --run-syncdb