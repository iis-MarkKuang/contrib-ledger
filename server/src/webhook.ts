import { createHmac, timingSafeEqual } from "node:crypto";
import type { Request } from "express";
import { isAddress } from "ethers";
import { addPending, findPending, takeNonce, type PendingSubmission } from "./pending.js";
import { addVotingTask, findTask } from "./voting.js";
import { signContribution } from "./sign.js";

type WebhookBody = {
  action?: string;
  pull_request?: { number?: number; merged?: boolean; title?: string };
  issue?: { number?: number; state_reason?: string; title?: string };
  repository?: { full_name?: string };
};

export async function handleWebhook(req: Request): Promise<{ status: number; body: Record<string, unknown> }> {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  const rawBody = (req as Request & { rawBody?: Buffer }).rawBody;
  if (!secret || !signatureMatches(secret, rawBody, req.header("x-hub-signature-256"))) {
    return { status: 401, body: { error: "invalid signature" } };
  }

  if (req.header("x-github-event") === "ping") {
    return { status: 200, body: { ok: true } };
  }

  const payload = req.body as WebhookBody;
  const work = acceptedWork(req.header("x-github-event"), payload);
  if (!work) return { status: 200, body: { ok: true, recorded: false } };

  // Already signed and in pending list (e.g. from /pending/seed or a previous vote round)
  if (findPending(work.repo, String(work.number))) {
    return { status: 200, body: { ok: true, recorded: true } };
  }
  // Already has a voting task
  if (findTask(work.repo, String(work.number))) {
    return { status: 200, body: { ok: true, recorded: true } };
  }

  // Create a voting task instead of signing immediately. Community scores first.
  addVotingTask({
    repo: work.repo,
    prOrIssueId: String(work.number),
    kind: work.kind,
    title: work.title,
    createdAt: Date.now(),
  });
  return { status: 200, body: { ok: true, recorded: true, voting: true } };
}

/** Sign a contribution after the vote threshold is met. Called from the vote endpoint. */
export async function finalizeVote(repo: string, prOrIssueId: string, kind: PendingSubmission["kind"], title: string, score: number): Promise<void> {
  const signing = readSigningConfig();
  if (!signing) throw new Error("signing config is incomplete");
  const nonce = takeNonce();
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
    kind,
    title,
  };
  addPending(item);
}

function acceptedWork(
  event: string | undefined,
  payload: WebhookBody,
): { kind: PendingSubmission["kind"]; number: number; repo: string; title: string } | undefined {
  const repo = payload.repository?.full_name;
  if (!repo) return undefined;
  if (event === "pull_request" && payload.action === "closed" && payload.pull_request?.merged === true) {
    const number = payload.pull_request.number;
    if (!Number.isInteger(number) || number === undefined || number < 0) return undefined;
    return { kind: "pull_request", number, repo, title: payload.pull_request.title ?? "" };
  }
  if (event === "issues" && payload.action === "closed" && payload.issue?.state_reason === "completed") {
    const number = payload.issue.number;
    if (!Number.isInteger(number) || number === undefined || number < 0) return undefined;
    return { kind: "issue", number, repo, title: payload.issue.title ?? "" };
  }
  return undefined;
}

function readSigningConfig():
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

function signatureMatches(secret: string, body: Buffer | undefined, header: string | undefined): boolean {
  if (!body || !header) return false;
  const digest = createHmac("sha256", secret).update(body).digest("hex");
  const expected = Buffer.from(`sha256=${digest}`);
  const actual = Buffer.from(header);
  if (expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
}
