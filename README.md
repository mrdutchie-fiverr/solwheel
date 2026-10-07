# Fee Wheel (one-folder version)

All 7 files sit in one folder. No subfolders, nothing to install.

| File | What it is |
|---|---|
| `index.html` | the website (wheel, timer, eligible wallets) |
| `tick.mjs` | runs every minute: reads holders, and every 5 min claims fees, picks a winner, pays |
| `state.mjs` | data for the website (`/api/state`) |
| `round.mjs` | full details of a round, for checking fairness (`/api/round/<id>`) |
| `debug.mjs` | setup checker (`/api/debug`) |
| `netlify.toml` | tells Netlify how it fits together |
| `README.md` | this file |

## Put it online (GitHub)
1. On GitHub: open the repo (or make a new one) → **Add file → Upload files**.
2. Select **all 7 files** at once (Ctrl+A in the folder) and drag them in → **Commit changes**.
   Delete any old files/folders from earlier uploads (`public`, `netlify`, `package.json`, `package-lock.json`).
3. Netlify (site linked to this repo) builds by itself. Build command: leave empty.
4. Open `https://<your-site>.netlify.app/api/debug` → every check should say `"ok": true`.

## Settings (Netlify → Site configuration → Environment variables, never on GitHub)
Required: `TOKEN_MINT` (the CA), `RPC_URL` (Helius link), `POT_PRIVATE_KEY` (pot wallet, base58).
Optional: `TICKER`, `EXCLUDE_WALLETS` (comma separated), `DRY_RUN` (`true` = no payouts),
`CLAIM_FEES` (`true`), `MIN_TOKENS` (250000), `MIN_HOLD_MINUTES` (5), `ROUND_MINUTES` (5),
`MIN_POT_SOL` (0.01), `RESERVE_SOL` (0.005), `WEIGHTING` (`equal` or `balance`).
After changing a setting: **Deploys → Trigger deploy**.

Demo of the page without any backend: `/?demo` (or `/?demo&fast` for 30-second rounds).
