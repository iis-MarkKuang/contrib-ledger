import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  chainParams,
  isExpectedChain,
  LOCAL_ANVIL_CHAIN_ID,
  MONAD_TESTNET_CHAIN_ID,
  paramsForChoice,
  parseChainId,
  toHexChainId,
} from "./network.ts";

describe("expected chain", () => {
  it("rejects a chain id other than the configured one", () => {
    assert.equal(isExpectedChain(1n, MONAD_TESTNET_CHAIN_ID), false);
    assert.equal(isExpectedChain(MONAD_TESTNET_CHAIN_ID, MONAD_TESTNET_CHAIN_ID), true);
    assert.equal(isExpectedChain(LOCAL_ANVIL_CHAIN_ID, LOCAL_ANVIL_CHAIN_ID), true);
  });

  it("uses the documented Monad testnet parameters", () => {
    const params = chainParams(MONAD_TESTNET_CHAIN_ID, undefined);
    assert.equal(params.chainName, "Monad Testnet");
    assert.equal(params.nativeSymbol, "MON");
    assert.equal(params.rpcUrl, "https://testnet-rpc.monad.xyz");
    assert.equal(params.explorer, "https://testnet.monadscan.com");
    assert.equal(toHexChainId(MONAD_TESTNET_CHAIN_ID), "0x279f");
  });

  it("uses the given RPC for local Anvil", () => {
    const params = chainParams(LOCAL_ANVIL_CHAIN_ID, "http://127.0.0.1:8545");
    assert.equal(params.chainName, "Anvil");
    assert.equal(params.rpcUrl, "http://127.0.0.1:8545");
    assert.equal(parseChainId("31337"), LOCAL_ANVIL_CHAIN_ID);
  });

  it("maps the page switch to testnet or Anvil", () => {
    assert.equal(paramsForChoice("testnet").chainId, MONAD_TESTNET_CHAIN_ID);
    assert.equal(paramsForChoice("testnet").rpcUrl, "https://testnet-rpc.monad.xyz");
    assert.equal(paramsForChoice("anvil").chainId, LOCAL_ANVIL_CHAIN_ID);
    assert.equal(paramsForChoice("anvil").rpcUrl, "http://127.0.0.1:8545");
  });
});
