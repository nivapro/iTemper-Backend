import { LOG_LEVEL } from "./../config";
import { createLogger, format, transports, Logger } from "winston";
const { combine, timestamp, printf, label } = format;
const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${level}: ${timestamp} [${label}]: ${message}`;
});


export class Log {
  private static logger: Logger;

  private static transports = {
    console: new (transports.Console)(),
};
private static applicationName = "iTemper-backend";
private label: string;
private _name: string;
// moduleName: string = __filename.slice(__dirname.length + 1))
  constructor(name = "") {

    if (name.length > 0) {
      this.label = Log.applicationName + "-" + name;
    } else {
      this.label = Log.applicationName;
    }

    this._name = name;

    Log.logger =  createLogger ({
      format: combine (timestamp(), label ({ label: this.label}), myFormat),
      exitOnError: false,
      level: LOG_LEVEL,
      defaultMeta: { service: 'user-service' },
      transports: [new transports.Console() ],
    });
  }
    private time(): string {
      return new Date().toISOString();
    }
    private appendTenant(report: string ): string {
      return report;
    }
    public name(): string {
      return this._name;
    }
    public info (report: string) {
      Log.logger.info(this.appendTenant(report));
      // if (LOG_LEVEL !=='error') {
      //   console.info("info " + this.message(report));
      // }
    }
    public debug (report: string) {
      Log.logger.debug(this.appendTenant(report));
      // if (LOG_LEVEL==='debug') {
      //   console.debug("debug " + this.message(report));
      // }
    }

    public error (report: string) {
      Log.logger.error(this.appendTenant(report));
      // console.error("error " + this.message(report));
    }

    public setLevel(level: string): void {
      Log.logger.transports[0].level = level;
  }

    private message(message: string): string {
      // return `${level}: ${timestamp} [${label}]: ${message}`;
      const time = new Date().toISOString();
      const msg = time + " [itemper-backend]: " + message;
      return msg;
  }

}
const log = () => new Log();
log().info("logger: Application log created");

export default log();

export function setLevel(level: string): void {
    log().setLevel(level);
}
