"use strict";
import log from "../../services/logger";
import { move } from "../../services/util";
import { Response, Request } from "express";
import { body, param, validationResult, ValidationChain } from "express-validator/check";
import { Model } from "mongoose";
import { LocationDocument } from "./location-model";
import { ISensor, Descriptor } from "../sensor/sensor-model";
import path from "path";


import multer from "multer";

const moduleName = "location-controller.";
function label(name: string): string {
  return moduleName + name + ": ";
}


const NameValidator: ValidationChain = body ("name", "Location name is not valid, must be alphanumeric 4-32 characters").exists().trim().isLength({min: 4, max: 32});
const NoNameValidator: ValidationChain = param ("name").not().exists();
const ColorValidator: ValidationChain = param ("color").exists().isHexColor();
const LocationIDValidator: ValidationChain = param ("id").exists().isMongoId();

export const NameFieldValidator = [ NameValidator ];
export const NoNameFieldValidator = [NoNameValidator];
export const LocationIDFieldValidator = [LocationIDValidator];
export const RenameFieldValidator = [LocationIDValidator, NameValidator];

export let postCreateLocation = (req: Request, res: Response): void => {
    const m = "postCreateLocation, " + res.locals.tenantID;
    const Location: Model<LocationDocument> = res.locals.Location ;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
       res.status(422).json({ errors: errors.mapped() });
       return;
    }

    const name = req.body.name;

    Location.findOne({name: name}).then(location => {
      if (location === null) {
        log.debug(label(m) + "Creating location " + name);
            const color = req.body.color;
            const file: Express.Multer.File = req.file;
            log.debug(label(m) + "file=" + JSON.stringify(req.file));
            log.debug(label(m) + "files=" + JSON.stringify(req.files));
            const newLocation = new Location();
            newLocation.set("name", name);
            newLocation.set("color", color);
            if (file) {
              const locationImageFolder = file.destination + res.locals.tenantID + "/locations/";
              const filename = file.filename + path.extname(file.originalname);
              const finalPath = locationImageFolder + filename;
              newLocation.set("path", finalPath);
              move(file.path, finalPath, (err) => {
                if (err) {
                  log.error(label(m) +  "Cannot move " + file.path +
                                        " to destination " + finalPath + ", err=" + JSON.stringify(err));
                } else {
                  log.info(label(m) + "Stored location image " + file.originalname + " here: " + finalPath);
                }
              });
            }
            const body = {name: newLocation.name, color: newLocation.color, path: newLocation.path };
            newLocation.save()
            .then(() => {
              log.info(label(m) + "Saved new location=" + JSON.stringify(body));
              res.status(200).send(body);
            })
            .catch(() => {
              log.error(label(m) + "Error saving location name=" + name);
              res.status(404).send("Cannot save location " + name);
            });
      } else {
          log.debug (label(m) + "A location with that name already exists");
          res.status(404).send("Location " + name + " exists already");
      }
    });
  };

export let getAllLocations = (req: Request, res: Response): void => {
  const m = "getAllLocations, " + res.locals.tenantID;
  const Location: Model<LocationDocument> = res.locals.Location ;
  const Sensor: Model<ISensor> = res.locals.Sensor;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
     res.status(422).json({ errors: errors.mapped() });
     return;
  }

  Location.find({})
  .then(locations => {
    if (locations.length === 0) {
      someLocations(Sensor, Location, res.locals.tenantID).then((some) => {
        locations = some;
      });
    }
    log.info(label(m) + "get #location(s)=" + locations.length);
    res.status(200).send(JSON.stringify(locations));
    }
  ).catch((err) => {
    res.status(404).send("No locations found");
    log.error(label(m) + "Error=" + JSON.stringify(err));
  });
};

function someLocations(Sensor: Model<ISensor>,
  Location: Model<LocationDocument>, tenantID: string): Promise<LocationDocument[]> {
  return  new Promise((resolve, reject) => {
    const locations: LocationDocument[] = [];

    Sensor.find({}, "desc, attr", (err, sensors) => {

      if (sensors && sensors.length > 0) {
        for (const sensor of sensors) {
          const location = new Location();
          const locationName = sensor.desc.SN + "-" + sensor.desc.port;
          location.set("name", locationName);
          location.set("color", "");
          location.set("path", "/uploads/" + tenantID + "locations/" + locationName + ".jpg" );
          location.set("sensors", [sensor.desc]);
          locations.push(location);
        }
      }
      resolve(locations);
    });
  });
}
