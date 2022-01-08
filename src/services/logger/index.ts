import { LOG_LEVEL } from "./../config";
import { createLogger, format, transports, Logger } from "winston";
const { combine, timestamp, printf, label } = format;
const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${level}: ${timestamp} [${label}]: ${message}`;
});


export class Log {
  private static logger: Logger;

  private static transports = {
    file: new transports.File({ filename: "itemper-error.log", level: "error" }),
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
      transports: [
        Log.transports.file,
        Log.transports.console,
      ],
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
    }
    public debug (report: string) {
      Log.logger.debug(this.appendTenant(report));
    }

    public error (report: string) {
      Log.logger.error(this.appendTenant(report));
    }

    public setLevel(level: string): void {
      Log.logger.transports[1].level = level;
  }

}
const log = () => new Log();
log().info("logger: New application log created");
export default log();

export function setLevel(level: string): void {
    log().setLevel(level);
}
  // let v: winston.LoggerOptions;
// if we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
// if (process.env.NODE_ENV !== 'production') {
// logger.add(new winston.transports.Console({
//     format: winston.configure({

//     })
// }));
// }
