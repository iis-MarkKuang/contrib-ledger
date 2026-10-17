import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { once } from "node:events";
import type { Server } from "node:http";
import { describe, it, beforeEach } from "node:test";
import { createApp } from "./app.js";
import { resetPending } from "./pending.js";
import { resetVoting } from "./voting.js";

const SECRET = "test-webhook-secret";
const CONTRIBUTOR = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

describe("webhook", () => {
  beforeEach(() => {
    resetPending();
    resetVoting();
    process.env.GITHUB_WEBHOOK_SECRET = SECRET;
    process.env.MAINTAINER_PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
    process.env.DEMO_CONTRIBUTOR_ADDRESS = CONTRIBUTOR;
    process.env.CHAIN_ID = "31337";
    process.env.CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  });

  it("stores a signed merged pull request and rejects a bad signature", async () => {
    const server = await listen();
    try {
      const base = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
      const merged = await post(base, "pull_request", {
        action: "closed",
        pull_request: { number: 7, merged: true, title: "Add ledger" },
        repository: { full_name: "iis-MarkKuang/contrib-ledger-demo" },
      });
      assert.equal(merged.status, 200);

      const voting = (await (await fetch(`${base}/voting`)).json()) as Array<{
        prOrIssueId: string;
        repo: string;
        voteCount: number;
        threshold: number;
      }>;
      assert.equal(voting.length, 1);
      assert.equal(voting[0].prOrIssueId, "7");
      assert.equal(voting[0].repo, "iis-MarkKuang/contrib-ledger-demo");
      assert.equal(voting[0].voteCount, 0);
      assert.equal(voting[0].threshold, 3);

      const pending = (await (await fetch(`${base}/pending`)).json()) as unknown[];
      assert.equal(pending.length, 0);

      const unmerged = await post(base, "pull_request", {
        action: "closed",
        pull_request: { number: 8, merged: false, title: "WIP" },
        repository: { full_name: "iis-MarkKuang/contrib-ledger-demo" },
      });
      assert.equal(unmerged.status, 200);
      assert.equal(((await (await fetch(`${base}/voting`)).json()) as unknown[]).length, 1);

      const bad = await fetch(`${base}/webhook`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-github-event": "pull_request",
          "x-hub-signature-256": "sha256=00",
        },
        body: JSON.stringify({ action: "closed" }),
      });
      assert.equal(bad.status, 401);
    } finally {
      server.close();
      await once(server, "close");
    }
  });
});

function listen(): Promise<Server> {
  const server = createApp().listen(0);
  return once(server, "listening").then(() => server);
}

function post(base: string, event: string, payload: unknown): Promise<Response> {
  const body = JSON.stringify(payload);
  const signature = `sha256=${createHmac("sha256", SECRET).update(body).digest("hex")}`;
  return fetch(`${base}/webhook`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-github-event": event,
      "x-hub-signature-256": signature,
    },
    body,
  });
}
