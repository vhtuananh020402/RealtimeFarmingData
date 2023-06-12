var mqtt = require('mqtt');
var client = mqtt.connect('mqtt://broker.hivemq.com');

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const topic = 'tunafarm/soil';


client.on('connect', function() {
    setInterval(function() {
        soil_humidity = getRandomInt(40, 70);

        message = JSON.stringify({
            soil_humidity: soil_humidity,
        });

        client.publish(topic, message);
        console.log('Soil Sensor has already sent the data --> soil humidity: ', soil_humidity);
    }, 3000);
});
