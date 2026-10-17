import { createHmac, timingSafeEqual } from "node:crypto";
import type { Request } from "express";
import { isAddress } from "ethers";
import { DEMO_SCORE_INPUT } from "./demoValuation.js";
import { addPending, countPending, findPending, takeNonce, type PendingSubmission } from "./pending.js";
import { signContribution } from "./sign.js";
import { valueContribution } from "./valuation.js";

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

  const existing = findPending(work.repo, String(work.number));
  if (existing) return { status: 200, body: { ok: true, recorded: true } };

  const signing = readSigningConfig();
  if (!signing) return { status: 503, body: { error: "signing config is incomplete" } };

  const nonce = takeNonce();
  const valuationScore = valueContribution({
    ...DEMO_SCORE_INPUT,
    scoredInWindow: countPending(signing.contributor),
  });
  const signature = await signContribution(signing.privateKey, signing.chainId, signing.contractAddress, {
    contributor: signing.contributor,
    prOrIssueId: BigInt(work.number),
    valuationScore: BigInt(valuationScore),
    repo: work.repo,
    nonce,
  });
  const item: PendingSubmission = {
    contributor: signing.contributor,
    prOrIssueId: String(work.number),
    valuationScore: String(valuationScore),
    repo: work.repo,
    nonce: nonce.toString(),
    signature,
    kind: work.kind,
    title: work.title,
  };
  addPending(item);
  return { status: 200, body: { ok: true, recorded: true } };
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
