# Overview
This repo consists of a mock NodeJS webserver and a ReactJS app.

The mock webserver provides an endpoint intended to represent the simulated IOT device's REST API.

It also manages a DB connection for demonstrating saving data retrieved from the simulated IOT device endpoint.

This project uses `Sequelize` for the ORM and `mysql2` for the DB.

Config directory consists of a mashup of patterns from various ReactJS SPA boilerplates for convenience's sake.

## Design Assumptions

The assumption is that the web application manages data replication and display separately:

1. Web application's serverside logic polls the simulated IoT device REST API and keeps database in sync
2. Web application's clientside logic maintains a websocket connection to its backing webserver and responds to DB update events with UI re-renders

Furthermore, for the sake of simplicity and demoing in local dev environments, this example project assumes a local, stripped-down MySQL database with default configuration, e.g. root user w/ no password.

Also assumes existence of a "mockdevice" DB schema. Can provision with a SQL query:

```
CREATE DATABASE mockdevice;
```

## Workflow

Based on design assumptions, the workflow would be something along the lines of:

1. Serverside logic begins polling IoT device REST API for data
2. Serverside logic saves new data, keeping DB in sync with IoT device readings
3. Meanwhile, clientside logic initializes its data store from what is retrieved from DB kept in sync with IoT device
4. Clientside logic also maintains a websocket connection to listen for DB updates, in the interest of making the UI reactive to DB change events

## Running the Demo
I'd recommend injecting a `INTERVAL_DURATION` node env variable to speed up the updates so you don't have to wait a whole minute between each.

For instance, `INTERVAL_DURATION=500 npm run start` will override the polling interval to 500ms.