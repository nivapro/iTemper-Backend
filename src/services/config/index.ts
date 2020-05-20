export const JWT_SECRET = process.env["JWT_SECRET"];

if (!JWT_SECRET) {
    console.log("Config, No JWT secret string. Set JWT_SECRET environment variable.");
    process.exit(1);
}
export const SALT = process.env["SALT"];


if (!SALT) {
    console.log("Config, No SALT secret string. Set SALT environment variable.");
    process.exit(1);
}

export const LOG_LEVEL = process.env["LOG_LEVEL"];


if (!process.env["LOG_LEVEL"]) {
    console.log("Config, Set LOG_LEVEL environment variable.");
    process.exit(1);
}
const MONGODB_URI = process.env.MONGODB_URI;

const MONGODB_PORT = process.env.MONGODB_PORT;

let userDBConnectionStr: string = MONGODB_URI  + ":" + parseInt(MONGODB_PORT);

export function setUserDBConnectionString(connectionString: string) {
    console.log("Config, Set setUserDBConnectionString: " + connectionString);
    userDBConnectionStr = connectionString;
}

export function userDBConnectionString(): Promise<string> {
    return new Promise (resolve => {
        console.log("Config, Set userDBConnectionString: " + userDBConnectionStr);
        resolve(userDBConnectionStr);
    });
}

export function tenantDBConnectionString(tenantID: string): Promise<string> {
    return new Promise (resolve => {
        console.log("Config, Set tenantDBConnectionString: " + tenantID);
        resolve( userDBConnectionStr += "/" + tenantID);
    });
}
