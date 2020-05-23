import log from "../../services/logger";

import { NextFunction, Request, Response } from "express";

import { authorizeAPIKey, authorizeJWT } from "./../auth/auth-middleware";
import { Device } from "./device-model";

const moduleName = "device-middleware.";
function label(name: string): string {
  return moduleName + name + ": ";
}
function useDeviceModel(req: Request, res: Response, next: NextFunction) {
    const m = "useDeviceModel";
    log.debug(label(m));
    res.locals.Device = Device;

    next();
}
export const DeviceMiddleWare = [authorizeJWT, useDeviceModel];
export const DeviceDataMiddleWare = [authorizeAPIKey, useDeviceModel];
