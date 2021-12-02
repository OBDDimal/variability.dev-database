FROM python:3
ADD . /api
WORKDIR /api

# This is for the performant prod server
RUN pip install uwsgi
RUN pip install -r requirements.txt
ENV PORT=8000
EXPOSE 8000
# Runner script here
CMD ["/api/runner.sh"]