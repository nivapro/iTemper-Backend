# iTemper - backend
This is the server side of `iTemper.io`. You also need the `iTemper front-end` web application and one or more devices running `iTemper device`. In addition an database server running MongoDB is required.

> **Language: Typescript**



| Component         | Description                       | Technologies                                              |
|-------------------|-----------------------------------|-----------------------------------------------------------|
| iTemper front-end | iTemper.io web application        | Vue, Vuetify, Highcharts, Websockets                      |
| iTemper back-end  | iTemper.io REST API               | Node.js, Mongoose, Mongo DB                               |
| iTemper device    | iTemper.io sensor device firmware | Node.js, USB-HID tested on Raspberry w Zero and Windows   |


| Server            | Components                        | Comments                                                  |
|-------------------|-----------------------------------|-----------------------------------------------------------|
| vs.vading.lan     | iTemper front-end, reverse proxy  | web sites test.itemper.io, itemper.io                     |
| itemper.vading.lan| iTemper back-end, mongodb         | Docker, Node.js, Mongo DB                                 |
| Rasperberry Zero| | iTemper device                    | Docker, Node.js, BalenaOS                                 |
| Azure IOT Hub     |                                   |                                                           |
