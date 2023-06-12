const { Client } = require("pg");
const moment = require('moment-timezone');
const mqtt = require('mqtt');
const fs = require('fs');
const Controller = require('./Controller.js');
const temperatureConstraint = Controller.temperatureConstraint;
const soil_humidityConstraint  = Controller.soil_humidityConstraint;
const lightConstraint = Controller.lightConstraint;

// controller
var lightSwitch = false;
var waterPump = false;
var fanSwitch = false;

let rawJSONdata = fs.readFileSync('postgresDBinfo.json');
let DBLoginInfo = JSON.parse(rawJSONdata);
// console.log(DBLoginInfo.user);

const credentials = {
    user: DBLoginInfo.user,
    host: DBLoginInfo.host,
    database: DBLoginInfo.database,
    password: DBLoginInfo.password,
    port: DBLoginInfo.port,
}

const DBClient = new Client(credentials);

const insertSensor = async (timestamp, temperature, luminosity, airHumidity, soilHumidity) => {
    try {
        await DBClient.query(
            "INSERT INTO sensor (timestamp, temperature, luminosity, air_humidity, soil_humidity) VALUES ($1, $2, $3, $4, $5)",
            [timestamp, temperature, luminosity, airHumidity, soilHumidity]
        );
        return true;
    } catch (error) {
        console.error(error.stack);
        return false;
    }
};

// Connect to the PostgreSQL database
DBClient.connect()
    .then(() => {
        var previousTime = moment().tz('Asia/Bangkok').format();        // preventing from overlapping the primary key timestamp
        console.log("Connected to the database");

        // Continue with MQTT subscription and message handling

        const topics = ['tunafarm/air', 'tunafarm/light', 'tunafarm/soil', 'tunafarm/temperature'];
        const receivedData = {};

        const client = mqtt.connect('mqtt://broker.hivemq.com');

        topics.forEach(topic => {
            client.subscribe(topic);
        });

        client.on('message', function (topic, message) {
            if (topics.includes(topic)) {
                const receivedMessage = message.toString();
                const parsedMessage = JSON.parse(receivedMessage);
                receivedData[topic] = parsedMessage;

                if (Object.keys(receivedData).length === topics.length) {
                    const jsonData = JSON.stringify(receivedData);
                    fs.writeFile('receivedData.json', jsonData, 'utf8', function (err) {
                        if (err) {
                            console.error('Error writing JSON file:', err);
                        } else {
                            // console.log('Received data written to receivedData.json file');

                            currentTime = moment().tz('Asia/Bangkok').format();

                            var receivedTemperature = receivedData["tunafarm/temperature"].temperature;
                            var receivedLuminosity = receivedData["tunafarm/light"].luminosity;
                            var receivedAirHumidity = receivedData["tunafarm/air"].air_humidity;
                            var receivedSoilHumidity = receivedData["tunafarm/soil"].soil_humidity;

                            if (currentTime != previousTime)
                            insertSensor(currentTime, receivedTemperature, receivedLuminosity, receivedAirHumidity, receivedSoilHumidity)
                                .then(result => {
                                    if (result) {
                                        console.log('Data inserted');
                                        console.log("Turn on the light?         --> " + lightConstraint(receivedLuminosity, lightSwitch)         + "    [luminosity     : " + receivedLuminosity + "]");
                                        console.log("Turn on the water pump?    --> " + soil_humidityConstraint(receivedSoilHumidity, waterPump) + "    [soil_humidity  : " + receivedSoilHumidity + "]" );
                                        console.log("Turn on the fan?           --> " + temperatureConstraint(receivedTemperature, fanSwitch)    + "    [temperature    : " + receivedTemperature + "]");
                                    }
                                });
                            
                            
                            

                            previousTime = currentTime;
                        }
                    });
                }
            }
        });
    })
    .catch(err => {
        console.error('Error connecting to the database:', err);
    });
