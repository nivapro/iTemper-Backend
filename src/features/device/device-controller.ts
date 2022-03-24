"use strict";
import log from "../../services/logger";
import * as crypto from "../../services/crypto";

import { Response, Request } from "express";
import { body, param, validationResult, ValidationChain } from "express-validator";
import { DeviceModel, DeviceInterface } from "./device-model";
import { formatDeviceData, deviceDataReport } from "./device-status";

const moduleName = "device-controller.";
function label(name: string): string {
  return moduleName + name + ": ";
}
const DeviceIDValidator: ValidationChain = param ("deviceID").exists().isUUID(4);

const DataValidator: ValidationChain = body ("data", "Device data not found").exists();
const DataTimestampValidator: ValidationChain = body ("data.timestamp", "Device data timestamp not found").exists().isNumeric();
const DataUptimeValidator: ValidationChain = body ("data.uptime", "Device uptime not found").exists().isNumeric();
const DataHostnameValidator: ValidationChain = body ("data.hostname", "Device hostname not found").exists().isString();
const DataNetworksValidator: ValidationChain = body ("data.networkInterfaces", "Device networks not found").exists().isObject();

const NameValidator: ValidationChain = body ("name", "Device name is not valid, must be alphanumeric 4-32 characters")
  .exists().trim().isLength({min: 4, max: 32}).matches(/^[-_.#0-9A-Z]+$/i); // !$@%^&*()_+|~=`{}\[\]:";'<>?,\/ 
const NoNameValidator: ValidationChain = param ("name").not().exists();
const ColorValidator: ValidationChain = body ("color", "no color provided").exists().isHexColor();

export const DeviceIDFieldValidator = [DeviceIDValidator];
export const DeviceDataFieldValidator = [
      DataValidator, DataUptimeValidator, DataTimestampValidator,
      DataHostnameValidator, DataNetworksValidator
      ];
export const NameFieldValidator = [ NameValidator ];
export const NoNameFieldValidator = [NoNameValidator];
export const RenameFieldValidator = [DeviceIDValidator, NameValidator];
export const RegisterDeviceFieldValidator = [ NameValidator, ColorValidator ];
export const ChangeColorFieldValidator = [ ColorValidator ];

export const postRegisterDevice = (req: Request, res: Response): void => {
    const m = "postRegisterDevice, tenantID=" + res.locals.tenantID;
    const Device: DeviceModel = res.locals.Device;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
       res.status(422).json({ errors: errors.mapped() });
       return;
    }

    const name = req.body.name;
    const color = req.body.color;

    Device.findOne({name: name}).then(device => {
      if (device === null) {
        log.debug(label(m) + "Register device " + name);
        // Device does not exist, let's create one
        const deviceID = crypto.uuid();
        const secrete = crypto.uuid();
        const newDevice = new Device();
        newDevice.set("name", name);
        newDevice.set("color", color);
        newDevice.set("key", secrete); // will be hashed when the device is saved below.
        newDevice.set("deviceID", deviceID);
        newDevice.set("tenantID", res.locals.tenantID);

        const body = {name: newDevice.name, color: newDevice.color, deviceID: newDevice.deviceID, key: newDevice.deviceID + ":" + secrete};
        newDevice.save()
        .then(() => {
          log.info(label(m) + "Registered device=" + JSON.stringify(body));
          res.status(200).send(body);
        })
        .catch(() => {
          log.error(label(m) + "Error saving device " + name);
          res.status(404).send("Cannot save device " + name);
        });

      } else {
          log.debug(label(m) + "A device with that name already exists");
          res.status(404).send("Device " + name + " exists already");
      }
    });
  };
export const putDeviceName = (req: Request, res: Response): void => {
  const m = "putDeviceName, tenantID=" + res.locals.tenantID;
  const Device: DeviceModel = res.locals.Device;
  const tenantID = res.locals.tenantID;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
     res.status(422).json({ errors: errors.mapped() });
     return;
  }
  const deviceID = req.params.deviceID;
  const name = req.body.name;
  const filter = { deviceID: deviceID, tenantID: tenantID };
  const update = { name: name };
  const option = { new: true };
  Device.findOneAndUpdate(filter, update, option).then(device => {
      if (device) {
        const body = {name, deviceID, key: device.deviceID + ":" + device.key};
        log.info(label(m) + "Renamed device with deviceID=" + deviceID + " to " + name + "for tenantID=" + res.locals.tenantID);
        res.status(200).send(body);
      }
      else {
        log.error(label(m) + "Error renaming deviceID=" + deviceID + " for tenantID=" + res.locals.tenantID);
        res.status(404).send("Cannot rename device=" + name);
      }
    }).catch(() => {
      log.info(label(m) + "The device does not exist for tenantID=" + res.locals.tenantID);
      res.status(400).send("Cannot rename device");
  });
};
export const putDeviceColor = (req: Request, res: Response): void => {
  const m = "putDeviceColor, tenantID=" + res.locals.tenantID;
  const Device: DeviceModel = res.locals.Device;
  const tenantID = res.locals.tenantID;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
     res.status(422).json({ errors: errors.mapped() });
     return;
  }
  const deviceID = req.params.deviceID;
  const color = req.body.color;
  const filter = { deviceID: deviceID, tenantID: tenantID };
  const update = { color: color };
  const option = { new: true };
  Device.findOneAndUpdate(filter, update, option).then(device => {
      if (device) {
        const body = {color, deviceID, key: device.deviceID + ":" + device.key};
        log.info(label(m) + "Color changed for device with deviceID=" + deviceID + " to " + color + "for tenantID=" + res.locals.tenantID);
        res.status(200).send(body);
      }
      else {
        log.error(label(m) + "Error changing color, deviceID=" + deviceID + " for tenantID=" + res.locals.tenantID);
        res.status(404).send("Cannot change device color to " + color);
      }
    }).catch(() => {
      log.info(label(m) + "The device does not exist for tenantID=" + res.locals.tenantID);
      res.status(400).send("Cannot change device color");
  });
};
export const postDeviceData = (req: Request, res: Response): void => {
  const m = "postDeviceData, tenantID=" + res.locals.tenantID;
  const Device: DeviceModel = res.locals.Device;
  const tenantID = res.locals.tenantID;
  const deviceID = res.locals.deviceID;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
     res.status(422).json({ errors: errors.mapped() });
     return;
  }
  const statusTime = req.body.data.timestamp;
  const deviceData = deviceDataReport(req.body.data);
  const filter = { deviceID: deviceID, tenantID: tenantID };
  const update = { statusTime,  deviceData: formatDeviceData(deviceData)};
  const option = { new: true };
  Device.findOneAndUpdate(filter, update, option).then(device => {
    const report = update.deviceData;
      if (device) {
        const body = { statusTime };
        log.info(label(m) + "Status report deviceID=" + deviceID + " for tenantID=" + res.locals.tenantID + ":\n" + report);
        res.status(200).send(body);
      }
      else {
        log.info(label(m) + "Error saving status report, deviceID=" + deviceID + " not found for tenantID=" + res.locals.tenantID);
        res.status(404).send("Cannot save status report");
      }
    }).catch(err => {
      log.error(label(m) + "The device does not exist for tenantID=" + res.locals.tenantID + ", err=" + err);
      res.status(400).send("Cannot save device status report");
  });
};

export const getAllDevices = (req: Request, res: Response): void => {
  const m = "getAllDevices, tenantID=" + res.locals.tenantID;
  const Device: DeviceModel = res.locals.Device;
  const tenantID = res.locals.tenantID;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
     res.status(422).json({ errors: errors.mapped() });
     return;
  }
  const filter = { tenantID: tenantID };
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  Device.find(filter)
  .then(devices => {
    const body: Partial<DeviceInterface>[] = [];
    devices.forEach(device => {
      const name = device.name;
      const color = device.color;
      const deviceID = device.deviceID;
      const key = device.deviceID + ":" + device.key;
      const statusTime = device.statusTime;
      const deviceData = device.deviceData;
      body.push({name, color, deviceID, key, statusTime, deviceData});
    });
    log.info(label(m) + "get #devices" + devices.length);
    res.status(200).send(body); 
  })
  .catch(() => res.status(404).end());
};

export const getDevice = (req: Request, res: Response): void => {
  const m = "getDevice, tenantID=" + res.locals.tenantID;
  const Device: DeviceModel = res.locals.Device;
  const tenantID = res.locals.tenantID;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
     res.status(422).json({ errors: errors.mapped() });
     return;
  }
  const deviceID = req.params.deviceID;
  const filter = { deviceID: deviceID, tenantID: tenantID };

  Device.findOne(filter)
  .then(device => {
    log.info(label(m) + "get deviceID=" + device.deviceID + "for tenantID=" + device.tenantID);
    const name = device.name;
    const color = device.color;
    const deviceID = device.deviceID;
    const key = device.deviceID + ":" + device.key;
    const statusTime = device?.statusTime;
    const deviceData = device?.deviceData;
    const body: Partial<DeviceInterface> = {name, color, deviceID, key, statusTime, deviceData};

    res.status(200).send(JSON.stringify(body)); })
  .catch((err) => res.status(404).send(err));
};

export const deleteDevice = (req: Request, res: Response): void => {
  const m = "deleteDevice";
  const Device: DeviceModel = res.locals.Device;
  const tenantID = res.locals.tenantID;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
     res.status(422).json({ errors: errors.mapped() });
     return;
  }
  const deviceID = req.params.deviceID;
  const filter = { deviceID: deviceID, tenantID: tenantID };
  Device.findOneAndRemove(filter).then(device => {
    if (device) {
      log.info(label(m) + "Deleted deviceID=" + device.deviceID + "for tenantID=" + res.locals.tenantID);
      const body = {name: device.name, deviceID: device.deviceID};
      res.status(200).send(body);
    } else {
      log.debug(label(m) + "The device does not exist for tenantID=" + res.locals.tenantID);
      res.status(404).send("Device id=" + deviceID + " does not exist");
    }
  });
};