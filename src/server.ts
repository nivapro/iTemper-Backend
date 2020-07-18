import * as config from "./services/config";
import log from "./services/logger";
import express from "express";

import { initApp } from "./app";

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

// Create server

const app = express();

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

// Use reverse proxy in production
// Need to run https in development to allow Web Bluetooth device requests
const server = config.PRODUCTION ? useHttp() : useHttps();

const wsOptions = { clientTracking: true, perMessageDeflate: false, noServer: true, path: "/ws"};
const wss = new WebSocket.Server(wsOptions);

wss.on("connection", (ws: WebSocket, request: http.IncomingMessage): void  => {
  log.info("server.app.ws: new connection from client, url=: " + ws.url);
  log.info("server.app.ws: new connection from client, headers= " + JSON.stringify(request.headers));
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

monitor.init(wss);
initApp(app);

server.listen(config.PORT, () => {
  log.info(
    "server: web server listening at port " + config.PORT +
    " in " + app.get("env") + " mode");
});
