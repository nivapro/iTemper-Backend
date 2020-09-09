import mongoose from "mongoose";

export enum Category {
  Temperature,
  AbsoluteHumidity,
  RelativeHumidity,
  WindSpeed,
}

export interface Sample {
  value: number;
  date: number;
}
export interface Descriptor {
  SN: string;
  port: string;

}
export interface Attributes {
   model: string;
   category: Category;
   accuracy: number;
   resolution: number;
   maxSampleRate: number;
}

export interface SensorData extends SensorInterface {
  _id: string;
}
export interface SensorInterface {
  deviceID: string;
  desc: Descriptor;
  attr: Attributes;
  samples: Sample[];
}

// export interface Log {
//   date: number;
//   value: number;
// }
export interface SensorLog {
  desc: Descriptor;
  samples: Sample[];
}

export interface ISensor extends SensorInterface, mongoose.Document {}

export const SensorSchema = new mongoose.Schema({
    deviceID: String,
    desc: {
      SN: String,
      port: Number
    },

    attr: {
      model: String,
      category: String,
      accuracy: Number,
      resolution: Number,
      maxSampleRate: Number
    },

    samples: [{
      _id: false,  // if true, Mongodb creates _id implicitly. We do not want that here
      date: Number,
      value: Number
    }],
    count: Number,
    first: Number,
    last: Number,
    date: Date
  },
  // usePushEach: Enables push of each sensors value, otherwise the pushed values
  // will be treated as a separate array object in the samples array
  {
    usePushEach: true
  });


// export const SensorModel = mongoose.model<SensorDocument>("Sensor", SensorSchema);

