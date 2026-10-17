interface ImportMetaEnv {
  readonly VITE_SERVER_URL: string;
  readonly VITE_RPC_URL: string;
  readonly VITE_CHAIN_ID: string;
  readonly VITE_CONTRACT_ADDRESS: string;
  readonly VITE_ANVIL_CONTRACT_ADDRESS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on: (event: string, listener: (...args: unknown[]) => void) => void;
}

interface Window {
  ethereum?: EthereumProvider;
}
