# Ddueruem-web
A web service for sharing feature model instances, collaborative benchmarking and more.

## Fresh start
You need to set up the `.env` file as shown later and then you can execute `docker-compose up --build` to run the service dockered or here you can find information how start the frontend and backend:

### Backend
In the backend folder do the following
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

#### Start the backend
```
python manage.py runserver
```

#### Setup Github OAuth
- Go to [settings.py](./backend/ddueruemweb/settings.py)
    - Set `GITHUB_AUTH` to `True`
    - Set `GITHUB_AUTH_CALLBACK` to `"http://frontendurl/github_confirm"` (if you want to set it up locally, your frontend URL will most likely be "localhost:9000")
- Go to your [Github OAuth Apps](https://github.com/settings/developers) and create a new OAuth application by clicking on "New OAuth App"
    - Enter the name of your application
    - Enter the URL of your homepage
    - Enter the authorization callback URL (which should be the same as the value you set `GITHUB_AUTH_CALLBACK` to)
    - Do not enable "Device Flow"
    - Write down the client ID
    - Generate a new client secret by clicking the button
    - Write down the generated client secret
- Start the backend and navigate to the admin panel at http://backendurl/admin (locally your backend URL will most likely be "localhost:8000")
    - Log in
    - Navigate to "Social Applications" and click "Add Social Application"
        - Select Github as the provider
        - Enter the name of your application
        - Enter the client ID you wrote down
        - Enter the client secret you wrote down under "Secret key"
        - You do not need to enter anything under "Key"

### Frontend
In the frontend folder execute
```
yarn install
```
and then
```
yarn start
```
