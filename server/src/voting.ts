export type VoteTask = {
  repo: string;
  prOrIssueId: string;
  kind: "pull_request" | "issue";
  title: string;
  createdAt: number;
};

export type Vote = {
  voter: string;
  score: number;
  signature: string;
};

export const VOTE_THRESHOLD = 3;

const tasks: VoteTask[] = [];
const votes: Record<string, Vote[]> = {};

function key(repo: string, prOrIssueId: string): string {
  return `${repo}/${prOrIssueId}`;
}

export function addVotingTask(task: VoteTask): void {
  if (findTask(task.repo, task.prOrIssueId)) return;
  tasks.push(task);
  votes[key(task.repo, task.prOrIssueId)] = [];
}

export function findTask(repo: string, prOrIssueId: string): VoteTask | undefined {
  return tasks.find((t) => t.repo === repo && t.prOrIssueId === prOrIssueId);
}

export function listTasks(): VoteTask[] {
  return [...tasks];
}

export function listVotes(repo: string, prOrIssueId: string): Vote[] {
  return [...(votes[key(repo, prOrIssueId)] ?? [])];
}

export function hasVoted(repo: string, prOrIssueId: string, voter: string): boolean {
  return (votes[key(repo, prOrIssueId)] ?? []).some((v) => v.voter.toLowerCase() === voter.toLowerCase());
}

export function addVote(repo: string, prOrIssueId: string, vote: Vote): void {
  const k = key(repo, prOrIssueId);
  if (!votes[k]) votes[k] = [];
  votes[k].push(vote);
}

export function voteCount(repo: string, prOrIssueId: string): number {
  return (votes[key(repo, prOrIssueId)] ?? []).length;
}

export function isReady(repo: string, prOrIssueId: string): boolean {
  return voteCount(repo, prOrIssueId) >= VOTE_THRESHOLD;
}

export function averageScore(repo: string, prOrIssueId: string): number {
  const list = votes[key(repo, prOrIssueId)] ?? [];
  if (list.length === 0) return 0;
  const sum = list.reduce((acc, v) => acc + v.score, 0);
  return Math.floor(sum / list.length);
}

export function removeTask(repo: string, prOrIssueId: string): void {
  const k = key(repo, prOrIssueId);
  const idx = tasks.findIndex((t) => t.repo === repo && t.prOrIssueId === prOrIssueId);
  if (idx >= 0) tasks.splice(idx, 1);
  delete votes[k];
}

export function resetVoting(): void {
  tasks.length = 0;
  for (const k of Object.keys(votes)) delete votes[k];
}
