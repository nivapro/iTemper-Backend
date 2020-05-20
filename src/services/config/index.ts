export const JWT_SECRET = process.env["JWT_SECRET"];

if (!JWT_SECRET) {
    console.log("No JWT secret string. Set JWT_SECRET environment variable.");
    process.exit(1);
}
export const SALT = process.env["SALT"];


if (!SALT) {
    console.log("No SALT secret string. Set SALT environment variable.");
    process.exit(1);
}

export const LOG_LEVEL = process.env["LOG_LEVEL"];


if (!process.env["LOG_LEVEL"]) {
    console.log("Set LOG_LEVEL environment variable.");
    process.exit(1);
}
const MONGODB_URI = process.env.MONGODB_URI;

const MONGODB_PORT = process.env.MONGODB_PORT;

let userDBConnectionStr: string = MONGODB_URI  + ":" + parseInt(MONGODB_PORT);

export function setUserDBConnectionString(connectionString: string) {
    userDBConnectionStr = connectionString;
}

export function userDBConnectionString(): Promise<string> {
    return new Promise (resolve => { resolve(userDBConnectionStr); });
}

export function tenantDBConnectionString(tenantID: string): Promise<string> {
    return new Promise (resolve => { resolve( userDBConnectionStr += "-" + tenantID); });
}
