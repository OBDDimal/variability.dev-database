FROM python:3-alpine
ADD . /app
COPY ./ddueruemweb/.env.production /app/ddueruemweb/.env

RUN set -ex \
  && apk add --no-cache --virtual .build-deps postgresql-dev build-base netcat-openbsd \
  && python -m venv /env \
  && /env/bin/pip install --upgrade pip \
  && /env/bin/pip install --no-cache-dir gunicorn \
  && /env/bin/pip install --no-cache-dir -r /app/requirements.txt \
  && runDeps="$(scanelf --needed --nobanner --recursive /env \
  | awk '{ gsub(/,/, "\nso:", $2); print "so:" $2 }' \
  | sort -u \
  | xargs -r apk info --installed \
  | sort -u)" \
  && apk add --virtual rundeps $runDeps \
  && apk del .build-deps

WORKDIR /app

ENV VIRTUAL_ENV /env
ENV PATH /env/bin:$PATH
ENV PORT=8000

EXPOSE 8000

RUN ./manage.py collectstatic --no-input

CMD ["./entrypoint.sh"]
