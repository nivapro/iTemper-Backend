// Uses an own log since logger depends on this file
import chalk from "chalk";
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
// Checks that all configuration is complete
let configError = false;
function checkConfiguration () {
    if (configError) {
        log("Configuration errors found, existing application");
        process.exit(0)
    }
}
// Verifies a environment variable

function getEnv(env: string, redact = false): string {
    let val = process.env[env];
    if (val) {
        val = redact ? "********* (redacted)" : val;
        log(env + " environment variable found, value=[" + val + "]");
    } 
    else {
        configError = true;
        log("No " + env + " environment variable.", configError);
    }
    return val;
}

// Get all environment variables
export const JWT_SECRET = getEnv("JWT_SECRET", true);

export const SALT = getEnv("SALT", true);

export const LOG_LEVEL = getEnv("LOG_LEVEL");

export const PORT = getEnv("PORT");

export const WEBSOCKET=getEnv("WEBSOCKET");

const MONGODB_URI = getEnv("MONGODB_URI");

const MONGODB_PORT = getEnv("MONGODB_PORT");

let userDBConnectionStr: string = MONGODB_URI  + ":" + parseInt(MONGODB_PORT);

checkConfiguration();

export function setUserDBConnectionString(connectionString: string) {
    const msg = "console.info: [itemper-backend]: config.setUserDBConnectionString: " + connectionString;
    console.info(chalk.green(msg));

    userDBConnectionStr = connectionString;
}
export function userDBConnectionString(): Promise<string> {
    return new Promise (resolve => {
        const connectionString = userDBConnectionStr + "/Directory";
        const msg = "console.info: [itemper-backend]: config.userDBConnectionString: " + connectionString;
        console.info(chalk.green(msg));
        resolve(connectionString);
    });
}
export function tenantDBConnectionString(tenantID: string): Promise<string> {
    return new Promise (resolve => {
        const connectionString = userDBConnectionStr + "/" + tenantID;
        const msg = "console.info: config.tenantDBConnectionString: " + connectionString;
        console.info(chalk.green(msg));
        resolve( connectionString);
    });
}
