# Local Language Model: funded checkout
The public assistant is LocalLM. The inventory is the project's real hardware. The launch execution route and credentials are private server configuration. Branding does not change the provenance of underlying weights or the physical location of an individual request.

## Copyable setup
Open https://local-language-model.vercel.app/setup.
Enter the Railway HTTPS origin, public USDC recipient, configurable service margin and safety buffer. Copy the Railway and Vercel blocks. The page stores nothing and sends no configuration; it deliberately has no secret inputs.

1. Railway: connect this repository with Root Directory /release. Use the Dockerfile, one replica, and a durable /data volume.
2. Railway → Service → Variables → Raw Editor: paste the generated block.
3. Complete private values in Railway:
   - HOSTED_API_BASE_URL: the paid supplier's HTTPS API base ending /api/v1.
   - HOSTED_API_KEY: a dedicated paid inference key, not a wallet key.
   - HOSTED_MODEL: exact model identifier from your private catalog.
   - HOSTED_PROVIDER_TAG: optional exact endpoint tag; empty chooses the lowest combined flat-rate compatible catalog endpoint. The chosen endpoint is pinned with no fallback.
   - SOLANA_RPC_URL: finalized mainnet archive RPC.
   - ADMIN_KEY: at least 32 random characters.
   - PAYMENT_RECIPIENT: public receiving wallet; its canonical Solana USDC associated account must exist.
   - LLM_MARKUP_BPS: service margin, starter 2000 (20%); not a token reward promise.
   - LLM_CONTEXT_TOKENS and LLM_MAX_OUTPUT_TOKENS: service ceilings, bounded by verified catalog limits.
4. Vercel: LLM_BACKEND_URL is the Railway HTTPS origin. Redeploy. No serving secrets belong in VITE_ variables.
5. Load cleared paid credits into the serving account.
6. Railway shell: node scripts/activate-funded.mjs --buffer 1

The command verifies catalog and account/key balances, imports actual remaining stock on a clean funding baseline, checks a real streamed response and complete usage/cost, then sets dailyLimit=0 with pause=false. This enables only funded purchase quotes. A $2 minimum package requires more than $2 of free capacity after the chosen buffer and probe usage. A $10 quote needs $10 of free reserved capacity.

The setup does not require Supabase. Customer balances remain in the existing durable SQLite ledger. Do not replace or reset it. A clean baseline requirement stops stock import on a previously funded ledger: use its existing receipt-backed funding/reconciliation path instead of creating duplicate funds.

## Stock and top-ups
Stock is verified paid serving capacity, not money transferred from customer wallets. Initial import counts available account/key capacity. Later imports count only new purchased-credit counter increases for the same private credential identity, bounded by remaining capacity. Repeating the same stock command cannot duplicate funding. Credential rotation requires reconciliation and does not rewrite balances.

The external funding ceiling is refreshed and expires after 30 seconds. Quotes, epochs and dispatch cannot use an unknown or insufficient ceiling. Concurrent dispatch reservations are checked atomically. Only cleared funds and verified current capacity support new issuance. USDC proceeds are not automatically converted into supplier capacity.

## Packages
2 USDC → $2 service credits.
5 USDC → $5 service credits.
10 USDC → $10 service credits.
Network fees are separate. Purchased credits do not expire daily and are credited directly to the authenticated account after finalized receipt verification. No copy/paste redemption code is required. Old valid quotes and historical balances remain honored; package validation applies to new quotes only.

## Rates and privacy
Input/output supplier catalog decimals are parsed exactly, multiplied by the configured margin and rounded upward only to integer nanodollar precision. Request prices are frozen at reservation. Actual reported serving cost is stored separately from retail credit consumption. No float-based money math is used. Dynamic rates, per-request charges, separately priced reasoning and cache writes require separate adapters and are excluded from this launch adapter.

Routing requires no data collection and zero-retention endpoints, pins one catalog endpoint and caps its permitted input/output prices. An unavailable qualifying route fails closed. Conversations and financial usage history remain in the product's own database; no universal zero-tracking promise is made. Prompts contain the LocalLM product identity and real project inventory, not private supplier URLs, credentials or identifiers. Client system text is treated as user-supplied context.

The wrapper's name is LocalLM. Generic introductions use that identity and the project hardware. Do not fabricate ownership or training provenance of underlying weights, decentralized serving or execution on project GPUs. Private configuration is private, not a reason to invent an answer.

## Launch evidence still required
Controlled tests do not prove the real supplier/key, actual mobile wallet signing or finalized paid transactions. After setup, verify a streamed chat charge and one small USDC purchase on the deployed service before advertising checkout as active. Burn redemption and holder allocations remain independently gated by canonical-mint configuration, actual funding and finalized history. Holders need a full 24 hours of evidence; credit purchases do not.

## Operator commands
node scripts/admin.mjs compute/check
node scripts/admin.mjs compute/stock
node scripts/admin.mjs provider/verify
node scripts/admin.mjs budget --body-file /PRIVATE/budget.json
Budget fields: dailyLimit, buffer (exact USD strings), pause (explicit boolean).
Provider verification lasts 24 hours. Schedule a funded renewal before expiry. Unknown probe/request outcomes retain reserved capacity until usage evidence supports reconciliation. Existing paid obligations survive pauses and restarts.
