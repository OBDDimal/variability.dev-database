# Ddueruem-web
A web service for sharing feature model instances, collaborative benchmarking and more.

## Fresh start
You need to set up the `.env` file as shown later and then you can execute `docker-compose up --build` to run the service dockered or here you can find information how start the frontend and backend:

### Backend
In the backend folder do as follows
#### Install requirements
`pip install -r requirements.txt`

#### Setup backend environment
Copy `backend/ddueruemweb/.env.example` to `backend/ddueruemweb/.env`
```bash
cp backend/ddueruemweb/.env.example backend/ddueruemweb/.env
```
You may need to alter the fields for email and database access, secret key and frontend url.
When you want to execute **docker-compose**, you need to name the file `.env.production` instead of `.env`. 

#### Create new superuser
You can use `python manage.py createsuperuser` or in case of **docker-compose** `docker exec -it ddueruem-web_backend_1 /api/manage.py createsuperuser`

#### Migrations
The following two commands are summarized `makeMigrate`.sh (for linux) or .bat (for windows)
```
python manage.py makemigrations djangoProject
python manage.py migrate
```

#### Start jobs
 Run (in a cron job) all hourly/daily/weekly/monthly jobs
```
python manage.py runjobs hourly
```
Details, see: [django-extensions docu for job scheduling](https://django-extensions.readthedocs.io/en/latest/jobs_scheduling.html#create-a-job)

Note that emails (both for the confirmation of new user accounts as well as the confirmation of file uploads) are sent using runjobs. You should thus add
```
python manage.py runjobs minutely
```
as a cron job.

#### Start the backend
```
python manage.py runserver
```

### Frontend
In the frontend folder execute
```
yarn install
```
and then
```
yarn start
```
