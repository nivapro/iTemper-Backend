import chalk from "chalk";

export const JWT_SECRET = getEnv("JWT_SECRET");

export const SALT = getEnv("SALT");

export const LOG_LEVEL = getEnv("LOG_LEVEL");

const MONGODB_URI = getEnv("MONGODB_URI");

const MONGODB_PORT = getEnv("MONGODB_PORT");

function getEnv(env: string): string {
    const val = process.env[env];
    if (!val) {
        const msg = "console.error: [itemper-backend]: config: No " + env + " environment variable.";
        const error = chalk.red(msg);
        console.error(error);
        process.exit(0);
    }
    return val;
}
let userDBConnectionStr: string = MONGODB_URI  + ":" + parseInt(MONGODB_PORT);

export function setUserDBConnectionString(connectionString: string) {
    console.info("console.info: [itemper-backend]: config.setUserDBConnectionString: " + connectionString);
    userDBConnectionStr = connectionString;
}

export function userDBConnectionString(): Promise<string> {
    return new Promise (resolve => {
        const connectionString = userDBConnectionStr + "/Directory";
        console.info("console.info: [itemper-backend]: config.userDBConnectionString: " + connectionString);
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
