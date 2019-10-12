import log from "../../services/logger";
import * as util from "../../services/util";

import { NextFunction, Request, Response } from "express";
import { Connection, Model } from "mongoose";

import { authorizeJWT, authorizeAPIKey } from "./../auth/auth-middleware";
import { useTenantDB } from "./../tenant/tenant-middleware";
import { tenantModel } from "./../tenant/tenant-model";
import { ISensor, SensorSchema } from "./sensor-model";

// assume the requests has been authorized an tenantID assigned
export function useSensorModel(req: Request, res: Response, next: NextFunction) {
    log.debug("sensor-middleware.useSensorModel: res.locals.connection.db.dbName=" + res.locals.connection.db.dbName);
    log.debug("sensor-middleware.useSensorModel: res.locals.tenantID=" + res.locals.tenantID);
    const connection: Connection = res.locals.connection;
    const tenantID = res.locals.tenantID;

    if (!connection) next(new Error());
    const SensorModel: Model<ISensor> = tenantModel("Sensor", SensorSchema, tenantID, connection);
    res.locals.Sensor = SensorModel;
    log.debug("sensor-middleware.useSensorModel res.locals.Sensor=" + util.stringify(res.locals.Sensor));


    next();
}

export const SensorDeviceMiddleWare = [authorizeAPIKey, useTenantDB, useSensorModel];
export const SensorUserMiddleWare = [authorizeJWT, useTenantDB, useSensorModel];