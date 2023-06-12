const { spawn } = require('child_process');

const fileNames = ['./Sensor/AirSensor.js', './Sensor/LightSensor.js', './Sensor/SoilSensor.js', './Sensor/TemperatureSensor.js'];

fileNames.forEach((fileName) => {
    const childProcess = spawn('node', [fileName]);

    childProcess.stdout.on('data', (data) => {
        console.log(`Output from ${fileName}: ${data}`);
    });

    childProcess.stderr.on('data', (data) => {
        console.error(`Error from ${fileName}: ${data}`);
    });

    childProcess.on('close', (code) => {
        console.log(`${fileName} exited with code ${code}`);
    });

});