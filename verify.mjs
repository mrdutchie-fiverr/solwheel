// Anyone can check a round:  node verify.mjs https://your-site.netlify.app 5876543
import { createHash } from "node:crypto";
const [site, id] = process.argv.slice(2);
const r = await (await fetch(`${site.replace(/\/$/, "")}/api/round/${id}`)).json();
const eh = createHash("sha256").update(r.entries.map((e) => `${e.owner}:${e.weight}`).join("|")).digest("hex");
const seed = createHash("sha256").update(`${r.blockhash}:${r.id}:${eh}`).digest("hex");
let t = BigInt("0x" + seed) % r.entries.reduce((s, e) => s + BigInt(e.weight), 0n), i = 0;
for (; i < r.entries.length; i++) { const w = BigInt(r.entries[i].weight); if (t < w) break; t -= w; }
console.log({ round: r.id, blockhash: r.blockhash, entries: r.entries.length, computedWinner: r.entries[i].owner, publishedWinner: r.winner, valid: r.entries[i].owner === r.winner && seed === r.seed });
