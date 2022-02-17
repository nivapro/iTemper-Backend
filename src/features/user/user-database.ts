// import bluebird from "bluebird";
import mongoose from "mongoose";
/* eslint-disable  @typescript-eslint/no-explicit-any */
// (<any>mongoose).Promise = bluebird;

import log from "../../services/logger";



export function initialize (getConnectionString: () => Promise<string>) {

  // Connect to MongoDB

  getConnectionString().then(connectionURI => {
      mongoose.connect(connectionURI)
      .then (() => log.info("user-database: Connected to Mongo DB at " + connectionURI))
      .catch(e =>  log.error ("user-database: connection error, check that the db is running - " + connectionURI + ", Error=[" + e + "]"));
  });
}
