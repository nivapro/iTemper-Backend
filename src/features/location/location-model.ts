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

    sensors: Descriptor[];
}

export interface LocationDocument extends LocationInterface, mongoose.Document {}

export const LocationSchema = new mongoose.Schema({
    name: {type: String },
    color: {type: String },
    path: {type: String },
});








