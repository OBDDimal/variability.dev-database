FROM python:3
ADD . /api
COPY ./ddueruemweb/.env.production /api/ddueruemweb/.env
WORKDIR /api

# This is for the performant prod server
RUN pip install uwsgi
RUN pip install -r requirements.txt
ENV PORT=8000
EXPOSE 8000
EXPOSE 1025

RUN ./manage.py collectstatic --no-input
CMD ["./entrypoint.sh"]
