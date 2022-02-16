import bluebird from "bluebird";
import mongoose from "mongoose";
import { stringify } from "../../services/util";
/* eslint-disable  @typescript-eslint/no-explicit-any */
(<any>mongoose).Promise = bluebird;

import log from "../../services/logger";



export function initialize (getConnectionString: () => Promise<string>) {

  // Connect to MongoDB

  getConnectionString().then(connectionURI => {
    mongoose.connect(connectionURI, (err: mongoose.Error) => {
      if (err)
        log.error ("user-database: connection error, check that the db is running - " + connectionURI + ", Error=[" + stringify(err) + "]");
      else
        log.info("user-database: Connected to Mongo DB at  " + connectionURI);
    });
  });
}

