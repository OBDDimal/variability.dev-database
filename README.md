# djangoProject
Try and Error Project for Django

## Before start
### Create new requirements
Assure correct dependencies are installed

`pip freeze > requirements.txt`

## Fresh start

### Install requirements
`pip install -r requirements.txt`

### Create new super user
`python manage.py createsuperuser`

### Migrations
The following two commands are summarized `makeMigrate`.sh (for linux) or .bat (for windows)
```
python manage.py makemigrations djangoProject
python manage.py migrate
```
### Start Email Server
Start local email server
`python -m smtpd -n -c DebuggingServer localhost:587`





