import { describe, it } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { app } from "./app.js";

describe("GET /docs.json", () => {
  it("returns an OpenAPI spec for POST /prompt", async () => {
    const response = await request(app).get("/docs.json");

    assert.equal(response.status, 200);
    assert.equal(response.body.openapi.startsWith("3."), true);
    assert.equal(response.body.paths["/prompt"].post.summary, "Send a prompt");
  });
});

describe("GET /docs", () => {
  it("serves the Swagger UI", async () => {
    const response = await request(app).get("/docs/");

    assert.equal(response.status, 200);
    assert.match(response.headers["content-type"] ?? "", /text\/html/);
    assert.match(response.text, /swagger/i);
  });
});
