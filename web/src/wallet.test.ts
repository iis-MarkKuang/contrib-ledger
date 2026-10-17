import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isMissingChain, isPendingWalletRequest } from "./wallet.ts";

describe("isMissingChain", () => {
  it("recognizes the ethers wrapper around MetaMask 4902", () => {
    const wrapped = new Error(
      'could not coalesce error (error={ "code": 4902, "message": "Unrecognized chain ID \\"0x7a69\\". Try adding the chain using wallet_addEthereumChain first." }, code=UNKNOWN_ERROR, version=6.17.0)',
    );
    Object.assign(wrapped, {
      code: "UNKNOWN_ERROR",
      error: { code: 4902, message: 'Unrecognized chain ID "0x7a69". Try adding the chain using wallet_addEthereumChain first.' },
    });
    assert.equal(isMissingChain(wrapped), true);
  });

  it("leaves other wallet errors alone", () => {
    assert.equal(isMissingChain(Object.assign(new Error("user rejected"), { code: 4001 })), false);
    assert.equal(
      isMissingChain(
        Object.assign(new Error("Request of type 'wallet_addEthereumChain' already pending for origin http://localhost:5173. Please wait."), {
          code: "UNKNOWN_ERROR",
          error: { code: -32002 },
        }),
      ),
      false,
    );
  });
});

describe("isPendingWalletRequest", () => {
  it("recognizes a MetaMask popup that is still open", () => {
    const wrapped = Object.assign(
      new Error(
        'could not coalesce error (error={ "code": -32002, "message": "Request of type \'wallet_addEthereumChain\' already pending for origin http://localhost:5173. Please wait." }, code=UNKNOWN_ERROR, version=6.17.0)',
      ),
      { code: "UNKNOWN_ERROR", error: { code: -32002 } },
    );
    assert.equal(isPendingWalletRequest(wrapped), true);
  });
});