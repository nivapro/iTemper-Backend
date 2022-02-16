import { NextFunction, Request, Response } from "express";
import log from "../../services/logger";
import * as database from "./tenant-database";
import { Connection } from "mongoose";
const moduleName = "tenant-middleware.";
function label(name: string): string {
  return moduleName + name + ": ";
}

// assume the requests has been authorized and a tenantID assigned
export function useTenantDB(req: Request, res: Response, next: NextFunction) {
    const m = "useTenantDB";
    log.debug("tenant-middleware.useTenantDB: res.locals.tenantID=" + JSON.stringify(res.locals.tenantID));
    const tenantID = res.locals.tenantID;

    if (!tenantID) next(new Error());

    database.useDB(tenantID, (err: Error, connection: Connection) => {
        if (err) {
            log.error(label(m) + "Error when connecting to tenant DB " + tenantID);
            next(err);
        }
        if (connection) {
            log.info(label(m) + "Connected to tenant DB " + tenantID);
            res.locals.connection = connection;
            next();
        } else {
            log.error(label(m) + "Could not connect to tenant DB " + tenantID);
            next(new Error());
        }
    });
}