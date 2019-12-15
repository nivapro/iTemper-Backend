
import { MongoMemoryServer } from "mongodb-memory-server";
import * as UserDatabase from "../src/features/user/user-database";
import * as TenantDatabase from "../src/features/tenant/tenant-database";

import log from "../src/services/logger";


const dbs: MongoMemoryServer [] = [];

function DBConnectionString(): Promise<string> {
    return new Promise (resolve => {
        const mongod = new MongoMemoryServer();
        dbs.push(mongod);
        resolve(mongod.getConnectionString());
    });
}
export function initDatabases() {
    UserDatabase.initialize(DBConnectionString);
    TenantDatabase.initialize(DBConnectionString);
}

export function closeDatabases() {
    for (const db of dbs) {
        db.stop();
    }

}

