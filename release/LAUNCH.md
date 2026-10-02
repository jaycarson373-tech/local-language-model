# Local Language Model: launch setup
Website: https://local-language-model.vercel.app
Source: https://github.com/jaycarson373-tech/local-language-model

## Funded checkout setup
For the current private serving route and $1 packages, use FUNDED-SETUP.md and the copyable /setup page. The same accounts, ledger, balances and GPU inventory remain in place.

## What is ready
The interface, workspace, credit ledger, wallet signatures, scoped API keys, finalized receipt verification, GPU collector and custom-model SSE adapter are implemented. Blank branding values never invent a contract address or X account. Controlled test coverage is different from production transaction or model evidence.

A compute launch requires a durable account backend, verified custom serving endpoint, actual mint configuration and cleared inference funding. The current public deployment is a network preview. Adding a credit number alone does not activate it.

## 1. Railway: deploy the durable account service
Create a Railway service from this GitHub repository.
- Service Settings → Source → Root Directory: /release.
- Config file: /release/railway.toml if Railway does not detect it automatically.
- Use the checked-in Dockerfile (Node 24); one replica. Do not enable parallel replicas against this SQLite ledger.
- Create a Railway volume and mount it at /data. A Dockerfile VOLUME declaration does not create durable Railway storage.
- Networking → Generate Domain; retain its HTTPS origin.
- Service → Variables: add the server variables below. Railway supplies PORT.
- PUBLIC_URL=https://local-language-model.vercel.app (or the exact customer custom-domain origin).
- NODE_ENV=production
- DB_PATH=/data/llm.sqlite
- ADMIN_KEY: a newly generated secret of at least 32 random characters.
- SOLANA_RPC_URL: your HTTPS Solana mainnet archive RPC URL.
- LLM_MINT: the actual canonical token mint.
- LLM_DECIMALS: the actual on-chain decimals.
- LLM_MIN_HOLDING_ATOMIC: the validated minimum in atomic token units.
- EXCLUDED_WALLETS: comma-separated treasury, liquidity and other ineligible owners.
- PAYMENT_RECIPIENT: the wallet receiving canonical mainnet USDC; its USDC associated token account must exist.
- BURN_UNITS_PER_TOKEN: an explicitly funded, fixed promotional conversion in nanodollars per whole token.
- BURN_MAX_CREDIT_USD: a funded per-quote USD cap.

The canonical mint currently must use the legacy SPL Token program. Validate the actual pump mint's owner program; Token-2022 support is not implemented. Do not put a placeholder mint into production. The finalized holder index currently stops above 1,000 token accounts/eligible wallets rather than truncating.

Railway account/deployment tokens are for Railway's account/CLI, not an application variable required by this product. Never share a seed phrase. The current service does not read, need or use a pump private key: purchases and burns are signed by each user's wallet. Automatic pump creator-fee harvesting is not implemented. Do not add a wallet private key to the browser, GitHub or an unused variable.

## 2. Connect actual model serving
Run the actual model server on your compute host and expose its authenticated HTTPS text-chat endpoint. Set these in Railway → Service → Variables:
- LLM_MODEL_PROTOCOL=openai-chat-sse
- LLM_MODEL_CHAT_URL: full HTTPS URL ending /chat/completions, typically /v1/chat/completions.
- LLM_MODEL_API_KEY: that endpoint's server-side bearer token, at least 16 characters; use a strong random secret.
- LLM_MODEL_ID: exact identifier returned in streamed model metadata.
- LLM_MODEL_PROVIDER: truthful serving identity, such as Self-hosted / vLLM.
- LLM_INPUT_USD_PER_MILLION and LLM_OUTPUT_USD_PER_MILLION: exact positive decimal retail USD prices, up to nine decimal places.
- LLM_CONTEXT_TOKENS: actual model context, 2048–131072.
- LLM_MAX_OUTPUT_TOKENS: actual permitted output, 8–4096 and below context minus 1024.

This adapter supports the explicit OpenAI text-chat SSE subset: model, messages, max_tokens, stream=true and stream_options.include_usage=true. It requires matching actual model metadata, a stable request ID, prompt_tokens, completion_tokens and [DONE]. It does not assume arbitrary endpoint schemas are compatible. A server without final usage requires a different adapter; do not enable estimated billing.

Neither legacy hosted credentials nor telemetry make this custom model available. Secret/config changes and verification older than 24 hours stop new inference, epochs and payment/burn quotes. Existing credits and valid quotes remain obligations. Schedule the funded provider verification daily before its 24-hour expiry; every probe incurs measured operating usage. Unknown probe usage retains reserved capacity across restart; reconcile only with evidence.

The workspace and pricing route expose the actual serving provider/model and exact verified rates. Per-request rate snapshots preserve historical billing when future prices change. GPU memory, request counts and throughput are separate: use NETWORK.md for the optional real NVIDIA collector.

## 3. Vercel: connect the interface
Project → Settings → Environment Variables:
- LLM_BACKEND_URL=https://YOUR-RAILWAY-SERVICE-DOMAIN — server-side, Production.
- VITE_X_URL=https://x.com/YOUR_ACTUAL_HANDLE — public build variable.
- VITE_LLM_CA: actual canonical mint once known; leave empty before launch.

Redeploy after setting these values. X and CA are intentionally blank initially. An alternative for public branding is release/public/brand/links.json. Backend canonical tokenMint takes priority over frontend CA when available. All these public CA settings must match LLM_MINT. Do not put ADMIN_KEY, RPC credentials, model bearer tokens or wallet keys in VITE_ variables. Vercel keeps the ledger on Railway through its stateless same-origin relay; it does not store balances on an ephemeral filesystem.

## 4. Fund, verify and open allocations
Pay the actual serving/compute capacity first. Count only cleared inference funding with a real receipt, including funding from actually received and converted creator fees. A burn does not bring in operating cash.

Use the private admin helper from release/ on a trusted machine or Railway shell. Supply ADMIN_KEY and PUBLIC_URL (or LLM_ADMIN_BASE_URL) through environment variables or a private uncommitted .env. Keep request JSON files outside the repository.
- node scripts/admin.mjs fund --body-file /PRIVATE/funding.json
  JSON fields: amount (exact cleared USD decimal), reference (unique), proof (public HTTPS funding receipt).
- node scripts/admin.mjs provider/verify
  Makes a real paid verification request; requires sufficient free reserve. Check verified=true and actual model/rates.
- node scripts/admin.mjs budget --body-file /PRIVATE/budget.json
  JSON fields: dailyLimit (funded daily USD limit), buffer (USD safety/overhead buffer), pause=false.
- node scripts/admin.mjs index/start
  Validates actual mint supply/decimals, initializes finalized balances and begins evidence accumulation.

Wait for a full 24 hours of qualifying finalized history. Do not backdate balances. Maintenance ticks every 15 seconds and freezes funded UTC allocations. If history, technical capacity or reserves are insufficient it stops new issuance. Claims are once per wallet/epoch, daily credit lots expire 24 hours after issue, and purchased/burn-redeemed lots do not expire daily.

The funding entry is a receipt-backed accounting record, not an automatic transfer or independent provider-balance read. Reserve for overlapping grants, outstanding credits and quotes before selecting the daily pool. Run provider/reconcile with verified input/output usage and an HTTPS proof for uncertain verification probes; it releases unused capacity without marking the model verified.

## 5. Final production evidence
Before advertising available paid compute, verify on the deployed Railway/Vercel pair:
- actual wallet signing, exact origin/session behavior and mobile chat;
- a real streamed response, matching actual provider/model, complete usage and exact balance reduction;
- concurrent spending, revocation and a restart retaining/reconciling pending requests;
- actual mint program/supply, archive-index throughput and the full qualification period;
- a small finalized USDC purchase and canonical burn, replay rejection and receipt links;
- funding sufficient for outstanding obligations, subsidy budget and overhead.

Controlled transaction tests never broadcast. No production payment/burn or real-model result is implied by CI. Funded daily allocation cannot start without the required evidence.

## Pause
node scripts/admin.mjs budget --body-file /PRIVATE/paused-budget.json
Use pause=true and chosen future dailyLimit/buffer. Existing lots, balances, records and valid quotes remain supported. Back up the durable database before migrations; do not edit ledger rows or reset the database.

## Brand downloads
/brand/local-llm-server-cube.jpg — official user-supplied logo; used across the site and favicon.
/brand/llm-logo.png — previous generated logo, retained only as a legacy asset; do not use for current branding.
/brand/llm-x-banner.png — matching generated X banner, PNG.
/brand/llm-symbol.svg — 1000×1000, symbol only.
/brand/llm-symbol-transparent.svg — transparent symbol.
/brand/llm-banner.svg — 1500×500 X banner.
The verified-release-evidence Actions artifact also exports llm-symbol.png and llm-banner.png.

X bio:
HOLD $LLM. USE AI. Building daily compute credits for holders. Chat. Code. Build. One balance for workspace + API. Solana.

Pump description:
Local Language Model — $LLM. Built to turn eligible holdings into daily compute credits for chat, code and developer tools. One balance for workspace + API. Buy additional credits or burn $LLM for funded usage when redemption opens. Explore the network preview.

Launch thesis:
AI is becoming a daily bill. $LLM is built to turn token utility into something you can use: compute. Eligible holders share a funded daily credit pool. Chat, code and build through one metered balance. Expand usage through purchases or verified burns. Grow the network around real demand and measured capacity.

## Railway source roots
The repository-root Dockerfile and railway.toml now deploy /release automatically. A Railway service whose Root Directory is /release continues to use release/Dockerfile unchanged. Both use Node 24 and /data/llm.sqlite. Attach a durable /data volume and use one replica; do not remove the volume or reset balances. PUBLIC_URL defaults to the canonical Vercel frontend; set it to the exact frontend HTTPS origin if using a different domain. LLM_BACKEND_URL on Vercel must be the Railway service's generated public HTTPS domain, not a Railway dashboard/project URL.
