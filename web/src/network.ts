/** Chain ids the demo page knows. 10143 is documented in docs/monad-testnet.md. */
export const MONAD_TESTNET_CHAIN_ID = 10143n;
export const LOCAL_ANVIL_CHAIN_ID = 31337n;
export const DEFAULT_TESTNET_RPC = "https://testnet-rpc.monad.xyz";
export const MONAD_TESTNET_EXPLORER = "https://testnet.monadscan.com";

export type ChainParams = {
  chainId: bigint;
  chainName: string;
  rpcUrl: string;
  nativeSymbol: string;
  explorer?: string;
};

export function parseChainId(raw: string | undefined): bigint {
  if (!raw || !/^\d+$/.test(raw)) {
    throw new Error("VITE_CHAIN_ID is missing");
  }
  return BigInt(raw);
}

export function isExpectedChain(actual: bigint, expected: bigint): boolean {
  return actual === expected;
}

export function chainParams(chainId: bigint, rpcUrl: string | undefined): ChainParams {
  if (chainId === MONAD_TESTNET_CHAIN_ID) {
    return {
      chainId,
      chainName: "Monad Testnet",
      rpcUrl: rpcUrl || DEFAULT_TESTNET_RPC,
      nativeSymbol: "MON",
      explorer: MONAD_TESTNET_EXPLORER,
    };
  }
  if (chainId === LOCAL_ANVIL_CHAIN_ID) {
    if (!rpcUrl) throw new Error("VITE_RPC_URL is missing");
    return { chainId, chainName: "Anvil", rpcUrl, nativeSymbol: "ETH" };
  }
  throw new Error(`unsupported chain id ${chainId}`);
}

export function toHexChainId(chainId: bigint): string {
  return `0x${chainId.toString(16)}`;
}

export type NetworkChoice = "testnet" | "anvil";

export const ANVIL_RPC = "http://127.0.0.1:8545";
/** Anvil account 0. The address is public; the key stays out of the page. */
export const ANVIL_DEFAULT_ACCOUNT = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

export function chainLabel(chainId: bigint): string {
  if (chainId === MONAD_TESTNET_CHAIN_ID) return "Monad 测试网";
  if (chainId === LOCAL_ANVIL_CHAIN_ID) return "Anvil";
  return `Chain ${chainId}`;
}

export function paramsForChoice(choice: NetworkChoice): ChainParams {
  if (choice === "testnet") return chainParams(MONAD_TESTNET_CHAIN_ID, DEFAULT_TESTNET_RPC);
  return chainParams(LOCAL_ANVIL_CHAIN_ID, ANVIL_RPC);
}
