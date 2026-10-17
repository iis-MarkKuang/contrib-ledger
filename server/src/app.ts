import express from "express";
import type { IncomingMessage } from "node:http";
import { pendingSubmissions } from "./pending.js";
import { handleWebhook } from "./webhook.js";

export function createApp() {
  const app = express();
  app.use(
    express.json({
      verify: (req, _res, buf) => {
        (req as IncomingMessage & { rawBody?: Buffer }).rawBody = Buffer.from(buf);
      },
    }),
  );

  app.get("/health", (_req, res) => {
    res.json({ ok: true, service: "contrib-ledger" });
  });

  app.get("/pending", (_req, res) => {
    res.json(pendingSubmissions());
  });

  app.post("/webhook", (req, res, next) => {
    handleWebhook(req)
      .then((result) => {
        res.status(result.status).json(result.body);
      })
      .catch(next);
  });

  return app;
}
