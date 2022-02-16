import log from "../../services/logger";
import * as util from "../../services/util";

import { NextFunction, Request, Response } from "express";
import { Connection, Model } from "mongoose";

import { authorizeJWT, authorizeAPIKey } from "./../auth/auth-middleware";
import { useTenantDB } from "./../tenant/tenant-middleware";
import { tenantModel } from "./../tenant/tenant-model";
import { ISensor, SensorSchema } from "./sensor-model";
const moduleName = "sensor-middleware.";
function label(name: string): string {
  return moduleName + name + ": ";
}
// assume the requests has been authorized an tenantID assigned
export function useSensorModel(req: Request, res: Response, next: NextFunction) {
    const m = "useSensorModel";
    log.debug(label(m) + "res.locals.connection.db.dbName=" + res.locals.connection.db.dbName);
    log.debug(label(m) + "res.locals.tenantID=" + res.locals.tenantID);
    const connection: Connection = res.locals.connection;
    const tenantID = res.locals.tenantID;

    if (!connection) {
        log.error(label(m) + "No db connection");
        return next(new Error())
    }
    const SensorModel: Model<ISensor> = tenantModel("Sensor", SensorSchema, tenantID, connection);
    res.locals.Sensor = SensorModel;
    log.debug(label(m) + "res.locals.Sensor=" + util.stringify(res.locals.Sensor));


    next();
}

export const SensorDeviceMiddleWare = [authorizeAPIKey, useTenantDB, useSensorModel];
export const SensorUserMiddleWare = [authorizeJWT, useTenantDB, useSensorModel];