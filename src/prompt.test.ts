import { describe, it } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { createApp } from "./app.js";

const app = createApp(async (prompt) => `agent said: ${prompt}`);

describe("POST /prompt", () => {
  it("returns the agent response in message", async () => {
    const response = await request(app)
      .post("/prompt")
      .send({ prompt: "best cocktail bar?" });

    assert.equal(response.status, 200);
    assert.deepEqual(response.body, { message: "agent said: best cocktail bar?" });
  });

  it("rejects a missing prompt", async () => {
    const response = await request(app).post("/prompt").send({});

    assert.equal(response.status, 400);
    assert.deepEqual(response.body, { message: "prompt is required" });
  });
});
