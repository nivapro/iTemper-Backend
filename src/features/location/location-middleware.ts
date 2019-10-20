import log from "../../services/logger";
import * as util from "../../services/util";

import multer from "multer";

import { NextFunction, Request, Response } from "express";

import { Connection, Model } from "mongoose";

import { authorizeJWT } from "./../auth/auth-middleware";
import { useTenantDB } from "./../tenant/tenant-middleware";
import { tenantModel } from "./../tenant/tenant-model";
import { useSensorModel } from "./../sensor/sensor-middleware";
import { LocationDocument, LocationSchema } from "./location-model";

const moduleName = "location-middleware.";
function label(name: string): string {
  return moduleName + name + ": ";
}

const storage = multer.diskStorage({
  destination: locationDir,
  filename: filename
});

const limits =  {
    /** For multipart forms, the max file size (in bytes)(Default: Infinity) */
    fileSize: 5_000_000,
    /** For multipart forms, the max number of file fields (Default: Infinity) */
    files: 1,
};
const uploadFile = multer({ storage, limits });

function locationDir (req: Express.Request, file: Express.Multer.File,
  setFolder: (error: Error | null, destination: string) => void): void {
    setFolder(undefined, "files");
}

function filename (req: Express.Request, file: Express.Multer.File,
  callback: (error: Error | null, filename: string) => void): void {

    callback(undefined, + Date.now() + "_" + file.fieldname);
}

function useLocationModel(req: Request, res: Response, next: NextFunction) {
    const m = "useLocationModel, " + res.locals.tenantID;

    log.debug(label(m) + " dbName=" + res.locals.connection.db.dbName);
    const connection: Connection = res.locals.connection;
    const tenantID = res.locals.tenantID;

    if (!connection) next(new Error());

    const LocationModel: Model<LocationDocument> = tenantModel("Location", LocationSchema, tenantID, connection);
    res.locals.Location = LocationModel;

    log.debug(label(m) + "res.locals.Sensor=" + util.stringify(res.locals.Sensor));

    next();
}

function upload (req: Request, res: Response, next: NextFunction) {

}

export const LocationMiddleWare = [authorizeJWT,
                                  useTenantDB,
                                  useLocationModel,
                                  useSensorModel];
