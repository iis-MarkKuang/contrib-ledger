// Cast 3 votes for a PR using random wallets. Run from server/ so ethers resolves.
// Usage: node vote-e2e.mjs [repo] [prOrIssueId] [score1] [score2] [score3]
// Defaults: repo=iis-MarkKuang/contrib-ledger-demo, pr=3, scores=80,60,75
import { Wallet } from "ethers";

const SERVER = process.env.VOTE_SERVER ?? "http://127.0.0.1:8787";
const REPO = process.argv[2] ?? "iis-MarkKuang/contrib-ledger-demo";
const PR = process.argv[3] ?? "3";
const scores = process.argv.slice(4).length >= 3
  ? process.argv.slice(4).map(Number)
  : [80, 60, 75];

async function main() {
  console.log(`voting on ${REPO}#${PR} with ${scores.length} voters`);
  for (let i = 0; i < scores.length; i++) {
    const wallet = Wallet.createRandom();
    const score = scores[i];
    const message = `${REPO}:${PR}:${score}`;
    const sig = await wallet.signMessage(message);
    console.log(`voter ${i + 1} ${wallet.address}: score ${score}`);
    const res = await fetch(`${SERVER}/vote`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ repo: REPO, prOrIssueId: PR, score, signature: sig }),
    });
    const body = await res.json();
    console.log(`  status ${res.status}:`, JSON.stringify(body));
  }
  console.log("---");
  const voting = await (await fetch(`${SERVER}/voting`)).json();
  console.log("voting tasks:", voting.length);
  const pending = await (await fetch(`${SERVER}/pending`)).json();
  console.log("pending:", pending.length);
  for (const p of pending) {
    console.log(`  ${p.repo}#${p.prOrIssueId} - ${p.title} (${p.valuationScore}分)`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
