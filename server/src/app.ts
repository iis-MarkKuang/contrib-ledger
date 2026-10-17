import express from "express";
import type { IncomingMessage } from "node:http";
import { isAddress } from "ethers";
import { addPending, countPending, findPending, pendingSubmissions, removePending, takeNonce, type PendingSubmission } from "./pending.js";
import { handleWebhook } from "./webhook.js";
import { signContribution } from "./sign.js";
import { valueContribution } from "./valuation.js";
import { DEMO_SCORE_INPUT } from "./demoValuation.js";

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

  app.post("/pending/batch", async (req, res, next) => {
    try {
      const count = parseBatchCount(req.body?.count);
      const signing = readBatchSigningConfig();
      if (!signing) {
        res.status(503).json({ error: "signing config is incomplete" });
        return;
      }
      const created: PendingSubmission[] = [];
      for (let i = 0; i < count; i++) {
        const prOrIssueId = 1000 + i;
        const repo = "demo/batch";
        if (findPending(repo, String(prOrIssueId))) continue;
        const nonce = takeNonce();
        const score = valueContribution({
          ...DEMO_SCORE_INPUT,
          scoredInWindow: 0,
        });
        const signature = await signContribution(signing.privateKey, signing.chainId, signing.contractAddress, {
          contributor: signing.contributor,
          prOrIssueId: BigInt(prOrIssueId),
          valuationScore: BigInt(score),
          repo,
          nonce,
        });
        const item: PendingSubmission = {
          contributor: signing.contributor,
          prOrIssueId: String(prOrIssueId),
          valuationScore: String(score),
          repo,
          nonce: nonce.toString(),
          signature,
          kind: "pull_request",
          title: `Batch contribution ${i + 1}`,
        };
        addPending(item);
        created.push(item);
      }
      res.json({ ok: true, count: created.length });
    } catch (cause) {
      next(cause);
    }
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

function parseBatchCount(raw: unknown): number {
  const n = typeof raw === "number" ? raw : Number.parseInt(String(raw ?? "50"), 10);
  if (!Number.isInteger(n) || n < 1) return 50;
  return Math.min(n, 100);
}

function readBatchSigningConfig():
  | { privateKey: string; contributor: string; chainId: bigint; contractAddress: string }
  | undefined {
  const privateKey = process.env.MAINTAINER_PRIVATE_KEY;
  const contributor = process.env.DEMO_CONTRIBUTOR_ADDRESS;
  const chainId = process.env.CHAIN_ID;
  const contractAddress = process.env.CONTRACT_ADDRESS;
  if (!privateKey || !contributor || !chainId || !contractAddress) return undefined;
  if (!isAddress(contributor) || !isAddress(contractAddress)) return undefined;
  if (!/^\d+$/.test(chainId)) return undefined;
  return { privateKey, contributor, chainId: BigInt(chainId), contractAddress };
}
