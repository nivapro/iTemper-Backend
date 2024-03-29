"use strict";
import log from "../../services/logger";
import { Response, Request } from "express";
import {validationResult, ValidationChain, checkSchema, Schema } from "express-validator";

const moduleName = "admin-controller.";
function label(name: string): string {
  return moduleName + name + ": ";
}

const LogLevelSchema: Schema = {
  level: {
    in: "body",
    matches: {
      options: [/\b(?:debug|info|error)\b/],
      errorMessage: "Invalid log level: debug | info | error)"
    }
  }
};
export const logLevelFieldValidator: ValidationChain[] = checkSchema(LogLevelSchema);


export const putLogLevel = (req: Request, res: Response): void => {
    const m = "putLogLevel, " + res.locals.tenantID;
    log.debug(label(m) + JSON.stringify(req.body));
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
       res.status(422).json({ errors: errors.mapped() });
       return;
    }

    const logLevel = req.body.level;
    log.setLevel(logLevel);
    log.info(label(m) + "level=" + logLevel);
    res.status(200).send({});
};
