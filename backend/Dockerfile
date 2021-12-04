FROM python:3
ADD . /api
WORKDIR /api

# This is for the performant prod server
RUN pip install uwsgi
RUN pip install -r requirements.txt
ENV PORT=8000
EXPOSE 8000

RUN ./manage.py collectstatic --no-input

CMD uwsgi --http "0.0.0.0:${PORT}" --module ddueruemweb.wsgi --master --processes 1 --threads 1
