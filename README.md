# LOCAL LANGUAGE MODEL — $LLM

Standalone source code for the Local Language Model AI workspace. **The maintained, runnable application is in [app/](app/).** Use the commands below from that directory. Earlier root-level scaffolding is superseded by app/ and is not the application entry point.

This implementation is React + Vite + a Node.js server + transactional SQLite. It has no hosted-editor dependency. Source was rebuilt directly in this GitHub repository; it is not a verified export of the earlier prototype. No existing hosted balances or records were changed or imported.

## Run locally

Requires Node.js 24 or later.

```sh
cd app
npm install
cp .env.example .env
node scripts/dev.mjs
```

Local development URL: **http://localhost:5173**. API server: http://localhost:3000.
No public deployment or live production URL has been created for this standalone version.

For a built application:

```sh
cd app
npm install
npm run build
node scripts/start.mjs
```

Set PUBLIC_URL to the exact origin users visit. Production requires HTTPS. Run a single application instance with a persistent SQLite disk; Dockerfile is in app/. Back up the database before deploying schema changes. Do not use an ephemeral filesystem or horizontally scale separate ledgers.

## Product

- / and /chat: streaming hosted-model workspace, persistent conversations, Markdown and highlighted code, copy, stop, billing status, explicit billable retries.
- /credits: proven holder qualification, frozen funded UTC allowances, one claim per epoch, separate USDC purchase and actual token-burn flows, pinned quotes and finalized receipt verification.
- /account: wallet identity, separate credit lots, available/reserved balances, request states and immutable ledger entries.
- /developers: one-time secrets for scoped hashed API keys, revocation, last use, spending caps, shared balance, and integration examples.
- /pricing, /transparency and /docs: exact service rates, funding evidence, verified receipts and clear product rules.

## Availability

The provider adapter calls **OpenAI gpt-4.1-mini** server-side. **No real model credentials are included or currently verified.** The custom Local Language Model is In development. The brand does not imply on-device inference.

Initial cleared funding, daily budget and balances are zero; new issuance is paused. Token mint, decimals, minimum holding, RPC, payment recipient and fixed burn conversion are unset. Purchases, burns and grants cannot activate with placeholder configuration or unfunded obligations. API keys are our own service keys, never upstream provider keys.

Read [OPERATOR.md](OPERATOR.md) for secure configuration, funding, provider verification and activation. Read [ACCEPTANCE.md](ACCEPTANCE.md) for the distinction between controlled tests and production verification.

## Checks

```sh
cd app
npm run typecheck
npm test
npm run build
npx playwright install chromium
npx playwright test
```

GitHub Actions runs these checks on the maintained app/. Tests use controlled provider/chain fixtures, never paid inference, mainnet funds or token destruction. Live inference and real finalized purchase/burn transactions require separately verified credentials and funded deployment.
