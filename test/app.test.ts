
import log from "../src/services/logger";
log.setLevel("error");
import { app } from "../src/app";
import supertest  from "supertest";
const request = supertest(app);

import * as TestDbs from "./dbs";

beforeAll((done) => {
  TestDbs.initDatabases();
  done();
});

afterAll((done) => {
  TestDbs.closeDatabases();
  done();
});
describe("POST /signup", () => {
    test("New user should return 200 and JWT token", async done => {
        const res = await request
        .post("/signup")
        .send({
          email: "test1@test.com",
          password: "Hemligt",
          confirmPassword: "Hemligt"
        });
        expect(res.status).toBe(200);
        expect(res.body.token).toBeDefined();
        done();
    });
    test("New user should return 200 and JWT token", async done => {
      const res = await request
      .post("/signup")
      .send({
        email: "test2@test.com",
        password: "Hemligt",
        confirmPassword: "Hemligt"
      });
      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      done();
  });
    test("Already existing user should return 401", async done => {
        const res = await request
        .post("/signup")
        .send({
          email: "test1@test.com",
          password: "Hemligt",
          confirmPassword: "Hemligt"
        });
        expect(res.status).toBe(401);
        done();
    });
    test("Incorrect password length should return 401", async done => {
        const res = await request
        .post("/signup")
        .send({
          email: "test3@test.com",
          password: "Hem",
          confirmPassword: "Hem"
        });
        expect(res.status).toBe(401);
        done();
    });
// });

// describe("POST /login", () => {
    test("None existing username should return 401", async done => {
        const res = await request
        .post("/login")
        .send({
          email: "test3@test.com",
          password: "Hemligt",
        });
        expect(res.status).toBe(401);
        done();
    });
    test("Invalid username should return 401", async done => {
        const res = await request
        .post("/login")
        .send({
          email: "test1",
          password: "Hemligt",
        });
        expect(res.status).toBe(401);
        done();
    });
    test("Correct credentials should return 200 and JWT token", async done => {
        const res = await request
        .post("/login")
        .send({
          email: "test1@test.com",
          password: "Hemligt",
        });
        expect(res.status).toBe(200);
        expect(res.body.token).toBeDefined();
        done();
    });
});