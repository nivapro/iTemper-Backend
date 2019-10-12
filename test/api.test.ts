import request from "supertest";
import app from "../src/app";

describe("GET //sensors", () => {
  it("should return 200 OK", () => {
    return request(app).get("//sensors")
      .expect(200);
  });
});
