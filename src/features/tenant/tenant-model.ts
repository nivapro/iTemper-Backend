import mongoose, { Connection, Document, Model, Schema } from "mongoose";
import log from "../../services/logger";

export function tenantModel<T extends Document>(name: string, schema: Schema, tenantID: string, connection: Connection): Model<T>  {
  log.debug("tenant-model name=" + name);
  log.debug("tenant-model tenantID=" + tenantID);
  log.debug("tenant-model connection.db.databaseName=" + connection.db.databaseName);

  const Model = connection.model<T>(name, schema);

  Model.schema.set("discriminatorKey", "tenantID");

  log.debug("tenantModel tenantId=" + tenantID);
  const discriminatorName = `${Model.modelName}-${tenantID}`;
  const existingDiscriminator = (Model.discriminators || {})[discriminatorName];
  return existingDiscriminator || Model.discriminator(discriminatorName, new Schema({}));
}
