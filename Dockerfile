# syntax=docker/dockerfile:1

FROM python:3.8-slim-buster
ENV PYTHONUNBUFFERED=1
ENV GITHUB_TOKEN=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

COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt
EXPOSE 8000
COPY . .
CMD python src/manage.py runserver 127.0.0.1:8000

#docker run -v /var/run/docker.sock:/var/run/docker.sock -p 8000:8000 ddueruem-web