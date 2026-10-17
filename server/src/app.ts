import express from "express";
import type { IncomingMessage } from "node:http";
import { pendingSubmissions, removePending } from "./pending.js";
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

  app.use((_req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    if (_req.method === "OPTIONS") {
      res.status(204).end();
      return;
    }
    next();
  });

  app.get("/health", (_req, res) => {
    res.json({ ok: true, service: "contrib-ledger" });
  });

  app.get("/pending", (_req, res) => {
    res.json(pendingSubmissions());
  });

  app.delete("/pending/:repo/:prOrIssueId", (req, res) => {
    const repo = decodeURIComponent(req.params.repo);
    const prOrIssueId = req.params.prOrIssueId;
    if (!repo || !prOrIssueId) {
      res.status(400).json({ error: "repo and prOrIssueId are required" });
      return;
    }
    const removed = removePending(repo, prOrIssueId);
    res.status(removed ? 200 : 404).json({ ok: removed });
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
