var mqtt = require('mqtt');
var client = mqtt.connect('mqtt://broker.hivemq.com');

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const topic = 'tunafarm/temperature';


client.on('connect', function() {
    setInterval(function() {
        temperature = getRandomInt(25, 32);

        message = JSON.stringify({
            temperature: temperature,
        });

        client.publish(topic, message);
        console.log('Temperature Sensor has already sent the data --> temperature: ', temperature);
    }, 3000);
});
