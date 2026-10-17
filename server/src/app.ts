import express from "express";
import type { IncomingMessage } from "node:http";
import { isAddress, verifyMessage, getAddress } from "ethers";
import { findPending, pendingSubmissions, removePending } from "./pending.js";
import { handleWebhook, finalizeVote } from "./webhook.js";
import {
  addVote,
  averageScore,
  findTask,
  hasVoted,
  isReady,
  listTasks,
  listVotes,
  removeTask,
  voteCount,
  VOTE_THRESHOLD,
} from "./voting.js";

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

  app.get("/voting", (_req, res) => {
    const tasks = listTasks().map((t) => ({
      ...t,
      voteCount: voteCount(t.repo, t.prOrIssueId),
      threshold: VOTE_THRESHOLD,
    }));
    res.json(tasks);
  });

  app.get("/votes/:repo/:prOrIssueId", (req, res) => {
    const repo = decodeURIComponent(req.params.repo);
    const prOrIssueId = req.params.prOrIssueId;
    const list = listVotes(repo, prOrIssueId);
    res.json({
      repo,
      prOrIssueId,
      votes: list,
      count: list.length,
      threshold: VOTE_THRESHOLD,
      ready: isReady(repo, prOrIssueId),
    });
  });

  app.post("/vote", async (req, res, next) => {
    try {
      const repo = typeof req.body?.repo === "string" ? req.body.repo : "";
      const prOrIssueId = typeof req.body?.prOrIssueId === "string" ? req.body.prOrIssueId : "";
      const score = Number.parseInt(String(req.body?.score ?? ""), 10);
      const signature = typeof req.body?.signature === "string" ? req.body.signature : "";
      if (!repo || !prOrIssueId || !Number.isInteger(score) || score < 1 || score > 100 || !signature) {
        res.status(400).json({ error: "repo, prOrIssueId, score (1-100), signature are required" });
        return;
      }
      const task = findTask(repo, prOrIssueId);
      if (!task) {
        res.status(404).json({ error: "no voting task for this repo/prOrIssueId" });
        return;
      }
      const voter = verifyVoteSignature(repo, prOrIssueId, score, signature);
      if (!voter) {
        res.status(401).json({ error: "invalid signature" });
        return;
      }
      if (hasVoted(repo, prOrIssueId, voter)) {
        res.status(409).json({ error: "this voter already voted" });
        return;
      }
      addVote(repo, prOrIssueId, { voter, score, signature });
      const count = voteCount(repo, prOrIssueId);
      const ready = isReady(repo, prOrIssueId);
      if (ready) {
        const avg = averageScore(repo, prOrIssueId);
        await finalizeVote(repo, prOrIssueId, task.kind, task.title, avg);
        removeTask(repo, prOrIssueId);
      }
      res.json({ ok: true, count, threshold: VOTE_THRESHOLD, ready, voter });
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

/** Verify a voter's EIP-191 personal_sign over `repo:prOrIssueId:score`. Returns the recovered address or undefined. */
function verifyVoteSignature(repo: string, prOrIssueId: string, score: number, signature: string): string | undefined {
  const message = `${repo}:${prOrIssueId}:${score}`;
  try {
    const recovered = verifyMessage(message, signature);
    if (!recovered || recovered === "0x0000000000000000000000000000000000000000") return undefined;
    return getAddress(recovered);
  } catch {
    return undefined;
  }
}
