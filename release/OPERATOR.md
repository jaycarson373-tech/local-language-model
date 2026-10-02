# Local Language Model operator guide

The standalone app is in release/. It uses Node.js 24, React/Vite and a persistent SQLite database. No hosted editor is required. Run one app instance per persistent ledger, with HTTPS terminated by your host or reverse proxy. PUBLIC_URL must be the exact public HTTPS origin in production. Do not place privileged keys in VITE_ variables, source control or browser code.

## Secure configuration

For local development copy release/.env.example to release/.env, then run npm run dev inside release/. The helper loads .env server-side. For production use your host's secret manager; npm start can load a local .env when present.

- Custom serving credentials and exact model catalog: see LAUNCH.md and .env.example. The authenticated HTTPS OpenAI text-chat SSE subset is implemented. No endpoint is configured by default. The archived hosted adapter remains inactive.
- ADMIN_KEY: at least 32 cryptographically random characters; generated and stored outside the repository.
- SOLANA_RPC_URL: HTTPS Solana mainnet archive RPC supporting finalized blocks, token-account enumeration and transaction history. The genesis hash is verified.
- LLM_MINT: actual canonical legacy SPL-token mint, validated against actual supply.
- LLM_DECIMALS: actual mint decimals, 0–18.
- LLM_MIN_HOLDING_ATOMIC: minimum holding in atomic units. There is no active example default.
- PAYMENT_RECIPIENT: recipient wallet for canonical mainnet USDC; create its canonical associated token account before activation.
- EXCLUDED_WALLETS: comma-separated treasury, liquidity, burn and other ineligible wallet owners.
- BURN_UNITS_PER_TOKEN: a fixed promotional conversion in nanodollars per whole LLM token; no spot-market pricing is used.
- BURN_MAX_CREDIT_USD: exact decimal cap per quote.
- DB_PATH: persistent database path. Never run production on an ephemeral disk.
- PUBLIC_URL: exact origin; HTTPS required when NODE_ENV=production.

Canonical mainnet USDC: EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v. The service does not enable test or placeholder mints in production. Controlled tests mock chain observations and never broadcast a transaction.

## Fund and verify before activation

Every admin operation uses POST, Content-Type: application/json and Authorization: Bearer ADMIN_KEY, to YOUR_ORIGIN/api/admin.

1. /fund: {"amount":"actual cleared USD amount","reference":"unique receipt reference","proof":"public HTTPS receipt URL"}. Only inference funding that has actually cleared counts. This endpoint records an operator attestation, not an independent bank/provider-balance verification. Reconcile the evidence against cleared provider funds. Do not count projected fees, market cap, unsold tokens, unconverted USDC or a token burn.
2. /provider/verify: {}. Requires full custom endpoint/protocol/model/rate/limit configuration and cleared reserve, makes an actual streamed request and checks model identity plus complete usage. A successful probe enables the catalog for 24 hours. Probe operating capacity is reserved before execution; uncertain outcomes retain that capacity. /provider/reconcile settles confirmed usage with an HTTPS proof without activating the model. Credentials/config changes require new verification. Existing hosted credentials cannot enable the custom model.
3. /budget: {"dailyLimit":"funded daily USD budget","buffer":"safety and operating USD buffer","pause":false}. Initial daily limit is zero and new issuance is paused. Outstanding lots, overlapping epochs, quotes and overhead all reduce capacity.
4. /index/start: {}. Validates canonical mint supply and decimals, initializes finalized balances and starts accumulating eligibility history. It never fabricates prior holding time. Current capacity is at most 1,000 canonical token accounts/eligible wallets; larger holder sets stop rather than truncate. Confirm your mint's actual distribution and RPC throughput before production.
5. /index/tick: {}. Processes every observed finalized token balance change in up to 64 slots per tick. Incoming token-account increases conservatively restart the receiving wallet's full qualification period; unavailable historical blocks prevent advancement. A full 24 hours must be covered by evidence. An in-process maintenance loop runs every 15 seconds. Stop issuance if your index falls behind.
6. /epoch: {"pool":"funded USD pool"}. Optional manual freeze for the current UTC date, with the next UTC midnight as the claim deadline. The maintenance loop opens future UTC epochs at the daily budget only when funded and proven eligibility exists. Allocations never change after freezing; each wallet claims once.

Already issued daily credits remain supported until exactly 24 hours after their recorded issuance. Purchased and burn-redeemed credits have no daily expiration. No grants are issued by client callbacks.

## Pausing safely

POST /budget with pause:true and the chosen future daily limit and buffer. This stops new epochs and quotes. It does not revoke previously issued credits, valid quotes or allocations. Do not delete the database, edit lots directly or rewrite ledger history. Budget changes apply to future allocations.

## Transactions

The server reserves cleared inference capacity before issuing a quote. Quotes contain an exact unsigned transaction, canonical mint/decimals, recipient when applicable, message hash, cryptographically random reference, latest finalized blockhash, last-valid height, expiry and fee. The browser signs that exact message. The relay rejects altered messages; receipt verification checks the mainnet genesis, successful finalization, payer signature, message hash, actual burnChecked/transferChecked, amount and decimals. Duplicate signatures/order IDs cannot issue credit twice.

Expired display quotes stay backed until the pinned blockhash cannot finalize and a bounded finalized reference scan shows no valid receipt. Ambiguous scans keep capacity held. Valid late receipts are honored. A browser callback or arbitrary transfer is not a verified burn. Purchases are separate from burns. Burn conversion is a disclosed capped promotion, not a promise of financial savings.

Do not rotate the canonical mint or payment recipient while outstanding quotes exist without reconciling them; quotes persist their original mint/decimals and pinned instruction message.

## Recovery and accounting

POST /recover: {} expires daily lots and closed unclaimed allocations, releases requests proved never dispatched, and retains uncertain executing reservations. On process restart the same recovery runs against persistent state. A disconnect does not imply zero provider cost. POST /reconcile: {"id":"request ID","input":verified input-token count,"output":verified output-token count,"proof":"public usage evidence URL without prompts or secrets"} settles confirmed usage once. Investigation is required when a provider response exceeds its conservative reservation. Do not invent zero usage.

SQLite transactions use BEGIN IMMEDIATE. Ledger UPDATE and DELETE are blocked by database triggers. No browser database access is exposed; RLS is not applicable to this private local database. Admin authorization is separate from wallet sessions and user API keys. Wallet nonce expiry/replay, session hashes/expiry, same-origin browser mutations, hashed scoped API keys, request/key caps, quote/receipt uniqueness and request concurrency are enforced server-side.

Custom model rates publish only after serving verification. Schema migration 3 adds nullable request price snapshots without changing lots or historical records. Legacy requests retain their original accounting rates; new requests reconcile using their own recorded prices. One dollar equals 1,000,000,000 integer units. Retail charges determine user credit consumption. Cleared capacity conservatively covers full retail obligations; actual provider invoice spending is not integrated and remains labeled unavailable.

## Custom model (only offered model)

server/custom-provider.ts implements the explicitly selected authenticated text-chat SSE protocol, exact decimal catalog configuration, complete normalized usage and identity verification. Configure it using LAUNCH.md; arbitrary schemas need their own adapter. Accounts, credit lots and UI remain separate. No custom inference is marked available before a funded live probe passes.

## Migration and deployment limits

Schema versions are recorded in schema_migrations; quote-evidence columns are added without replacing existing data. Back up the database and validate migrations on a copy. This standalone repository has not imported any previous hosted ledger. Do not switch existing live accounts until a reviewed migration preserves their lots, ledger, requests, quotes and obligations. The workspace preview is deployed through Vercel; the durable account service and custom serving endpoint still require production setup.

A cleared provider balance, real-model streaming run, archive-index performance, wallet signing on real mobile devices, restart behavior on the chosen host and finalized real payment/burn transactions all remain production acceptance requirements.
