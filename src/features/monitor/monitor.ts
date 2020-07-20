import * as WebSocket from "ws";
import * as http from "http";
import log from "../../services/logger";
import { Descriptor, SensorLog } from "./../sensor/sensor-model";

export interface InboundMessage {
    command: "startMonitor" | "stopMonitor";
    data: any;
}
export interface OutboundMessage {
    command: "sensors" | "settings"| "setting" |  "log" | "ping";
    data: any;
}
let wss: WebSocket.Server;

export function init (webSocketServer: WebSocket.Server) {
    wss = webSocketServer;
    wss.on("connection", (ws: WebSocket, request: http.IncomingMessage): void  => {
        log.info("monitor.init: new connection from client, url=: " + ws.url);
        log.info("monitor.init: new connection from client, headers= " + JSON.stringify(request.headers));
        const message = {command: "ping", data: "Hello world from server"};
        ws.send(JSON.stringify(message));

        ws.on("close", (ws: WebSocket, code: number, reason: string): void => {
          log.info("monitor.init.on(close): Websocket: " + ws.url + " + code: " + code +  "reason: " + reason);
        });

        ws.on("message", (data: Buffer): void => {
          log.info("monitor.init.on (message):  message=" + data.toString());

          parseInboundMessage(ws, data);

        });
        ws.on("error", (err): void => {
            log.error("ws.on: Error: " + err);
          });
      } );
}
export function send(data: SensorLog) {
    const message: OutboundMessage = { command: "log", data};
    const messageStr = JSON.stringify(message);
    log.info("monitor.send: sending message=" + messageStr + " to #clients " + wss.clients.size);

    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(messageStr);
          log.debug("monitor.send: message sent to client");
        }
      });
}

export function parseInboundMessage(ws: WebSocket, data: Buffer): void  {
    const message = <InboundMessage> JSON.parse(data.toString());
    log.debug("monitor.parseInboundMessage: received message=" + message);
    switch (message.command) {
        case "startMonitor":
            message.data = <Descriptor[]> <any> message.data;
            startMonitor(ws, message.data);
            break;
        case "stopMonitor":
            message.data = <Descriptor[]> <any> message.data;
            stopMonitor(ws, message.data);
            break;
      }
}
const MonitoringClients = new Set();

export function startMonitor(ws: WebSocket, desc: Descriptor[]) {
    log.info("monitor.startMonitor: has not implemented filter on Desc yet: " + JSON.stringify(desc));
    if (!MonitoringClients.has(ws)) {
        MonitoringClients.add(ws);
    }
    log.info ("monitor.startMonitor: " + MonitoringClients.size + " clients");
}
export function stopMonitor(ws: WebSocket, desc: Descriptor[]) {
    log.info("monitor.stopMonitor: has not implemented filter on Desc yet: " + JSON.stringify(desc));

    if (MonitoringClients.has(ws)) {
        MonitoringClients.delete(ws);
    }

    log.info ("monitor.stopMonitor: " + MonitoringClients.size + " clients");
}
