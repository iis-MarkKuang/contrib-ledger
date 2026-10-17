import assert from "node:assert/strict";
import { spawn, type ChildProcess } from "node:child_process";
import { once } from "node:events";
import { describe, it } from "node:test";
import { Contract, JsonRpcProvider, Wallet } from "ethers";
import { signContribution, type ContributionPayload } from "./sign.js";

const ANVIL_KEY_0 = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const ANVIL_KEY_1 = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";
const ANVIL_KEY_2 = "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a";
const RPC_URL = "http://127.0.0.1:8546";
const CHAIN_ID = 31337n;

const abi = [
  "function submitContribution(address contributor,uint256 prOrIssueId,uint256 valuationScore,string repo,uint256 nonce,bytes signature) returns (uint256)",
  "function getContributorScore(address contributor) view returns (uint256)",
];

describe("signContribution", { timeout: 60_000 }, () => {
  it("is accepted by the registry and rejected for a different key", async () => {
    const anvil = startAnvil();
    try {
      const provider = new JsonRpcProvider(RPC_URL);
      await waitForChain(provider);
      const registry = await deploy(ANVIL_KEY_0);
      const contributor = new Wallet(ANVIL_KEY_1).address;
      const payload: ContributionPayload = {
        contributor,
        prOrIssueId: 7n,
        valuationScore: 15n,
        repo: "demo",
        nonce: 1n,
      };

      const signature = await signContribution(ANVIL_KEY_0, CHAIN_ID, registry, payload);
      const submitter = new Wallet(ANVIL_KEY_1, provider);
      const contract = new Contract(registry, abi, submitter);
      const id = await contract.submitContribution.staticCall(
        payload.contributor,
        payload.prOrIssueId,
        payload.valuationScore,
        payload.repo,
        payload.nonce,
        signature,
      );
      const tx = await contract.submitContribution(
        payload.contributor,
        payload.prOrIssueId,
        payload.valuationScore,
        payload.repo,
        payload.nonce,
        signature,
      );
      await tx.wait();
      assert.equal(id, 1n);
      assert.equal(await contract.getContributorScore(contributor), 15n);

      const wrong = await signContribution(ANVIL_KEY_2, CHAIN_ID, registry, {
        ...payload,
        nonce: 2n,
        prOrIssueId: 8n,
      });
      await assert.rejects(() =>
        contract.submitContribution.staticCall(contributor, 8n, 15n, "demo", 2n, wrong),
      );
    } finally {
      anvil.kill();
      await once(anvil, "exit");
    }
  });
});

function startAnvil(): ChildProcess {
  const path = `${process.env.PATH ?? ""}:${process.env.HOME}/.foundry/bin`;
  return spawn("anvil", ["--network", "monad", "--port", "8546", "--silent"], {
    env: { ...process.env, PATH: path },
    stdio: "ignore",
  });
}

async function waitForChain(provider: JsonRpcProvider): Promise<void> {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      if ((await provider.getNetwork()).chainId === CHAIN_ID) return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
  throw new Error("anvil did not start");
}

async function deploy(privateKey: string): Promise<string> {
  const path = `${process.env.PATH ?? ""}:${process.env.HOME}/.foundry/bin`;
  const child = spawn(
    "forge",
    [
      "script",
      "script/Deploy.s.sol",
      "--rpc-url",
      RPC_URL,
      "--private-key",
      privateKey,
      "--broadcast",
    ],
    {
      cwd: new URL("../../contracts", import.meta.url).pathname,
      env: {
        ...process.env,
        PATH: path,
        MAINTAINER_ADDRESS: new Wallet(privateKey).address,
      },
    },
  );
  let output = "";
  child.stdout?.on("data", (chunk: Buffer) => {
    output += chunk.toString();
  });
  child.stderr?.on("data", (chunk: Buffer) => {
    output += chunk.toString();
  });
  const [code] = (await once(child, "exit")) as [number | null];
  if (code !== 0) throw new Error(output);
  const match = output.match(/ContributionRegistry (0x[0-9a-fA-F]{40})/);
  if (!match) throw new Error(output);
  return match[1];
}
