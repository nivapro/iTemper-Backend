import bcrypt from "bcrypt-nodejs";
import uuidv4 from "uuid/v4";
import log  from "./../logger";

const moduleName = "crypto.";
function label(name: string): string {
  return moduleName + name + ": ";
}
function saltAndHash(no: number, password: string, callback: (err: Error, hash: string) => void): void {
    const m = "saltAndHash";
    const cb  = callback;
    log.debug(label(m));
    bcrypt.genSalt(no, (err, salt) => {
  //      log.debug(label(m) + "salt");
        if (err) { log.debug("crypto.saltSndHash err"); callback(err, undefined); log.debug("crypto.saltSndHash undefined"); }
  //      log.debug(label(m) + "salted");
        bcrypt.hash(password, salt, () => { } , (err, hash) => {
  //      log.debug(label(m) + "hashed");
            callback(err, hash);
        });
    });
}

export function hash(password: string, callback: (err: Error, hash: string) => void): void {
    saltAndHash(10, password, callback);
}

export function fastHash(password: string, callback: (err: Error, hash: string) => void): void {
    saltAndHash(1, password, callback);
}
export function compare(candidatePassword: string, originalPassword: string, callback: (err: Error, isMatch: boolean) => void): void {
    bcrypt.compare(candidatePassword, originalPassword, callback);
}

export function uuid(): string {
    return uuidv4();
}



