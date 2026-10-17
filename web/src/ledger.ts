import { Contract, JsonRpcProvider, getAddress, isAddress } from "ethers";
import type { NetworkChoice } from "./network";

const abi = [
  "event ContributionSubmitted(address indexed contributor, uint256 indexed prOrIssueId, uint256 valuationScore, uint256 timestamp, address indexed submitter)",
  "event ReputationMinted(address indexed to, uint256 indexed tokenId)",
  "function getContributorScore(address contributor) view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
];

export type ContributionRow = {
  contributor: string;
  prId: string;
  score: string;
  txHash: string;
  blockNumber: number;
};

/** Public Monad testnet RPC rejects eth_getLogs when toBlock - fromBlock is greater than 100. */
export const MAX_BLOCK_DISTANCE = 100;
/** About 13 minutes at a 400ms block time. */
export const TESTNET_LOOKBACK = 2_000;

export function logWindows(fromBlock: number, toBlock: number): Array<[number, number]> {
  const windows: Array<[number, number]> = [];
  for (let start = fromBlock; start <= toBlock; start += MAX_BLOCK_DISTANCE + 1) {
    windows.push([start, Math.min(start + MAX_BLOCK_DISTANCE, toBlock)]);
  }
  return windows;
}

export function scanFromBlock(latest: number, local: boolean): number {
  if (local || latest <= TESTNET_LOOKBACK) return 0;
  return latest - TESTNET_LOOKBACK;
}

export function isLocalRpc(rpcUrl: string): boolean {
  return rpcUrl.includes("127.0.0.1") || rpcUrl.includes("localhost");
}

export function txUrl(explorer: string | undefined, txHash: string): string | undefined {
  if (!explorer) return undefined;
  return `${explorer}/tx/${txHash}`;
}

/** First contract deployed by Anvil account 0. Present on the local node checked 2026-10-17. */
export const ANVIL_CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export function parseAddress(input: string): string | undefined {
  const match = input.match(/0x[0-9a-fA-F]{40}/);
  if (!match || !isAddress(match[0])) return undefined;
  return getAddress(match[0]);
}

export function lookupTarget(input: string, connected?: string): string | undefined {
  if (input.trim() === "") return connected ? parseAddress(connected) : undefined;
  return parseAddress(input);
}

/** EIP-7702 delegation is 0xef0100 plus a 20-byte address. That account is not this registry. */
export function hasRegistryCode(code: string): boolean {
  return code !== "0x" && !/^0xef0100[0-9a-fA-F]{40}$/i.test(code);
}

export async function isContract(rpcUrl: string, address: string): Promise<boolean> {
  const code = await new JsonRpcProvider(rpcUrl).getCode(address);
  return hasRegistryCode(code);
}

export function contractAddressFor(
  choice: NetworkChoice,
  env: { testnet?: string; anvil?: string } = {
    testnet: import.meta.env.VITE_CONTRACT_ADDRESS,
    anvil: import.meta.env.VITE_ANVIL_CONTRACT_ADDRESS,
  },
): string | undefined {
  const raw = (choice === "anvil" ? env.anvil : env.testnet)?.trim();
  const fallback = choice === "anvil" ? ANVIL_CONTRACT_ADDRESS : raw;
  const picked = raw && isAddress(raw) ? raw : fallback;
  return picked && isAddress(picked) ? getAddress(picked) : undefined;
}

export async function listContributions(rpcUrl: string, address: string): Promise<ContributionRow[]> {
  const contract = registry(rpcUrl, address);
  const logs = await queryInWindows(contract, contract.filters.ContributionSubmitted(), rpcUrl);
  return logs.map((log) => ({
    contributor: String(log.args.contributor),
    prId: String(log.args.prOrIssueId),
    score: String(log.args.valuationScore),
    txHash: log.transactionHash,
    blockNumber: Number(log.blockNumber),
  }));
}

export async function readContributor(
  rpcUrl: string,
  address: string,
  contributor: string,
): Promise<{ score: string; tokenIds: string[] }> {
  const contract = registry(rpcUrl, address);
  const score = await contract.getContributorScore(contributor);
  const minted = await queryInWindows(contract, contract.filters.ReputationMinted(contributor), rpcUrl);
  const tokenIds: string[] = [];
  for (const log of minted) {
    const tokenId = log.args.tokenId as bigint;
    const owner = (await contract.ownerOf(tokenId)) as string;
    if (owner.toLowerCase() === contributor.toLowerCase()) tokenIds.push(tokenId.toString());
  }
  return { score: score.toString(), tokenIds };
}

function registry(rpcUrl: string, address: string): Contract {
  return new Contract(address, abi, new JsonRpcProvider(rpcUrl));
}

type ParsedLog = { args: Record<string, unknown>; transactionHash: string; blockNumber: number };

async function queryInWindows(
  contract: Contract,
  filter: Parameters<Contract["queryFilter"]>[0],
  rpcUrl: string,
): Promise<ParsedLog[]> {
  const provider = contract.runner as JsonRpcProvider;
  const latest = await provider.getBlockNumber();
  const from = scanFromBlock(latest, isLocalRpc(rpcUrl));
  const logs: ParsedLog[] = [];
  for (const [start, end] of logWindows(from, latest)) {
    for (const log of await contract.queryFilter(filter, start, end)) {
      if (!("args" in log)) continue;
      logs.push({ args: log.args as Record<string, unknown>, transactionHash: log.transactionHash, blockNumber: log.blockNumber });
    }
  }
  return logs;
}
