import { Contract, BrowserProvider, type Eip1193Provider } from "ethers";

const abi = [
  "function submitContribution(address contributor,uint256 prOrIssueId,uint256 valuationScore,string repo,uint256 nonce,bytes signature) returns (uint256)",
];

export type PendingItem = {
  contributor: string;
  prOrIssueId: string;
  valuationScore: string;
  repo: string;
  nonce: string;
  signature: string;
  kind: "pull_request" | "issue";
  title: string;
};

export async function fetchPending(serverUrl: string): Promise<PendingItem[]> {
  const res = await fetch(`${serverUrl}/pending`);
  if (!res.ok) throw new Error(`拉取待提交列表失败 (${res.status})`);
  return (await res.json()) as PendingItem[];
}

export async function removePending(serverUrl: string, repo: string, prOrIssueId: string): Promise<boolean> {
  const res = await fetch(
    `${serverUrl}/pending/${encodeURIComponent(repo)}/${encodeURIComponent(prOrIssueId)}`,
    { method: "DELETE" },
  );
  return res.ok;
}

export async function submitContribution(
  provider: Eip1193Provider,
  contractAddress: string,
  item: PendingItem,
): Promise<string> {
  const browser = new BrowserProvider(provider);
  const signer = await browser.getSigner();
  const contract = new Contract(contractAddress, abi, signer);
  const tx = await contract.submitContribution(
    item.contributor,
    BigInt(item.prOrIssueId),
    BigInt(item.valuationScore),
    item.repo,
    BigInt(item.nonce),
    item.signature,
  );
  return typeof tx.hash === "string" ? tx.hash : String(tx.hash);
}

export type BatchResult = {
  item: PendingItem;
  ok: boolean;
  txHash?: string;
  error?: string;
};

export async function submitBatch(
  provider: Eip1193Provider,
  contractAddress: string,
  items: PendingItem[],
  onProgress: (done: number, total: number) => void,
): Promise<BatchResult[]> {
  const browser = new BrowserProvider(provider);
  const signer = await browser.getSigner();
  const contract = new Contract(contractAddress, abi, signer);
  const results: BatchResult[] = [];
  let done = 0;
  const promises = items.map(async (item) => {
    try {
      const tx = await contract.submitContribution(
        item.contributor,
        BigInt(item.prOrIssueId),
        BigInt(item.valuationScore),
        item.repo,
        BigInt(item.nonce),
        item.signature,
      );
      const txHash = typeof tx.hash === "string" ? tx.hash : String(tx.hash);
      done += 1;
      onProgress(done, items.length);
      return { item, ok: true, txHash } as BatchResult;
    } catch (cause) {
      done += 1;
      onProgress(done, items.length);
      return { item, ok: false, error: cause instanceof Error ? cause.message : "提交失败" } as BatchResult;
    }
  });
  for (const p of promises) results.push(await p);
  return results;
}
