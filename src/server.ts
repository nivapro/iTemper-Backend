import log from "./services/logger";
import * as http from "http";

import * as monitor from "./features/monitor/monitor";

import { app } from "./app";

import * as WebSocket from "ws";

const httpServer: http.Server = http.createServer(app);


const iTemperServer = httpServer.listen(app.get("port"), () => {
  log.info(
    "iTemper back-end app is running at port" + app.get("port") +
    " in " + app.get("env") + " mode");
  log.info("Press CTRL-C to stop\n");
});

export const wss = new WebSocket.Server({server: httpServer, clientTracking: true} );

monitor.init(wss);

wss.on("connection", (ws: WebSocket, request: http.IncomingMessage): void  => {

  log.info("server.wss.on(connection): new connection from client, url/headers: " + ws.url + "/" + JSON.stringify(request.headers));
  const message = {command: "ping", data: "Hello world from server"};
  ws.send(JSON.stringify(message));

  ws.on("close", (ws: WebSocket, code: number, reason: string): void => {
    log.info("server.wss.on(close): Websocket: " + ws.url + " + code: " + code +  "reason: " + reason);
  });

  ws.on("message", (data: Buffer): void => {
    log.debug("server.wss.on (message):  message=" + data.toString());

    monitor.parseInboundMessage(ws, data);

  });

  ws.on("error", (err): void => {
      log.debug("ws.on: Error: " + err);
    });
} );
