import { NextFunction, Request, Response } from "express";

import log from "../../services/logger";



 function validationErrors (req: Request) {
    req.assert("email", "Email is not valid").isEmail();
    req.assert("password", "Password cannot be blank").notEmpty();
    //  req.sanitize("email").normalizeEmail({ gmail_remove_dots: false });

    return req.validationErrors();
  }

