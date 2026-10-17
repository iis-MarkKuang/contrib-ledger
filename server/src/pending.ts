export type PendingSubmission = {
  contributor: string;
  prOrIssueId: string;
  valuationScore: string;
  repo: string;
  nonce: string;
  signature: string;
  kind: "pull_request" | "issue";
  title: string;
};

const items: PendingSubmission[] = [];
let nextNonce = 1n;

export function pendingSubmissions(): PendingSubmission[] {
  return [...items];
}

export function findPending(repo: string, prOrIssueId: string): PendingSubmission | undefined {
  return items.find((item) => item.repo === repo && item.prOrIssueId === prOrIssueId);
}

export function countPending(contributor: string): number {
  return items.filter((item) => item.contributor.toLowerCase() === contributor.toLowerCase()).length;
}

export function takeNonce(): bigint {
  const nonce = nextNonce;
  nextNonce += 1n;
  return nonce;
}

export function addPending(item: PendingSubmission): void {
  items.push(item);
}

export function resetPending(): void {
  items.length = 0;
  nextNonce = 1n;
}
