import mongoose from "mongoose";
import log from "../../services/logger";
import { MONGODB_URI, MONGODB_PORT, connectionString } from "../../services/config";

function dbName(tenantID: string): string {
  return tenantID;
}


const TenantConnections  = new Map();

export function useDB(tenantID: string, callback: (err: Error, connection: mongoose.Connection) =>  void ): void {
  const connectionURI = connectionString(MONGODB_URI, MONGODB_PORT, dbName(tenantID));
  log.debug("tenant-database.useDB: connectionURI=" + connectionURI);

  if (TenantConnections.has(tenantID)) {
    log.debug ("tenant-database.useDB: reusing connection for tenantID=" + tenantID);
    callback(undefined, TenantConnections.get(tenantID));
  } else {
    const connection: mongoose.Connection = mongoose.createConnection(connectionURI);

    connection.on("error", (): void =>  {
      log.error ("tenant-database.useDB:  connection error, check that the db is running - " + connectionURI);
      callback(new Error(), undefined);
    });

    connection.on("connected", (): void =>  {
      log.info ("tenant-database.useDB: connected to " + connectionURI);
      TenantConnections.set(tenantID, connection);
      callback(undefined, connection);
    });
  }



}

