
import log from "../src/services/logger";
log.setLevel("debug");
import { app } from "../src/app";
import supertest  from "supertest";
const request = supertest(app);

import * as TestDbs from "./dbs";

let token = "";

beforeAll(async done => {
  TestDbs.initDatabases();
  let res = await request
  .post("/signup")
  .send({
    email: "test1@test.com",
    password: "Hemligt",
    confirmPassword: "Hemligt"
  });
  expect(res.status).toBe(200);
  expect(res.body.token).toBeDefined();
  expect(res.body.tenantID).toBeDefined();
  token = res.body.token;

  res = await request
  .post("/devices")
  .set("Authorization", "bearer " + token)
  .send({
    name: "Hejhoppilingonskogen",
  });
  expect(res.status).toBe(200);
  expect(res.body.name).toBeDefined();
  expect(res.body.deviceID).toBeDefined();
  expect(res.body.key).toBeDefined();
  done();
});

afterAll(async done => {
  TestDbs.closeDatabases();
  done();
});

describe("UPDATE LOG-LEVEL", () => {
  test("Wrong log-level value should return 422", async done => {
    const res = await request
    .put("/admin")
    .set("Authorization", "bearer " + token)
    .send({"level": "hej"});
    expect(res.status).toBe(422);
    done();
  });
  test("Correct setting value should return 200", async done => {
    const res = await request
    .put("/admin")
    .set("Authorization", "bearer " + token)
    .send({"level": "debug"});
    expect(res.status).toBe(200);
    done();
  });
  test("Correct setting value should return 200", async done => {
    const res = await request
    .put("/admin")
    .set("Authorization", "bearer " + token)
    .send({"level": "info"});
    expect(res.status).toBe(200);
    done();
  });
  test("Correct setting value should return 200", async done => {
    const res = await request
    .put("/admin")
    .set("Authorization", "bearer " + token)
    .send({"level": "error"});
    expect(res.status).toBe(200);
    done();
  });
});

