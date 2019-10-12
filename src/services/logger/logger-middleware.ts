import { NextFunction, Request, Response } from "express";

import { Log } from "../../services/logger";

class TransactionLogger {
    static id: number;

    constructor() {
        TransactionLogger.id = Date.now();
    }

    logger(req: Request, res: Response, next: NextFunction) {
        TransactionLogger.id++;
        res.locals.log = new Log("id=" + TransactionLogger.id);
        next();
    }
}


