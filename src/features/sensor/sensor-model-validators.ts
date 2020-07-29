import { Attributes, Category, Descriptor, Sample, SensorData, SensorLog } from "./sensor-model";

export function isSensorDataArrayValid(raw: unknown): boolean {
    let valid = Array.isArray(raw);
    if (valid) {
        const data = raw as SensorData[];
        data.forEach((sensorData) => valid = valid && isSensorDataValid(sensorData));
    }
    return valid;
}
export function isSensorLogValid(raw: unknown): boolean {
    let valid = isObject(raw);
    if (valid) {
        const data = raw as Partial<SensorLog>;
        valid = valid
        && !!data.desc && isDescriptorValid(data.desc)
        && !!data.samples && isSamplesValid(data.samples);
    }
    return valid;
}
export function isSensorDataValid(raw: unknown): boolean {
    let valid = isObject(raw);
    if (valid) {
        const data = raw as Partial<SensorData>;
        valid = valid
        && !!data._id && typeof data._id === "string"
        && !!data.deviceID && typeof data.deviceID === "string"
        && !!data.attr && isAttributesValid(data.attr)
        && !!data.desc && isDescriptorValid(data.desc)
        && !!data.samples && isSamplesValid(data.samples);
    }
    return valid;
}
function isObject(raw: unknown): boolean {
    return typeof raw === "object" && raw !== null;
}
export function isAttributesValid(raw: unknown): boolean {
    let valid = isObject(raw);
    if (valid) {
        const attr = raw as Partial<Attributes>;
        valid = valid
        && !!attr.accuracy && typeof attr.accuracy === "number"
        && !!attr.category && typeof attr.category in Category
        && !!attr.maxSampleRate && typeof attr.maxSampleRate === "number"
        && !!attr.model && typeof attr.model === "string"
        && !!attr.resolution && typeof attr.resolution === "number";
    }
    return valid;
}
export function isDescriptorValid(raw: unknown): boolean {
    let valid = isObject(raw);
    if (valid) {
        const desc = raw as Partial<Descriptor>;
        valid = valid
        && !!desc.SN && typeof desc.SN === "number"
        && !!desc.port && typeof desc.port === "number";
    }
    return valid;
}
export function isDescriptorArrayValid(raw: unknown): boolean {
    let valid = Array.isArray(raw);
    if (valid) {
        const descs = raw as Partial<Descriptor[]>;
        descs.forEach((desc) => {
            valid = valid
            && isDescriptorValid(desc);
        });
    }
    return valid;
}
export function isSamplesValid(raw: unknown): boolean {
    let valid = Array.isArray(raw);
    if (valid) {
        const data = raw as Partial<Sample[]>;
        data.forEach((sample) => {
            valid = valid && !!sample
            && !!sample.date && typeof sample.date === "number" && sample.date >= 0
            && !!sample.value && typeof sample.value === "number";
        } );
    }
    return valid;
}
