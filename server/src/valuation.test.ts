import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { valueContribution } from "./valuation.js";

const sample = { base: 10, quality: 5, size: 8, maintainer: 4, scoredInWindow: 0 };

describe("valueContribution", () => {
  it("adds the four components", () => {
    assert.equal(valueContribution(sample), 27);
  });

  it("caps quality", () => {
    assert.equal(valueContribution({ ...sample, quality: 100 }), 42);
  });

  it("scores zero once the window is full", () => {
    assert.equal(valueContribution({ ...sample, scoredInWindow: 3 }), 0);
  });
});
