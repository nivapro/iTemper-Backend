
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
import * as locationController from "./features/location/location-controller";


import log from "./services/logger";

import errorHandler from "errorhandler";

// Middleware
import { authorizeJWT } from "./features/auth/auth-middleware";
import { SensorDeviceMiddleWare, SensorUserMiddleWare } from  "./features/sensor/sensor-middleware";
import { DeviceMiddleWare } from  "./features/device/device-middleware";
import { LocationMiddleWare, LocationUploadMiddleWare } from "./features/location/location-middleware";



// Create Express server
export const app = expressWs(express()).app;

app.use(errorHandler());

const corsOptions = {
  origin: ["https://itemper.io", "https://api.itemper.io", "http://localhost:8080"],
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
const locationImageFolder = path.join(process.cwd(), "uploads");
app.use("/uploads", express.static(locationImageFolder, { maxAge: 31557600000 }));
log.info("app.ts locationImageFolder=" + locationImageFolder);

app.use((req, res, next) => {
  log.debug("App: received request " + req.method + " " + req.path);
  next();
});

app.use(express.static(path.join(__dirname, "public"), { maxAge: 31557600000 }));

// Routes with file upload or forms

app.post("/locations/", LocationUploadMiddleWare, locationController.postCreateLocation);
app.put("/locations/:locationID/file", LocationUploadMiddleWare, locationController.putFile);

// application/json after this point

app.use((req, res, next) => {
    if (req.headers["content-type"] && req.headers["content-type"].toLowerCase() !== "application/json") {
      res.status(415).send("Unsupported media type, wrong content-type");
    } else {
      next();
    }
});

app.get("/locations/", LocationMiddleWare, locationController.getAllLocations);
app.put("/locations/:locationID/name", LocationMiddleWare, locationController.updateNameFieldValidator , locationController.putName);
app.put("/locations/:locationID/color", LocationMiddleWare, locationController.updateColorFieldValidator, locationController.putColor);
app.put("/locations/:locationID/sensors", LocationMiddleWare, locationController.updateSensorsFieldValidator, locationController.putSensors);
app.delete("/locations/:locationID", LocationMiddleWare, locationController.LocationIDFieldValidator, locationController.deleteLocation);

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


app.get("/", sensorController.notImplemented);
app.get("/", homeController.getHome);
