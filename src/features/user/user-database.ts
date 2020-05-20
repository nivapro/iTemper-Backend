import bluebird from "bluebird";
import mongoose from "mongoose";
(<any>mongoose).Promise = bluebird;

import log from "../../services/logger";



export function initialize (getConnectionString: () => Promise<string>) {

  // Mongoose: `findOneAndUpdate()` and `findOneAndDelete()` without the `useFindAndModify` option set to false are deprecated
  mongoose.set("useFindAndModify", false);

  // Connect to MongoDB

  getConnectionString().then(connectionURI => {
    mongoose.connect(connectionURI, {   useNewUrlParser: true,  useUnifiedTopology: true, useCreateIndex: true }, (err: mongoose.Error) => {
      if (err)
        log.error ("user-database: connection error, check that the db is running - " + connectionURI);
      else
        log.info("user-database: Connected to Mongo DB at  " + connectionURI);
    });
  });
}

