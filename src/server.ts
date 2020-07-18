import * as config from "./services/config";
import log from "./services/logger";
import { app } from "./app";

import * as fs from "fs";
import * as https from "https";
import * as http from "http";
import * as WebSocket from "ws";

import * as monitor from "./features/monitor/monitor";


// DB Databases
import { userDBConnectionString, tenantDBConnectionString } from "./services/config";

import * as UserDatabase from "./features/user/user-database";
UserDatabase.initialize(userDBConnectionString);

import * as TenantDatabase from "./features/tenant/tenant-database";
TenantDatabase.initialize(tenantDBConnectionString);

function useHttps() {
  const serverOptions: https.ServerOptions = {
    key: fs.readFileSync("./certs/server-cert.key"),
    cert: fs.readFileSync("./certs/server-cert.pem"),
  };
  log.info("server: Creating https web server");
  const server = https.createServer(serverOptions, app);
  return server;
}

function useHttp() {
  log.info("server: Creating http web server");
  const server = http.createServer(app);
  return server;
}

const server = config.PRODUCTION ? useHttp() : useHttps();

export const wss = new WebSocket.Server({
    server,
    clientTracking: true,
    perMessageDeflate: false
  });

monitor.init(wss);

server.on("upgrade", function upgrade(request, socket, head) {
  const ip = request.headers["x-forwarded-for"].split(/\s*,\s*/)[0];
  log.info("server.on(upgrade) -----" + ip + " ---");
  wss.handleUpgrade(request, socket, head, function done(ws) {
    wss.emit("connection", ws, request);
  });
});

wss.on("connection", (ws: WebSocket, request: http.IncomingMessage): void  => {
  log.info("server.wss.on(connection): new connection from client, url=: " + ws.url);
  log.info("server.wss.on(connection): new connection from client, headers= " + JSON.stringify(request.headers));
  const message = {command: "ping", data: "Hello world from server"};
  ws.send(JSON.stringify(message));

  ws.on("close", (ws: WebSocket, code: number, reason: string): void => {
    log.info("server.wss.on(close): Websocket: " + ws.url + " + code: " + code +  "reason: " + reason);
  });

  ws.on("message", (data: Buffer): void => {
    log.info("server.wss.on (message):  message=" + data.toString());

    monitor.parseInboundMessage(ws, data);

  });

  ws.on("error", (err): void => {
      log.error("ws.on: Error: " + err);
    });
} );

server.listen(config.PORT, () => {
  log.info(
    "server: web server listening at port " + config.PORT +
    " in " + app.get("env") + " mode");
});
