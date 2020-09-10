"use strict";
import log from "../../services/logger";
import * as util from "../../services/util";

import { Response, Request } from "express";
import { body, query, param, validationResult } from "express-validator";
import { Model } from "mongoose";
import { ISensor, SensorInterface, SensorLog, Attributes, Descriptor, SensorSchema } from "./sensor-model";

import * as monitor from "./../monitor/monitor";
import { sample, sampleSize } from "lodash";

const moduleName = "sensor-controller.";
function label(name: string): string {
  return moduleName + name + ": ";
}

export const getValidatorSN = [
  param("sn").exists().isLength({min: 4, max: 12})
];

export const getValidatorSNPort = [
  param("sn").exists().isLength({min: 4, max: 12}),
  param("port").exists().isInt({ min: 0, max: 8 })
];
export const postValidator = [
  body ("desc", "desc missing").exists(),
  body ("desc.SN", "serial number missing" ).exists().isLength({min: 4}),
  body ("desc.port", "port number missing" ).exists(),
  body ("attr.model", "attributes missing" ).exists()
];

export const deleteValidator = [
  param("sn").exists().isLength({min: 4, max: 12})
];

export const postDataValidator = [
  param("sn").exists().isLength({min: 4, max: 12}),
  param("port").exists().isInt({ min: 0, max: 7 }),
  body ("samples", "samples missing").exists()
];

// Get all sensors
export let getSensors = (req: Request, res: Response) => {
  const m = "getSensors" + ", tenantID=" + res.locals.tenantID;
  const Sensor: Model<ISensor> = res.locals.Sensor ;
  log.debug(label(m) + "begin");
  try {

    res.setHeader("Content-Type", "application/json");

    if (req.query.samples) {
      query("samples").isInt({ min: 1, max: 99 });
    }

    if (req.query.from) {
      query("from").isInt({ min: 0 });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.mapped() });
    }
    const samples: number = parseInt(req.query.samples as string);
    const myFrom: number = parseInt(req.query.from as string);
    log.debug(label(m) + "host IP=" + req.ips.toString() + ", samples=" + samples + " from=" + myFrom);
    if (myFrom) {

      const condition = { $gt: [ "$$sample.date", myFrom ] };
      Sensor.aggregate([
        { $match: { last: { $gt: myFrom }}},
        { $project: {
            deviceID: true,
            desc: true,
            attr: true,
            samples: {
              $filter: {
                input: "$samples",
                as: "sample",
                cond: condition
              }
            }
        }
        }], function(err: any, sensors: SensorInterface[]) {
          if (err) {
              res.status(503).end();
          } else if (sensors.length === 0) {
              res.status(200).send(JSON.stringify(sensors));
              log.debug(label(m) + "No sensor data found for specified period");
          } else {
              for (const sensor of sensors) {
                if (samples && sensor.samples.length > samples) {
                  sensor.samples = sensor.samples.slice(0, samples);
                }
              }
              log.info(label(m) + "Sensor data found and sent");
              res.status(200).send(JSON.stringify(sensors));
          }
        });
    } else {
        Sensor.find( {}, {"samples": { $slice: -samples }},
          function(err, sensors) {
            if (err) {
              res.status(503).send(JSON.stringify(err));
            } else if (sensors.length === 0) {
              log.debug(label(m) + "No sensor samples found");
              res.status(200).end();
            } else {
                log.info(label(m) + "Sensor samples found and sent");
                res.status(200).send(sensors);
            }});
    }
  } catch (e) {
    res.status(400).end();
    log.error(label(m) + "Error=" + e);
  }
};

export let getSensorsSN = (req: Request, res: Response) => {
  const Sensor: Model<ISensor> = res.locals.Sensor ;
  log.debug("getSensorsSN: " + req.query.toString());
  try {

    res.setHeader("Content-Type", "application/json");

    const onlySN: boolean = true;
    let samples: number = 1;

    if (req.query.samples) {
      query("samples").isInt({ min: 1, max: 99 });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.mapped() });
    }

    samples = parseInt(req.query.samples as string);

    Sensor.find({ "desc.SN": req.params.sn}, { "samples": { $slice: -samples }},
      function(err: any, sensors: SensorInterface[]) {
        if (err) {
          res.status(503).send();
        } else if (sensors.length === 0) {
          res.status(404).end();
        } else {
            res.status(200).send(sensors);
        }});
  } catch (e) {
    res.status(400).end();
  }

};
export let getSensorsSNPort = (req: Request, res: Response) => {
  const Sensor: Model<ISensor> = res.locals.Sensor ;
  log.debug("getSensorsSNPort: " + req.query.toString());
  try {
    res.setHeader("Content-Type", "application/json");

    let samples: number = 1;

    if (req.query.samples) {
      query("samples").isInt({ min: 1, max: 99 });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.mapped() });
    }

    samples = parseInt(req.query.samples as string);

    Sensor.find({ "desc.SN": req.params.sn, "desc.port": req.params.port })
        .select( {"samples": { $slice: -samples }})
        .exec(function(err, sensors) {
          if (err) {
            res.status(503).send();
          } else if (sensors.length === 0) {
            res.status(404).end();
          } else {
              res.status(200).send(sensors);
          }});
  } catch (e) {
    res.status(404).end();
  }

};


// Create a sensor
export let postSensors = (req: Request, res: Response) => {
  const m = "postSensors" + ", tenantID=" + res.locals.tenantID;
  log.debug(label(m) + "res.locals.Sensor=" + util.stringify(res.locals.Sensor));
  const Sensor: Model<ISensor> = res.locals.Sensor ;
  const deviceID = res.locals.deviceID;
  const deviceName = res.locals.deviceName;
  try {
    res.setHeader("Content-Type", "application/json");
    log.debug(label(m) + "try");
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      log.debug(label(m) + "validation error");
      return res.status(422).json({ errors: errors.mapped(), deviceID, name: deviceName });
    }
    const desc: Descriptor = req.body.desc;
    const attr: Attributes = req.body.attr;
    if (desc.SN !== deviceName) {
        log.info(label(m) + "Cannot create sensor: " + JSON.stringify(desc) + ". Sensor SN does not match device name");
        return res.status(308).send({deviceID, name: deviceName});
    }

    Sensor.findOne({ "desc.SN": desc.SN, "desc.port": desc.port }, "desc", function (err, sensor) {
      log.debug(label(m) + "findOne sensor=" + JSON.stringify(sensor));
      if (sensor === null) {
            // Sensor does not exist, let's create and save it
        const sensor = new Sensor({ deviceID: deviceID, desc: desc, attr: attr, samples: []});

        sensor.save(function (err) {
          log.debug(label(m) + "saving " + JSON.stringify(desc) );
          if (err) {
            log.error(label(m) + "Cannot save sensor " + JSON.stringify(desc) + " error=" + JSON.stringify(err));
            return res.status(503).end();
          }
          log.info(label(m) + "Sensor " + JSON.stringify(desc) + " registered");
          res.setHeader("Content-Location", req.path + "/" + desc.SN + "/" + desc.port);
          res.status(200).send(sensor);
        });
      } else {
        log.debug(label(m) + "OK! Sensor " + JSON.stringify(desc) + " registered already");
        return res.status(200).end();
      }
    });
  }
  catch (e) {
    return res.status(400).end();
  }
};

// Called by devices when logging sensor data
export let postSensorData = (req: Request, res: Response) => {
  const tenantID = res.locals.tenantID;
  const m = "postSensorData" + "tenantID=" + tenantID;
  const Sensor: Model<ISensor> = res.locals.Sensor;
  const deviceID = res.locals.deviceID;
  const deviceName = res.locals.deviceName;

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.mapped(), deviceID, name: deviceName });
    }
    const sensorLog: SensorLog = req.body;

    if (sensorLog.desc.SN !== deviceName) {
      log.debug(label(m) + "Refused " + JSON.stringify(sensorLog.desc) + ". SN does not match device name.");
      return res.status(308).send({deviceID, name: deviceName});
    }

    monitor.sendSensorLog(tenantID, deviceID, sensorLog);

    // find sensor and push each sample to the end of the sensor.samples array
    // return the sensor object with the newly pushed samples
    // sample = {val: 59, time: 1535530450}
    // day = ISODate("2018-08-29")
    // db.iot.updateOne({deviceid: 1234, sensorid: 3, nsamples: {$lt: 200}, day: day},
    //                  {
    //                           $push: { samples: sample},
    //                           $min: { first: sample.time},
    //                           $max: { last: sample.time},
    //                           $inc: { nsamples: 1}
    //                   },
    //                   { upsert: true } )
    const now = new Date(Date.now());
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours());
    const lastSampleDate = Math.max(...sensorLog.samples.map(sample => sample.date));
    const firstSampleDate = Math.min(...sensorLog.samples.map(sample => sample.date));

    Sensor.update({ deviceID, "desc.SN": req.params.sn, "desc.port": req.params.port, date },
                  {
                    $push: { "samples": { $each: sensorLog.samples } },
                    $min: { first: firstSampleDate },
                    $max: { last: lastSampleDate },
                    $inc: { count: sensorLog.samples.length}
                  },
                  { upsert: true },
      function (err, sensor) {
        if (err) {
          const code = 503;
          log.error(label(m) + "findOneAndUpdate error responding with %s, err=%s",  code, JSON.stringify(err));
          return res.status(503).send(err);
        }
        if (sensor) {
          log.debug(label(m) + "Sensor data logged for sensor " + JSON.stringify(sensorLog.desc));
          res.status(200).end();
        } else {
          log.debug(label(m) + "Sensor " + JSON.stringify(sensorLog.desc) + " not found, register required before posting sensor data");
          res.status(404).send({deviceID, name: deviceName });
        }
      });
  }
  catch (e) {
    return res.status(400).end();
  }

};

// Delete a sensor
export let postDeleteSensors = (req: Request, res: Response) => {
  const m = "postDeleteSensors" + ", tenantID=" + res.locals.tenantID;
  const Sensor: Model<ISensor> = res.locals.Sensor ;

  log.debug(label(m) + JSON.stringify(req.body));
  try {
    res.setHeader("Content-Type", "application/json");
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.mapped() });
    }

    const desc: Descriptor = req.body.desc;
    Sensor.findOneAndRemove({ "desc.SN": desc.SN, "desc.port": desc.port }, function(err, sensor) {
      if (err) {
        log.error(label(m) + "error=" + JSON.stringify(err));
        res.status(503).end();
      } else {
        log.info(label(m) + "Sensor deleted");
        res.status(200).send(JSON.stringify(sensor));
      }});
  } catch (e) {
    log.error(label(m) + "error=", e);
    return res.status(409).end();
  }

};

export let notImplemented = (req: Request, res: Response) => {
  log.error("notImplemented: method not implemented");
  const method = req.method;
  const headers = req.headers;
  const url = req.url;
  const body = req.body;
  log.info("- Method: " + JSON.stringify(method));
  log.info("- Headers: " + JSON.stringify(headers));
  log.info("- url: " + JSON.stringify(url));
  log.info("- body: " + JSON.stringify(body));
  res.status(200).end();
};