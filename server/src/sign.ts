import { Wallet, type TypedDataDomain, type TypedDataField } from "ethers";

export const CONTRIBUTION_DOMAIN_NAME = "ContributionRegistry";
export const CONTRIBUTION_DOMAIN_VERSION = "1";

export const CONTRIBUTION_TYPES: Record<string, TypedDataField[]> = {
  Contribution: [
    { name: "contributor", type: "address" },
    { name: "prOrIssueId", type: "uint256" },
    { name: "valuationScore", type: "uint256" },
    { name: "repo", type: "string" },
    { name: "nonce", type: "uint256" },
  ],
};

export type ContributionPayload = {
  contributor: string;
  prOrIssueId: bigint;
  valuationScore: bigint;
  repo: string;
  nonce: bigint;
};

export function contributionDomain(chainId: bigint, verifyingContract: string): TypedDataDomain {
  return {
    name: CONTRIBUTION_DOMAIN_NAME,
    version: CONTRIBUTION_DOMAIN_VERSION,
    chainId,
    verifyingContract,
  };
}

export async function signContribution(
  privateKey: string,
  chainId: bigint,
  verifyingContract: string,
  payload: ContributionPayload,
): Promise<string> {
  const wallet = new Wallet(privateKey);
  return wallet.signTypedData(contributionDomain(chainId, verifyingContract), CONTRIBUTION_TYPES, payload);
}
