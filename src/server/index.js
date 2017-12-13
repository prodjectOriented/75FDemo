/*===== Setup =====*/
// base express server
import http from "http";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import * as path from "path";
var WebSocket = require("ws");

// requests/webhooks
var rp = require("request-promise");

// ORM - using null for password arg as we"re assuming connection to stripped down local dev demo DB
const Sequelize = require("sequelize");
const sequelize = new Sequelize("mockdevice", "root", null, {host: "localhost", dialect: "mysql"});

// init server
let app = express();
app.server = http.createServer(app);

// websocket server
const wss = new WebSocket.Server({
    server: app.server
});

// 3rd party middleware for cors
app.use(cors());

// body parser for POSTs
app.use(bodyParser.json({
    limit: "100kb" // 100K should be sufficient unless we"re posting massive payloads, e.g. entire scraped pages" worth of markup or something
}));

// gonna serve up the React app bundle from a static index.html in this example for sake of simplicity and brevity
app.use(express.static(path.join(__dirname, "../client/build")));

/*===== Mock IoT Device Endpoint =====*/
// The intent is to use the counter as an index value to retrieve a different timestamped event each time.
// This simulates an IoT device with limited memory which can only keep track of a single reading at a time and
// overwrites previous values when taking new ones (e.g. every 60 seconds)
var counter = 0;

app.get("/api/device/1234ABCD", (req, res) => {
    // mock data, nodeJS require syntax for sake of simplicity
    const mockDeviceReadingEvents = require(path.join(__dirname, "mock_data/device_readings.json"));
    const event = mockDeviceReadingEvents[counter];

    if(counter < 9) {
        counter++;
    }

    // return a hash with an events array
    res.json(event);
});

/*===== Web Application Example Serverside Logic =====*/

// Sequelize Model - configures mappings to DB table as far as names and columns
const DeviceData = sequelize.define("deviceData", {
    deviceId: {
        type: Sequelize.STRING
    },
    timestamp: {
        type: Sequelize.STRING,
        unique: true // enforce unique constraint on this column to prevent duplicate entries
    },
    temperature: {
        type: Sequelize.DECIMAL
    },
    humidity: {
        type: Sequelize.DECIMAL
    }
}, {
    timestamps: false
});

// Function for syncing and updating DB table
const updateTable = (entry) => {
    DeviceData.create(entry).catch((error) => {
        // chain a catch on the promise to handle timeout errors as well as unique constraint errors which may occur
        // in demo workflows, e.g. reached end of the 10 mock IoT data events, and re-tries to save the last one
        console.error("Unable to create DB entry: ", error);
    });
};

// Function for retrieving fresh data and updating
const getFreshData = () => {
    rp({
        uri: "http://127.0.0.1:8080/api/device/1234ABCD", // mock IoT device REST API endpoint
        json: true
    }).then((response) => {
        // the response is a JSON object representing a single device reading event and can be saved as a row in the DB
        updateTable(response)
    })
};

// Function for polling IoT device mock REST API
const startPolling = () => {
    // Default to 60 seconds (1 minute) per assignment instructions, but allow for overriding for quicker demo run-throughs
    // e.g. INTERVAL_DURATION=250 npm run start
    const INTERVAL_DURATION = process.env.INTERVAL_DURATION || 60000;
    let intervalCount = 0;

    // callback every 60 seconds until interval limit is reached
    const pollingPid = setInterval(() => {
        getFreshData();
        intervalCount++;
        // limit to 10 intervals since we only have 10 mock events to work with
        if(intervalCount >= 10) {
            clearInterval(pollingPid)
        }
    }, INTERVAL_DURATION);
};

// Function for kicking off workflow
const startSync = () => {
    // connect to DB, start polling once DB connection is established
    sequelize.authenticate()
        .then(() => {
            console.log("Connected");
            // sync() syncs the model to the DB, and creates the table if it doesn't exist. The force:true option
            // will drop the table if it already exists prior to recreating it. We want this behavior for the sake of
            // facilitating demo'ing.
            DeviceData.sync({force: true}).then(startPolling);
        })
        .catch((err) => {
            console.error("Failed to establish DB connection. Reason:", err);
        });
};

/*===== Web Application Example Websocket Connection =====*/
wss.on("connection", (ws, req) => {
    // Add an afterCreate hook to the DB table so newly created rows result in new websocket messages to the client
    DeviceData.addHook("afterCreate", (datum) => {
        ws.send(JSON.stringify(datum));
    });

    // The idea is to kick off serverside logic once a websocket connection has been established by the clientside
    startSync();
});

/*===== Start listening on arbitrary port =====*/
app.server.listen(process.env.PORT || 8080, () => {
    console.log(`Started on port ${app.server.address().port}`);
});

export default app;