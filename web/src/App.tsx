import { useEffect, useRef, useState, type FormEvent } from "react";
import { BrowserProvider } from "ethers";
import {
  contractAddressFor,
  isContract,
  listContributions,
  lookupTarget,
  parseAddress,
  readContributor,
  txUrl,
  type ContributionRow,
} from "./ledger";
import {
  ANVIL_DEFAULT_ACCOUNT,
  chainLabel,
  isExpectedChain,
  paramsForChoice,
  toHexChainId,
  type ChainParams,
  type NetworkChoice,
} from "./network";
import { isMissingChain, isPendingWalletRequest } from "./wallet";

const STORAGE_KEY = "contrib-ledger-network";

type WalletState = {
  account?: string;
  chainId?: bigint;
};

export function App() {
  const [choice, setChoice] = useState<NetworkChoice>(storedChoice);
  const [wallet, setWallet] = useState<WalletState>({});
  const [error, setError] = useState<string>();
  const expected = paramsForChoice(choice);
  const wrongChain = wallet.chainId !== undefined && !isExpectedChain(wallet.chainId, expected.chainId);
  const switching = useRef(false);

  useEffect(() => {
    const ethereum = window.ethereum;
    if (!ethereum) return;
    void readWallet().then(setWallet);
    const onChange = () => {
      void readWallet().then(setWallet);
    };
    ethereum.on("chainChanged", onChange);
    ethereum.on("accountsChanged", onChange);
  }, []);

  async function choose(next: NetworkChoice) {
    setChoice(next);
    localStorage.setItem(STORAGE_KEY, next);
    setError(undefined);
    if (!window.ethereum) return;
    const target = paramsForChoice(next);
    try {
      const current = await readWallet();
      if (current.chainId === target.chainId) {
        setWallet(current);
        return;
      }
    } catch {
      // The switch below reports a wallet that cannot be read.
    }
    if (switching.current) {
      setError("MetaMask 已有一个待确认的请求。请先在钱包弹窗里完成或关闭它，再选一次。");
      return;
    }
    switching.current = true;
    try {
      await switchChain(target);
      setWallet(await readWallet());
    } catch (cause) {
      setError(walletMessage(cause));
    } finally {
      switching.current = false;
    }
  }

  return (
    <main className="shell">
      <header className="masthead">
        <p className="eyebrow">开源贡献认证</p>
        <h1>Contrib Ledger</h1>
        <p className="lede">链下估值，维护者签名，贡献者自己把记录提交到 Monad 测试网。</p>
      </header>
      <fieldset className="network-box">
        <legend>网络</legend>
        <div className="network-options">
          <label className="net-card">
            <input
              type="radio"
              name="network"
              checked={choice === "testnet"}
              onChange={() => void choose("testnet")}
            />
            <span className="net-name">Monad 测试网</span>
            <span className="net-meta">Chain 10143 · MON</span>
          </label>
          <label className="net-card">
            <input
              type="radio"
              name="network"
              checked={choice === "anvil"}
              onChange={() => void choose("anvil")}
            />
            <span className="net-name">本地 Anvil</span>
            <span className="net-meta">Chain 31337 · 127.0.0.1</span>
          </label>
        </div>
        <p className="hint">演示部署在 Monad 测试网。Anvil 只用来看本机节点。</p>
      </fieldset>
      <section className="wallet-bar">
        {!window.ethereum ? <p className="notice">请安装 MetaMask。</p> : null}
        {window.ethereum ? (
          <button
            type="button"
            onClick={() => void connect().then(setWallet).catch((cause: unknown) => setError(message(cause)))}
          >
            连接 MetaMask
          </button>
        ) : null}
        {wallet.account ? (
          <p className="account">
            MetaMask {parseAddress(wallet.account) ?? wallet.account}
            {wallet.chainId !== undefined ? ` · ${chainLabel(wallet.chainId)}` : ""}
          </p>
        ) : null}
        {choice === "anvil" ? <p className="account">本机账户 {ANVIL_DEFAULT_ACCOUNT}</p> : null}
      </section>
      {wrongChain ? (
        <p className="notice">当前钱包网络不是 {expected.chainName}。请在上面的框里重新选一次。</p>
      ) : null}
      {error ? <p className="notice notice-error">{error}</p> : null}
      <Dashboard
        choice={choice}
        rpcUrl={expected.rpcUrl}
        explorer={expected.explorer}
        connected={wallet.account}
      />
    </main>
  );
}

function Dashboard({
  choice,
  rpcUrl,
  explorer,
  connected,
}: {
  choice: NetworkChoice;
  rpcUrl: string;
  explorer?: string;
  connected?: string;
}) {
  const address = contractAddressFor(choice);
  const [rows, setRows] = useState<ContributionRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string>();
  const [lookup, setLookup] = useState("");
  const [holder, setHolder] = useState<{ score: string; tokenIds: string[] }>();
  const [holderError, setHolderError] = useState<string>();

  useEffect(() => {
    setHolder(undefined);
    setHolderError(undefined);
    setLookup(choice === "anvil" ? ANVIL_DEFAULT_ACCOUNT : "");
  }, [choice]);

  useEffect(() => {
    setRows([]);
    setLoaded(false);
    setLoadError(undefined);
    if (!address) return;
    let cancelled = false;
    void isContract(rpcUrl, address)
      .then((deployed) => {
        if (cancelled) return;
        if (!deployed) {
          setLoadError("这个地址在当前网络上没有合约。");
          setLoaded(true);
          return;
        }
        return listContributions(rpcUrl, address).then((next) => {
          if (cancelled) return;
          setRows(next);
          setLoaded(true);
        });
      })
      .catch((cause: unknown) => {
        if (cancelled) return;
        setLoadError(message(cause));
        setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [rpcUrl, address]);

  async function queryHolder(event: FormEvent) {
    event.preventDefault();
    setHolder(undefined);
    setHolderError(undefined);
    if (!address) return;
    const target = lookupTarget(lookup, connected);
    if (!target) {
      setHolderError(lookup.trim() === "" ? "请填写贡献者地址" : "地址格式不对");
      return;
    }
    try {
      setHolder(await readContributor(rpcUrl, address, target));
    } catch (cause) {
      setHolderError(message(cause));
    }
  }

  return (
    <section className="dashboard">
      <h2>贡献</h2>
      {address ? <p className="account">合约 {address}</p> : null}
      {!address ? <p className="notice">还没有填写这条网络的合约地址。</p> : null}
      {loadError ? <p className="notice notice-error">{loadError}</p> : null}
      {loaded && address && rows.length === 0 && !loadError ? <p className="hint">还没有贡献记录。</p> : null}
      {explorer ? <p className="hint">测试网公共 RPC 每次最多查 100 个区块，这里显示最近大约 2000 个区块。</p> : null}
      {rows.length > 0 ? (
        <ul className="contrib-list">
          {rows.map((row) => {
            const href = txUrl(explorer, row.txHash);
            return (
              <li key={row.txHash}>
                <span>{shortAddress(row.contributor)}</span>
                <span>PR {row.prId}</span>
                <span>{row.score} 分</span>
                {href ? (
                  <a href={href}>交易</a>
                ) : (
                  <span title={row.txHash}>本地交易</span>
                )}
              </li>
            );
          })}
        </ul>
      ) : null}
      <form className="lookup" onSubmit={(event) => void queryHolder(event)}>
        <label>
          贡献者地址
          <input value={lookup} onChange={(event) => setLookup(event.target.value)} placeholder="0x..." />
        </label>
        <button type="submit" disabled={!address}>
          查询积分和 NFT
        </button>
      </form>
      {holder ? (
        <p className="account">
          积分 {holder.score}。声誉 NFT {holder.tokenIds.length === 0 ? "无" : holder.tokenIds.join(", ")}
        </p>
      ) : null}
      {holderError ? <p className="notice notice-error">{holderError}</p> : null}
    </section>
  );
}

function shortAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function storedChoice(): NetworkChoice {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved === "anvil" ? "anvil" : "testnet";
}

async function readWallet(): Promise<WalletState> {
  const provider = browserProvider();
  if (!provider) return {};
  const accounts = (await provider.send("eth_accounts", [])) as string[];
  if (accounts.length === 0) return {};
  const network = await provider.getNetwork();
  return { account: accounts[0], chainId: network.chainId };
}

async function connect(): Promise<WalletState> {
  const provider = browserProvider();
  if (!provider) throw new Error("MetaMask is not installed");
  await provider.send("eth_requestAccounts", []);
  return readWallet();
}

async function switchChain(target: ChainParams): Promise<void> {
  const provider = browserProvider();
  if (!provider) throw new Error("MetaMask is not installed");
  const chainId = toHexChainId(target.chainId);
  try {
    await provider.send("wallet_switchEthereumChain", [{ chainId }]);
  } catch (cause) {
    if (!isMissingChain(cause)) throw cause;
    const chain: Record<string, unknown> = {
      chainId,
      chainName: target.chainName,
      rpcUrls: [target.rpcUrl],
      nativeCurrency: { name: target.nativeSymbol, symbol: target.nativeSymbol, decimals: 18 },
    };
    if (target.explorer) chain.blockExplorerUrls = [target.explorer];
    await provider.send("wallet_addEthereumChain", [chain]);
  }
}

function browserProvider(): BrowserProvider | undefined {
  if (!window.ethereum) return undefined;
  return new BrowserProvider(window.ethereum);
}

function walletMessage(cause: unknown): string {
  if (isPendingWalletRequest(cause)) {
    return "MetaMask 已有一个待确认的请求。请先在钱包弹窗里完成或关闭它，再选一次。";
  }
  return message(cause);
}

function message(cause: unknown): string {
  return cause instanceof Error ? cause.message : "钱包请求失败";
}
