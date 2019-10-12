import bluebird from "bluebird";
import mongoose from "mongoose";
(<any>mongoose).Promise = bluebird;

import log from "../../services/logger";
import { MONGODB_URI, MONGODB_PORT, connectionString } from "../../services/config";

const defaultDB = "";

const connectionURI = connectionString(MONGODB_URI, MONGODB_PORT, defaultDB);

export function initialize() {
  // Mongoose: `findOneAndUpdate()` and `findOneAndDelete()` without the `useFindAndModify` option set to false are deprecated
mongoose.set("useFindAndModify", false);

// Connect to MongoDB
mongoose.connect(connectionURI, { }, (err: mongoose.Error) => {

  if (err)
    log.error ("user-database: connection error, check that the db is running - " + connectionURI);
  else
    log.info("user-database: Connected to Mongo DB at  " + connectionURI);

});

}


