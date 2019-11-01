import mongoose from "mongoose";

import log from "../../services/logger";

import { Descriptor } from "../sensor/sensor-model";

const moduleName = "location-model.";
function label(name: string): string {
  return moduleName + name + ": ";
}

export interface LocationInterface {
    name: string;
    color: string;
    path: string;

    sensorDesc: Descriptor[];
}

export interface LocationDocument extends LocationInterface, mongoose.Document {}

export const LocationSchema = new mongoose.Schema({
    name: {type: String },
    color: {type: String },
    path: {type: String },
    sensorDesc: [{
      _id: false,  // if true, Mongodb creates _id implicitly. We do not want that here
      SN: String,
      port: Number
    }]
});








