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

export const MONGODB_URI = process.env.MONGODB_URI;

export const MONGODB_PORT = process.env.MONGODB_PORT;

export function connectionString (base: string, port: string, path: string): string {
    let str: string  = base + ":" + parseInt(port);
    if (path && path.length > 0) { str += "/" + path; }
    return  str;
}