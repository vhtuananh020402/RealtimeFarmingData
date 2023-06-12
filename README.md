# RealtimeFarmingData

## Requirement
- Nodejs
- PostgresSQL

## Run the project
### 1. Edit your Postgres database login information in the file **_postgresDBinfo.json_**

```json
{
    "user": "postgres",
    "host": "localhost",
    "database": "Enter your database name here",
    "password": "Enter your password here",
    "port": 5432
}
```

### 2. Please open 3 terminals on your system

- Terminal 1 (Activate all the sensors):

    ```bash
    node AllSensorsActivation.js
    ```

- Terminal 2 (A subscriber listens to all the sensor data through a mqtt server, then it inserts the data into the database system)

    ```bash
    node Subscriber.js
    ```

- Terminal 3 (Run the back-end server, the client could access the dashboard interface through this link <mark>localhost:3000</mark>):
    ```bash
    node Server.js
    ```

Note that the client user dashboard will automatically live update the data every 3 seconds, you don't need to refresh the page. 