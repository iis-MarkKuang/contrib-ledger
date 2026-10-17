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
// Start nonces at a millisecond timestamp so a server restart never reuses a
// nonce that was already consumed onchain by a previous run. The contract's
// nonce is an arbitrary uint256, not required to be contiguous.
let nextNonce = BigInt(Date.now());

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
  nextNonce = BigInt(Date.now());
}

/** Remove a pending submission after it is confirmed on chain. Returns true if found. */
export function removePending(repo: string, prOrIssueId: string): boolean {
  const before = items.length;
  for (let i = 0; i < items.length; i++) {
    if (items[i].repo === repo && items[i].prOrIssueId === prOrIssueId) {
      items.splice(i, 1);
      return true;
    }
  }
  return before !== items.length;
}
