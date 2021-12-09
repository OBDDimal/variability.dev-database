# Ddueruem-web
Web service for sharing feature model instances and collaborative benchmarking.

## Before start
### Create new requirements
Assure correct dependencies are installed

`pip freeze > requirements.txt`

## Fresh start

### Install requirements
`pip install -r requirements.txt`

### Setup backend environment
Copy `backend/ddueruemweb/.env.example` to `backend/ddueruemweb/.env`
```bash
cp backend/ddueruemweb/.env.example backend/ddueruemweb/.env
```

### Create new superuser
`python manage.py createsuperuser`

### Migrations
The following two commands are summarized `makeMigrate`.sh (for linux) or .bat (for windows)
```
python manage.py makemigrations djangoProject
python manage.py migrate
```
### Start Email Server
Start local email server
`python -m smtpd -n -c DebuggingServer localhost:1025`

### Start jobs
 Run all hourly/daily/weekly/monthly jobs
```
python manage.py runjobs hourly
```
Details, see: [django-extensions docu for job scheduling](https://django-extensions.readthedocs.io/en/latest/jobs_scheduling.html#create-a-job)

## Start the backend


