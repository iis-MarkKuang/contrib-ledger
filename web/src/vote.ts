import { BrowserProvider } from "ethers";

export type VoteTask = {
  repo: string;
  prOrIssueId: string;
  kind: "pull_request" | "issue";
  title: string;
  createdAt: number;
  voteCount: number;
  threshold: number;
};

export type VoteInfo = {
  repo: string;
  prOrIssueId: string;
  votes: { voter: string; score: number }[];
  count: number;
  threshold: number;
  ready: boolean;
};

export async function fetchTasks(serverUrl: string): Promise<VoteTask[]> {
  const res = await fetch(`${serverUrl}/voting`);
  if (!res.ok) throw new Error(`拉取评分任务失败 (${res.status})`);
  return (await res.json()) as VoteTask[];
}

export async function fetchVotes(serverUrl: string, repo: string, prOrIssueId: string): Promise<VoteInfo> {
  const res = await fetch(`${serverUrl}/votes/${encodeURIComponent(repo)}/${encodeURIComponent(prOrIssueId)}`);
  if (!res.ok) throw new Error(`拉取评分失败 (${res.status})`);
  return (await res.json()) as VoteInfo;
}

export async function submitVote(
  ethereum: EthereumProvider,
  serverUrl: string,
  repo: string,
  prOrIssueId: string,
  score: number,
): Promise<{ ok: boolean; count: number; threshold: number; ready: boolean; voter?: string; error?: string }> {
  const provider = new BrowserProvider(ethereum);
  const signer = await provider.getSigner();
  const voter = await signer.getAddress();
  const message = `${repo}:${prOrIssueId}:${score}`;
  const signature = await provider.send("personal_sign", [message, voter]);
  const res = await fetch(`${serverUrl}/vote`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ repo, prOrIssueId, score, signature }),
  });
  const body = (await res.json()) as Record<string, unknown>;
  if (!res.ok) {
    return { ok: false, count: 0, threshold: 0, ready: false, error: String(body.error ?? `评分失败 (${res.status})`) };
  }
  return {
    ok: Boolean(body.ok),
    count: Number(body.count ?? 0),
    threshold: Number(body.threshold ?? 0),
    ready: Boolean(body.ready),
    voter: typeof body.voter === "string" ? body.voter : undefined,
    error: typeof body.error === "string" ? body.error : undefined,
  };
}

type EthereumProvider = { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> };
