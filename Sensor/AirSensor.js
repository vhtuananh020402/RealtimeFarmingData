var mqtt = require('mqtt');
var client = mqtt.connect('mqtt://broker.hivemq.com');

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const topic = 'tunafarm/air';


client.on('connect', function() {
    setInterval(function() {
        air_humidity = getRandomInt(62, 88);

        message = JSON.stringify({
            air_humidity: air_humidity,
        });

        client.publish(topic, message);
        console.log('Air Sensor has already sent the data --> air humidity: ', air_humidity);
    }, 3000);
});
