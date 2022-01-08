import chalk from "chalk";

export const JWT_SECRET = getEnv("JWT_SECRET");

export const SALT = getEnv("SALT");

export const LOG_LEVEL = getEnv("LOG_LEVEL");

const MONGODB_URI = getEnv("MONGODB_URI");

const MONGODB_PORT = getEnv("MONGODB_PORT");

// Use an own log since logger depends on this file
function log(message: string, error = false) {
    // return `${level}: ${timestamp} [${label}]: ${message}`;
    const time = new Date().toISOString();
    const msg = time + " [itemper-backend]: config: " + message;
    if (error) {
        const error = chalk.red("error: " + msg);
        console.error (error);
    } else {
        console.log ("info: " +(msg));
    }

}

function getEnv(env: string): string {
    const val = process.env[env];
    if (val) {
        log(env + " environment variable found, [" + val + "]");
    } 
    else {
        const error = true;
        log("No " + env + " environment variable.", error);
        process.exit(0);
    }
    return val;
}
let userDBConnectionStr: string = MONGODB_URI  + ":" + parseInt(MONGODB_PORT);


export function setUserDBConnectionString(connectionString: string) {
    log ("config.setUserDBConnectionString: " + connectionString);
    userDBConnectionStr = connectionString;
}

export function userDBConnectionString(): Promise<string> {
    return new Promise (resolve => {
        const connectionString = userDBConnectionStr + "/Directory";
        log("config.userDBConnectionString: " + connectionString);
        resolve(connectionString);
    });
}

export function tenantDBConnectionString(tenantID: string): Promise<string> {
    return new Promise (resolve => {
        const connectionString = userDBConnectionStr + "/" + tenantID;
        console.info("console.info: config.tenantDBConnectionString: " + connectionString);
        resolve( connectionString);
    });
}
