import * as fs from "fs";
import mkdirp from "mkdirp";
import log from "../../services/logger";

export function stringify(o: object) {
    let cache: object[] = [];

    return JSON.stringify(o, function(key, value) {
        if (typeof value === "object" && value !== null) {
            if (cache.indexOf(value) !== -1) {
                // Duplicate reference found, discard key
                return;
            }
            // Store value in our collection
            cache.push(value);
        }

  //      if (typeof value === "string" || typeof value === "number") log.debug(key + "," + value);
        return value;
    });
    cache = undefined;
  }

  export function move(oldPath: string, newFolder: string, newFilename: string, callback: (err?: any) => void) {
    const newPath = newFolder + newFilename;
    const newDir = mkdirp.sync(newFolder);

    if (newDir) {
        log.info("Created dir " + newFolder);
    } else {
        log.error("Cannot create dir " + newFolder);
    }
    fs.rename(oldPath, newPath, function (err) {
        if (err) {
            if (err.code === "EXDEV") {
                copy();
            } else {
                callback(err);
            }
            return;
        }
        callback();
    });

    function copy() {
        const readStream = fs.createReadStream(oldPath);
        const writeStream = fs.createWriteStream(newPath);

        readStream.on("error", callback);
        writeStream.on("error", callback);

        readStream.on("close", function () {
            fs.unlink(oldPath, callback);
        });
        readStream.pipe(writeStream);
    }
  }