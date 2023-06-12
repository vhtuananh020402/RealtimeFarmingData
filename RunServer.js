const express = require("express");
const { Pool } = require("pg");
const WebSocket = require("ws");

const app = express();
const port = 3000;

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "farm2",
  password: "020402",
  port: 5432,
});

const wss = new WebSocket.Server({ noServer: true });

// Calculate and send average values
function calculateAverageValues() {
  const query = `SELECT AVG(soil_humidity) as avg_soil_humidity, AVG(luminosity) as avg_luminosity, AVG(temperature) as avg_temperature, COUNT(timestamp) as number_of_rows FROM sensor`;
  pool.query(query, (error, results) => {
    if (error) {
      console.error('Error calculating average values:', error);
      return;
    }


    const averageValues = results.rows[0];
    // console.log(averageValues); --> for debug, show the avg values
    const eventData = {
      event: 'average',
      data: averageValues
    };

    // Send the average values to all connected clients
    wss.clients.forEach((client) => {
      client.send(JSON.stringify(eventData));
    });
  });

    const queryAll = `SELECT * FROM sensor ORDER BY timestamp DESC`;
    pool.query(queryAll, (error, results) => {
        if (error) {
            console.error('Error fetching all data:', error);
            return;
        }

        const allDataValues = results.rows;
        const eventData = {
            event: 'allData',
            data: allDataValues
        };

        wss.clients.forEach((client) => {
            client.send(JSON.stringify(eventData));
        });

    });
}

// Add the calculateAverageValues function to your setInterval
setInterval(calculateAverageValues, 3000); // Calculate average values every 5 seconds

wss.on("connection", (ws) => {
  console.log("WebSocket client connected");

  ws.send(JSON.stringify({
    event: 'average',
    data: {
      avg_temperature: 0,
      avg_luminosity: 0,
      avg_soil_humidity: 0
    }
  }));

  const query = "LISTEN table_update";
  pool.query(query);

  const eventEmitter = pool;
  eventEmitter.on("notification", (notification) => {
    const payload = JSON.parse(notification.payload);
    ws.send(JSON.stringify(payload));
  });

  ws.on("close", () => {
    pool.query("UNLISTEN table_update");
    eventEmitter.removeAllListeners();
    console.log("WebSocket client disconnected");
  });
});

app.get("/getData", (req, res) => {
  const startIndex = parseInt(req.query.startIndex) || 0;
  const resultsPerPage = parseInt(req.query.resultsPerPage) || 10;

  const query = `SELECT * FROM sensor ORDER BY timestamp DESC LIMIT ${resultsPerPage} OFFSET ${startIndex}`;
  pool.query(query, (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).json({ error: "An error occurred" });
    } else {
      res.json(results.rows);
    }
  });
});

app.use(express.static("public"));

const server = app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

server.on("upgrade", (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (socket) => {
    wss.emit("connection", socket, request);
  });
});
