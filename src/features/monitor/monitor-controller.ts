import * as WebSocket from "ws";
import * as http from "http";
import log from "../../services/logger";

import * as monitor from "./monitor";

import { Response, Request } from "express";
 const moduleName = "monitor-controller.";
 function label(name: string): string {
   return moduleName + name + ": ";
 }
 export let getWebSocket = (req: Request, res: Response): void => {
  const m = "getWebSocket, " + res.locals.tenantID;

  res.locals.wss.once("connection", (ws: WebSocket, request: http.IncomingMessage): void  => {
    log.info(label(m) + " (connection): new connection from client, url=: " + ws.url);
    log.info(label(m) + " (connection): from client, headers= " + JSON.stringify(request.headers));
    const message = {command: "ping", data: "Hello world from server"};
    ws.send(JSON.stringify(message));

    ws.on("close", (ws: WebSocket, code: number, reason: string): void => {
      log.info(label(m) + "(close): " + ws.url + " + code: " + code +  "reason: " + reason);
    });

    ws.on("message", (data: Buffer): void => {
      log.info(label(m) + "(message):  message=" + data.toString());

      monitor.parseInboundMessage(ws, data);
    });
    ws.on("error", (err): void => {
        log.error("ws.on: Error: " + err);
    });
  });
 };
