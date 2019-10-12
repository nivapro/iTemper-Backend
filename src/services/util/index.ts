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