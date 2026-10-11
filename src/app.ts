import express from "express";
import swaggerUi from "swagger-ui-express";
import { openapiSpec } from "./swagger.js";
import { invokeAgent } from "./main.js";

export type InvokeAgent = (prompt: string) => Promise<string>;

export function createApp(runAgent: InvokeAgent) {
  const app = express();

  app.use(express.json());

  app.get("/docs.json", (_req, res) => {
    res.json(openapiSpec);
  });

  app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapiSpec));

  app.post("/prompt", async (req, res) => {
    const prompt = req.body?.prompt;

    if (typeof prompt !== "string" || prompt.trim() === "") {
      res.status(400).json({ message: "prompt is required" });
      return;
    }

    const message = await runAgent(prompt);
    res.json({ message });
  });

  return app;
}

export const app = createApp(invokeAgent);
