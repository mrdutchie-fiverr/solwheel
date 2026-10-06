# Fee Wheel

Every 5 minutes one wallet that holds **250,000+ tokens for 5+ minutes** wins the pot: the 50% creator-fee share that has piled up in the pot wallet since the last payout.

```
public/index.html          the website (wheel, timer, eligible list, history)
netlify/functions/tick.mjs runs every minute: snapshot holders; on each 5-min mark claim fees, pick winner, pay
netlify/functions/state.mjs   GET /api/state        (what the page reads)
netlify/functions/round.mjs   GET /api/round/<id>   (full entry list + seed of a round, for verification)
netlify/lib/core.mjs       holders, eligibility, provably-fair pick, payout
verify.mjs                 lets anyone re-check a round
```

## Setup (about 15 minutes)

1. **Create a fresh pot wallet** (e.g. a new Phantom account). Export its private key. Use it for nothing else.
2. **Launch the coin on pump.fun.** Then in the coin's creator-fee settings (Creator Fee Sharing), give **50% to the pot wallet**. The rest goes wherever you choose.
3. **Get an RPC key.** Free Helius account: https://helius.dev → copy the mainnet URL (`https://mainnet.helius-rpc.com/?api-key=...`). Public RPCs block the holder query, so this is required.
4. **Deploy to Netlify.** Push this folder to a GitHub repo → Netlify → *Add new site* → *Import from Git*. No build command needed, `netlify.toml` handles it.
   (Or with the CLI: `npm i -g netlify-cli`, `netlify deploy --prod`.)
5. **Set environment variables** in Netlify → Site configuration → Environment variables (see `.env.example`):
   - `TOKEN_MINT` = the coin's CA
   - `RPC_URL` = Helius URL
   - `POT_PRIVATE_KEY` = pot wallet private key (base58)
   - `TICKER`, `EXCLUDE_WALLETS` (your dev/team wallets), anything else you want to change
6. **Redeploy** (Deploys → Trigger deploy) so the variables are picked up. Within one minute the page fills up.

**Test first:** set `DRY_RUN=true`. Winners get picked and shown, but no SOL is sent. Switch it to `false` when you're happy.
Want to look at the page without a backend? Open `/?demo` (or `/?demo&fast` for 30-second rounds).

## How it works

- **Holding time**: every minute the function reads all token accounts for the mint and adds up balances per wallet. A wallet's clock starts the first minute it's at 250k+ and **resets as soon as it drops below**. So "held 5 min" means it held 250k+ in 5+ consecutive one-minute snapshots.
- **Who can't win**: pump.fun bonding curve, AMM pools and other program accounts (anything that isn't a normal wallet is filtered out automatically), the pot wallet itself, and anything in `EXCLUDE_WALLETS`.
- **Pot**: before each spin the bot tries to claim creator fees into the pot wallet (via PumpPortal's `collectCreatorFee`). Pot = pot-wallet balance minus `RESERVE_SOL`. Below `MIN_POT_SOL`, or with no eligible wallets, the round **rolls over**.
- **Fair pick**: `seed = sha256(finalizedBlockhash : roundId : sha256(sorted entries))`, winner = seed mod total weight. The entry list, blockhash and seed of every round are public, and `node verify.mjs <site-url> <roundId>` re-computes it.
- **Weighting**: `WEIGHTING=equal` = one slice per wallet (the original idea). `WEIGHTING=balance` = slice size by bag size, which stops people from splitting 2.5M tokens over 10 wallets to get 10 slices.
- **No double payouts**: each round is locked in storage before anything is paid.

## Check after launch

- **Fee claiming**: open the pot wallet on Solscan after the first trades. If fees aren't arriving automatically (pump.fun's fee-sharing claim flow can differ from the classic creator claim), claim them manually in pump.fun with the pot wallet, or ask PumpPortal support. The wheel still works: it pays out whatever SOL is in the pot wallet.
- Netlify → Logs → Functions → `tick` shows each run's output and errors.

## Security

- The pot private key lives in Netlify's environment variables. Anyone with access to the Netlify account can drain the pot, so lock the account down (2FA) and keep only fees in that wallet.
- Netlify scheduled functions have a 30-second limit. Above a few thousand holders, a dedicated RPC plan keeps the holder query fast.
