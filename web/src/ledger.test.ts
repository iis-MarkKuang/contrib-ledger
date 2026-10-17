import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { contractAddressFor, hasRegistryCode, logWindows, lookupTarget, parseAddress, scanFromBlock, txUrl } from "./ledger.ts";

describe("txUrl", () => {
  it("uses Monadscan for testnet and skips a link on Anvil", () => {
    assert.equal(
      txUrl("https://testnet.monadscan.com", "0xabc"),
      "https://testnet.monadscan.com/tx/0xabc",
    );
    assert.equal(txUrl(undefined, "0xabc"), undefined);
  });

  it("keeps each eth_getLogs window inside the public RPC limit", () => {
    assert.deepEqual(logWindows(0, 100), [[0, 100]]);
    assert.deepEqual(logWindows(0, 101), [
      [0, 100],
      [101, 101],
    ]);
    assert.equal(scanFromBlock(50, true), 0);
    assert.equal(scanFromBlock(71_769_498, false), 71_767_498);
  });

  it("uses a different contract address for Anvil and testnet", () => {
    const env = {
      testnet: "0xb8f20c1f8dc37ec22b51ee058924e9465295f00c",
      anvil: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    };
    assert.equal(contractAddressFor("testnet", env), "0xb8f20c1f8Dc37eC22B51EE058924e9465295F00c");
    assert.equal(contractAddressFor("anvil", env), "0x5FbDB2315678afecb367f032d93F642f64180aa3");
  });

  it("accepts the connected account even when the query box is empty or has a label", () => {
    const account = "0xb8f20c1f8dc37ec22b51ee058924e9465295f00c";
    const checksum = "0xb8f20c1f8Dc37eC22B51EE058924e9465295F00c";
    assert.equal(parseAddress(account), checksum);
    assert.equal(lookupTarget("", account), checksum);
    assert.equal(lookupTarget(`当前地址 ${account}`), checksum);
    assert.equal(lookupTarget("不是地址"), undefined);
  });

  it("does not treat an EIP-7702 delegation as the registry", () => {
    assert.equal(hasRegistryCode("0x"), false);
    assert.equal(hasRegistryCode("0xef01006bd9b71559e3b2013596726a4e2ca1ee97189606"), false);
    assert.equal(hasRegistryCode("0x60806040"), true);
  });
});