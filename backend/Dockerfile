FROM python:3
RUN apt update && apt install -y nginx
ADD . /api
COPY ./ddueruemweb/.env.production /api/ddueruemweb/.env
WORKDIR /api
RUN pip install --upgrade pip
RUN pip install --upgrade setuptools

# This is for the performant prod server LTS version
RUN pip install https://projects.unbit.it/downloads/uwsgi-lts.tar.gz
RUN pip install -r requirements.txt
ENV PORT=8000
EXPOSE 8000

RUN ./manage.py collectstatic --no-input

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY uwsgi_params.conf /etc/uwsgi/sites/uwsgi_params
CMD ["./entrypoint.sh"]
