var mqtt = require('mqtt');
var client = mqtt.connect('mqtt://broker.hivemq.com');

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const topic = 'tunafarm/light';


client.on('connect', function() {
    setInterval(function() {
        luminosity = getRandomInt(0, 40);

        message = JSON.stringify({
            luminosity: luminosity,
        });

        client.publish(topic, message);
        console.log('Light Sensor has already sent the data --> luminosity: ', luminosity);
    }, 3000);
});
