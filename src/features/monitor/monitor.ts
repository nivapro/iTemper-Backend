

import * as WebSocket from "ws";
import log from "../../services/logger";
import { Descriptor, SensorLog } from "./../sensor/sensor-model";

/* eslint-disable  @typescript-eslint/no-explicit-any */
export interface InboundMessage {
    command: "startMonitor" | "stopMonitor";
    data: any;
}

/* eslint-disable  @typescript-eslint/no-explicit-any */
export interface OutboundMessage {
    command: "sensors" | "settings"| "setting" |  "log" | "ping";
    data: any;
}
let wss: WebSocket.Server;

export function init (webSocketServer: WebSocket.Server) {
    wss = webSocketServer;
}
export function broadcast(message: OutboundMessage) {
    const msgString = JSON.stringify(message);
    wss.clients.forEach((client) => {
        client.send(msgString);
    })
}
const MonitoringClients = new Set<WebSocket>()
export function send(data: SensorLog) {
    const message: OutboundMessage = { command: "log", data};
    const messageStr = JSON.stringify(message);
    MonitoringClients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(messageStr);
            log.debug("monitor.broadcast: message sent url=" + client.url);
          }
    })
}

export function parseInboundMessage(ws: WebSocket, data: string): void  {
    try {
        const message = JSON.parse(data) as Partial<InboundMessage>;
        if ('command' in message ) {
            log.debug("monitor.parseInboundMessage: received message=" + message);
            switch (message.command) {
                case "startMonitor":
                    startMonitor(ws);
                    break;
                case "stopMonitor":
                    stopMonitor(ws);
                    break;
              }
        }
    } catch (e) {
        log.debug("monitor.parseInboundMessage: error=" + e);
    }
}

export function startMonitor(ws: WebSocket) {
    if (!MonitoringClients.has(ws)) {
        MonitoringClients.add(ws);
    }
    log.info ("monitor.startMonitor: " + MonitoringClients.size + " clients");
}

export function stopMonitor(ws: WebSocket) {
    if (MonitoringClients.has(ws)) {
        MonitoringClients.delete(ws);
    }
    log.info ("monitor.stopMonitor: " + MonitoringClients.size + " clients");
}




