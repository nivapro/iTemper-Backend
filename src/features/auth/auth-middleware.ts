import { NextFunction, Request, Response } from "express";

import * as jwt from "../../services/jwt/jwt-handler";
import log from "../../services/logger";

import { Device, DeviceDocument } from "./../device/device-model";

const moduleName = "auth-middleware.";
function label(name: string): string {
  return moduleName + name + ": ";
}
export function authorizeJWT(req: Request, res: Response, next: NextFunction) {
    const m = "authorizeJWT";
    const AUTH_HEADER = "Authorization";
    const BEARER_AUTH_SCHEME = "bearer";
    const reqHeader = req.get(AUTH_HEADER);
    if (reqHeader) {
      const matches = reqHeader.split (" ");
      if (matches.length == 2 ) {

        const headerValues = { scheme: matches[0], token: matches[1] };

        if (headerValues.scheme.toLowerCase() === BEARER_AUTH_SCHEME) {
            const token = headerValues.token;
            jwt.verifyJWT(token)
            .then(payload => {
              res.locals.tenantID = payload.tenantID;
              res.locals.sub = payload.sub;
              log.info (label(m) + "request authorized for payload=" + JSON.stringify(payload));
              next();
            })
            .catch (err => {
                log.info (label(m) + "invalid token");
                res.status(401).send("Erroneous token, log in again");
              });
        } else {
          log.debug (label(m) + "header Authorization bearer expected");
          res.status(401).send("Expected Authorization bearer <token> but got " + reqHeader);
        }
      } else {
        log.debug (label(m) + "Invalid Authorization header");
        res.status(401).send("Expected Authorization bearer <token> but got " + reqHeader);
      }
    } else {
      log.debug (label(m) + "Authentication header missing, req.headers=" + JSON.stringify(req.headers));
      res.status(401).send("No authentication information provided");
    }
  }

  export function authorizeAPIKey(req: Request, res: Response, next: NextFunction) {
    const m = "authorizeDevice";

    const AUTH_HEADER = "Authorization";
    const BEARER_AUTH_SCHEME = "bearer";
    const reqHeader = req.get(AUTH_HEADER);
    if (reqHeader) {
      const matches = reqHeader.split (" ");
      if (matches.length == 2 ) {

        const headerValues = { scheme: matches[0], token: matches[1] };

        if (headerValues.scheme.toLowerCase() === BEARER_AUTH_SCHEME) {
          const SEPARATOR = ":";
          const token = headerValues.token.split(SEPARATOR);
          const deviceID = token[0];
          const key = token[1];

          Device.findOne({ deviceID }, (err: any, device: DeviceDocument) => {
            if (err ) { return next(err); }
            if (device) {
              device.comparePassword(key, (err: Error, isMatch: boolean) => {
                if (err) {
                  log.error(label(m) + "error=" + err);
                }
                if (isMatch) {
                  log.info(label(m) + "Access authorized for DeviceID=" + device.deviceID + ", tenantID=" + device.tenantID);
                  res.locals.tenantID = device.tenantID;
                  res.locals.deviceID = device.deviceID;
                  res.locals.deviceName = device.name;
                  next();
                } else {
                  log.info (label(m) + "Access DENIED for deviceID=" + deviceID + ", tenantID=" + device.tenantID);
                  res.status(401).send("Invalid shared access key");
                }
              });
            } else {
              log.debug (label(m) + "Device not found, deviceID=" + deviceID);
              res.status(401).send("Device not found");
            }
          });
        } else {
          log.debug (label(m) + "header Authorization bearer expected");
          res.status(400).send("Erroneous authorization header value, expected Authorization bearer <token> but got " + reqHeader);
        }
      } else {
        log.debug (label(m) + "header Authorization bearer expected");
        res.status(400).send("Invalid authorization header, expected Authorization bearer <token> but got " + reqHeader);
      }
    } else {
      log.debug (label(m) + "Authentication header missing, req.headers=" + JSON.stringify(req.headers));
      res.status(400).send("No authentication information provided");
    }
  }