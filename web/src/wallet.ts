/** MetaMask uses 4902 when the chain is not in the wallet yet. ethers v6 wraps that code. */
export function isMissingChain(cause: unknown): boolean {
  const pending = [cause];
  const seen = new Set<unknown>();
  while (pending.length > 0) {
    const current = pending.pop();
    if (current === null || current === undefined || typeof current !== "object" || seen.has(current)) continue;
    seen.add(current);
    const record = current as {
      code?: unknown;
      message?: unknown;
      error?: unknown;
      info?: unknown;
      data?: unknown;
    };
    if (record.code === 4902 || record.code === "4902") return true;
    if (
      typeof record.message === "string" &&
      !/already pending/i.test(record.message) &&
      /(?:\bcode":\s*4902\b|\b4902\b|Unrecognized chain ID)/.test(record.message)
    ) {
      return true;
    }
    pending.push(record.error, record.info, record.data);
  }
  return false;
}

/** MetaMask returns -32002 when a wallet popup is already open. */
export function isPendingWalletRequest(cause: unknown): boolean {
  const pending = [cause];
  const seen = new Set<unknown>();
  while (pending.length > 0) {
    const current = pending.pop();
    if (current === null || current === undefined || typeof current !== "object" || seen.has(current)) continue;
    seen.add(current);
    const record = current as { code?: unknown; message?: unknown; error?: unknown; info?: unknown };
    if (record.code === -32002 || record.code === "-32002") return true;
    if (typeof record.message === "string" && /already pending/i.test(record.message)) return true;
    pending.push(record.error, record.info);
  }
  return false;
}
