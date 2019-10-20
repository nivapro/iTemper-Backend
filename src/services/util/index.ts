import * as fs from "fs";

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

  export function move(oldPath: string, newPath: string, callback: (err?: any) => void) {

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