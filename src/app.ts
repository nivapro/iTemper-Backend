
import cors from "cors";
import express from "express";
import expressWs from "express-ws";
import compression from "compression";  // compresses requests

import bodyParser from "body-parser";
import lusca from "lusca";
import dotenv from "dotenv";

import path from "path";
import expressValidator from "express-validator";

import * as UserDatabase from "./features/user/user-database";
// Load environment variables from .env file, where API keys and passwords are configured
dotenv.config({ path: ".env" });

// Databases

UserDatabase.initialize();

// Controllers (route handlers)
import * as homeController from "./features/home/home-controller";
import * as userController from "./features/user/user-controller";
import * as sensorController from "./features/sensor/sensor-controller";
import * as deviceController from "./features/device/device-controller";


import log from "./services/logger";

import errorHandler from "errorhandler";

// Middleware
import { authorizeJWT } from "./features/auth/auth-middleware";
import { SensorDeviceMiddleWare, SensorUserMiddleWare } from  "./features/sensor/sensor-middleware";
import { DeviceMiddleWare } from  "./features/device/device-middleware";



// Create Express server
export const app = expressWs(express()).app;

app.use(errorHandler());

const corsOptions = {
  origin: ["https://itemper.io", "https://api.itemper.io", "http://localhost:4000"],
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "PUT", "POST", "OPTIONS", "DELETE"],
  credentials: true,
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors(corsOptions));
app.options("*", cors());
// app.options("*", cors()); // include before other routes

// Common configuration
app.set("port", process.env.PORT || 3000);
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.disable("x-powered-by");
app.use(lusca.xframe("SAMEORIGIN"));
app.use(lusca.xssProtection(true));
app.use(lusca.nosniff());
app.set("trust proxy", "loopback, uniquelocal");

app.use(
  express.static(path.join(__dirname, "public"), { maxAge: 31557600000 })
);


app.use((req, res, next) => {
    log.debug("App: received request " + req.method + " " + req.path);
    // res.setHeader("Content-Type", "application/json");
    // // Website you wish to allow to connect

    // res.setHeader("Access-Control-Allow-Origin", "https://itemper.io");


    // // Request methods you wish to allow
    // res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");

    // Request headers you wish to allow
    // res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type");

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    // res.setHeader("Access-Control-Allow-Credentials", true);

    // Pass to next layer of middleware

    if (req.headers["content-type"] && req.headers["content-type"].toLowerCase() !== "application/json") {
      res.status(415).send("Unsupported media type, wrong content-type");
    } else {
      next();
    }

});

/**
 * Proof of Concept web sockets
 */

app.get("/", sensorController.notImplemented);
app.get("/", homeController.getHome);
app.post("/signup", userController.postSignup);
app.post("/login", userController.postLogin);

// Requires JWT Token //
// Tenant methods
app.post("/users/add", authorizeJWT, userController.postSignup);

// Create a device, returns a shared API key (the key is not saved, so remember)
app.post("/devices/", DeviceMiddleWare, deviceController.NameFieldValidator, deviceController.postRegisterDevice);

// Get all devices
app.get("/devices", DeviceMiddleWare, deviceController.NoNameFieldValidator, deviceController.getAllDevices);

// Update device name
app.put("/devices/:deviceID", DeviceMiddleWare,  deviceController.RenameFieldValidator, deviceController.putDeviceName);

// Get device with deviceID
app.get("/devices/:deviceID", DeviceMiddleWare, deviceController.DeviceIDFieldValidator, deviceController.getDevice);

// Delete deviceID
app.delete("/devices/:deviceID", DeviceMiddleWare, deviceController.DeviceIDFieldValidator, deviceController.deleteDevice);


// Require Shared API Key //
// Create a sensor
app.post("/sensors", SensorDeviceMiddleWare, sensorController.postValidator, sensorController.postSensors);

// Post sensor data
app.post("/sensors/:sn/:port", SensorDeviceMiddleWare, sensorController.postDataValidator, sensorController.postSensorData);


// // Requires JWT Token //
// Get sensors
app.get("/sensors", SensorUserMiddleWare, sensorController.getSensors);

// Get  sensor on a specific port
app.get("/sensors/:sn/:port", SensorUserMiddleWare, sensorController.getValidatorSNPort, sensorController.getSensorsSNPort);

// Get all sensors on a device
app.get("/sensors/:sn", SensorUserMiddleWare, sensorController.getValidatorSN,  sensorController.getSensorsSN);

// delete  sensors
app.post("/sensors/:sn/delete",  SensorUserMiddleWare, sensorController.deleteValidator, sensorController.postDeleteSensors);








