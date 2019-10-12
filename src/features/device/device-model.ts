import mongoose from "mongoose";

import log from "../../services/logger";

import * as crypto from "../../services/crypto";

const moduleName = "device-controller.";
function label(name: string): string {
  return moduleName + name + ": ";
}

export interface DeviceInterface {
    name: string;
    deviceID: string;
    key: string;
    tenantID: string;
    comparePassword: (candidatePassword: string, cb: (err: any, isMatch: any) => void) => void;
}

export interface DeviceDocument extends DeviceInterface, mongoose.Document {}

export const DeviceSchema = new mongoose.Schema({
    name: {type: String },
    deviceID: {type: String, unique: true, timestamps: true },
    key: {type: String},
    tenantID: {type: String},

});

/**
 * Password hash middleware.
 */
DeviceSchema.pre("save", function save(next) {
    const m = "DeviceSchema.pre";
    log.debug(label(m));
    const device = this;
    if (!device.isModified("key")) { return next(); }

    crypto.hash(device.key, (err, result) => {
      if (err) { return next(err); }
      log.debug(label(m) + "key=[" + result + "]");
      device.key = result; // hashed password
    });
    next();
  });

DeviceSchema.methods.comparePassword = function (candidateKey: string, cb: (err: any, isMatch: boolean) => void) {
    const m = "DeviceSchema.methods.comparePassword";
    const device = this;
    log.debug(label(m) + "");
    crypto.compare(candidateKey, device.key, cb);
  };

export type DeviceModel = mongoose.Model<DeviceDocument>;

export const Device: mongoose.Model<DeviceDocument> = mongoose.model<DeviceDocument>("Device", DeviceSchema);








