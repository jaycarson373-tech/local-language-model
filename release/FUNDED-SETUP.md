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
   - HOSTED_MODEL: auto-cheapest for automatic paid-text model selection; an exact private model identifier may override it.
   - HOSTED_PROVIDER_TAG: optional exact endpoint tag; empty chooses the lowest combined flat-rate compatible catalog endpoint. The chosen endpoint is pinned with no fallback.
   - SOLANA_RPC_URL: finalized mainnet archive RPC.
   - ADMIN_KEY: at least 32 random characters.
   - PAYMENT_RECIPIENT: public receiving wallet; its canonical Solana USDC associated account must exist.
   - LLM_MARKUP_BPS: service margin, starter 23000 (230% markup, 3.3× retail rates); not a token reward promise.
   - LLM_CONTEXT_TOKENS and LLM_MAX_OUTPUT_TOKENS: service ceilings, bounded by verified catalog limits.
4. Vercel: LLM_BACKEND_URL is the Railway HTTPS origin. Redeploy. No serving secrets belong in VITE_ variables.
5. Load cleared paid credits into the serving account.
6. Railway shell: node scripts/activate-funded.mjs --buffer 1

The command verifies catalog and account/key balances, imports actual remaining stock on a clean funding baseline, checks a real streamed response and complete usage/cost, then sets dailyLimit=0 with pause=false. This enables only funded purchase quotes. The $1 launch package requires at least $1 of free capacity after the chosen buffer and probe usage. Larger packages are disabled.

The setup does not require Supabase. Customer balances remain in the existing durable SQLite ledger. Do not replace or reset it. A clean baseline requirement stops stock import on a previously funded ledger: use its existing receipt-backed funding/reconciliation path instead of creating duplicate funds.

## Stock and top-ups
Stock is verified paid serving capacity, not money transferred from customer wallets. Initial import counts available account/key capacity. Later imports count only new purchased-credit counter increases for the same private credential identity, bounded by remaining capacity. Repeating the same stock command cannot duplicate funding. Credential rotation requires reconciliation and does not rewrite balances.

The external funding ceiling is refreshed and expires after 30 seconds. Quotes, epochs and dispatch cannot use an unknown or insufficient ceiling. Concurrent dispatch reservations are checked atomically. Only cleared funds and verified current capacity support new issuance. USDC proceeds are not automatically converted into supplier capacity.

## Packages
1 USDC → $1 service credits.
$5, $10 and $20 packages are coming soon and cannot create quotes.
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

## Launch inventory
Set PURCHASE_ORDER_LIMIT=5 for five total completed or reserved purchase orders. The limit is checked atomically with every new quote. Ambiguous issued transactions keep their inventory slot and funding reservation. Finalized receipts create account credits directly. No upstream API key is sold or shared. Restock the private serving balance, import new cleared stock, then raise the limit to 10 for the next five orders. GET /api/status exposes remaining order inventory; /api/admin/compute/check includes the same stock report for the owner. $5, $10 and $20 packages are displayed as coming soon and cannot create new quotes. Historical valid quotes keep their original amounts.

## Retail rates and funded costs
LLM_MARKUP_BPS=23000 means retail input/output rates are 3.3× verified serving rates, not a 3.3× dollar balance. $1 paid always grants $1 of service credit. Provider funding is tracked in actual cost units separately from retail usage. Each lot, epoch and quote reserves a conservative rounded-up provider-cost obligation. Each request snapshots retail and underlying rates plus its funding reservation. Settlement debits retail usage from the account and actual verified serving cost from funding. Old rows and ledger entries are preserved. At zero buffer and before overhead, $5.70 of verified serving capacity corresponds to at most $18.81 in retail usage. With the default $1 provider-cost buffer it corresponds to at most $15.51 before probe costs. Do not sell a nineteenth $1 package from $5.70 of serving balance at 3.3× rates: it is insufficient even before the safety buffer. Keep a single private paid key and restock the account instead of distributing upstream secrets.

## Automatic model selection
HOSTED_MODEL=auto-cheapest scans the live text-model catalog, excludes free/zero-priced entries and incompatible context or per-request pricing, then inspects endpoints for up to sixteen lowest advertised combined input/output rate candidates. Only compatible flat-priced endpoints enter selection. The lowest verified combined prompt/completion price wins; this is a balanced text workload criterion, not a quality ranking or a promise of lowest cost for every input/output ratio. The exact chosen model and provider stay in private admin configuration. Execution pins that choice with no fallback and must pass a funded streaming identity/usage/cost check before availability. Prices are published as LocalLM service rates.
