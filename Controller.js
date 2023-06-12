const luminosity_min = 10;
const luminosity_max = 30;
const soil_humidity_min = 50;
const soil_humidity_max = 60;
const temperature_min = 27;
const temperature_max = 30;

const lightConstraint = (luminosity, lightSwitch) => {
    var turnOn = lightSwitch;

    if (luminosity < luminosity_min) {
        turnOn = true;
    } else if (luminosity > luminosity_max) {
        turnOn = false;
    }

    return turnOn;
}

const soil_humidityConstraint = (soil_humidity, waterPump) => {
    var turnOn = waterPump;

    if (soil_humidity < soil_humidity_min) {
        turnOn = true;
    } else if (soil_humidity > soil_humidity_max) {
        turnOn = false;
    }

    return turnOn;
}

const temperatureConstraint = (temperature, fanSwitch) => {
    var turnOn = fanSwitch;

    if (temperature < temperature_min) {
        turnOn = true;
    } else if (temperature > temperature_max) {
        turnOn = false;
    }

    return turnOn;
}



module.exports = {
    lightConstraint,
    soil_humidityConstraint,
    temperatureConstraint,
};