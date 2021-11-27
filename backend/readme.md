# Backend Readme

DDueruem-web backend readme

## Useful commands

List of useful commands

```
python -m smtpd -n -c DebuggingServer localhost:1025
```

```
python manage.py flush
```

```
python manage.py migrate
```

```
python manage.py makemigrations
```

### JWT

JWT tokens are used for authentication. For details of the used
library, [click here](https://django-rest-framework-simplejwt.readthedocs.io/en/latest/index.html)

### Job Scheduling

Since performing jobs on hourly/daily/weekly/... basis is not build-in in django, we
use [django-extension](https://django-extensions.readthedocs.io/en/latest/#) library to achieve this.
