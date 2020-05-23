import mongoose from "mongoose";
import log from "../../services/logger";
// import { tenantDBConnectionString } from "../../services/config";

let getConnectionString: (tenantID: String) => Promise<string>;

const TenantConnections = new Map();

export function initialize (ConnectionStringFactory: (tenantID: String) => Promise<string>) {
  getConnectionString = ConnectionStringFactory;
}

export function useDB(tenantID: string, callback: (err: Error, connection: mongoose.Connection) =>  void ): void {

  if (TenantConnections.has(tenantID)) {
    log.debug ("tenant-database.useDB: reusing connection for tenantID=" + tenantID);
    callback(undefined, TenantConnections.get(tenantID));
  } else {

    getConnectionString(tenantID).then(connectionURI => {
      log.debug("tenant-database.useDB: connectionURI=" + connectionURI);
      const connection: mongoose.Connection = mongoose.createConnection(connectionURI,
        {  useNewUrlParser: true,  useUnifiedTopology: true, useCreateIndex: true });

      connection.on("error", (): void =>  {
        log.error ("tenant-database.useDB:  connection error, check that the db is running - " + connectionURI);
        callback(new Error(), undefined);
      });

      connection.on("connected", (): void =>  {
        log.info ("tenant-database.useDB: connected to " + connectionURI);
        TenantConnections.set(tenantID, connection);
        callback(undefined, connection);
      });
    });


  }
}


