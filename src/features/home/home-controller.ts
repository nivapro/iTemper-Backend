"use strict";

import { Response, Request } from "express";
import path from "path";


export const getHome = (req: Request, res: Response) => {
  res.status(200).sendFile(path.join(__dirname, "public/", "wsclient.html"));
};


