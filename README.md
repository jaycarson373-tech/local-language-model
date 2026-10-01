# LOCAL LANGUAGE MODEL — $LLM

Standalone source code for the Local Language Model AI workspace. **The maintained, deployed application is in [release/](release/).** Use the commands below from that directory. Earlier root-level and app/ scaffolding is superseded by release/ and is not the application entry point.

This implementation is React + Vite + a Node.js server + transactional SQLite. It has no hosted-editor dependency. Source was rebuilt directly in this GitHub repository; it is not a verified export of the earlier prototype. No existing hosted balances or records were changed or imported.

## Run locally

Requires Node.js 24 or later.

```sh
cd release
npm install
cp .env.example .env
npm run dev
```

Local development URL: **http://localhost:5173**. API server: http://localhost:3000.
No public deployment or live production URL has been created for this standalone version.

For a built application:

```sh
cd release
npm install
npm run build
npm start
```

Set PUBLIC_URL to the exact origin users visit. Production requires HTTPS. Run a single application instance with a persistent SQLite disk; Dockerfile is in release/. Back up the database before deploying schema changes. Do not use an ephemeral filesystem or horizontally scale separate ledgers.

## Product

- /: product overview and daily holder-credit pitch.
- /context: browser-local text import, exact paragraph deduplication, measured byte changes and explicit chat handoff.
- /chat: streaming hosted-model workspace, persistent conversations, Markdown and highlighted code, copy, stop, billing status, explicit billable retries.
- /credits: proven holder qualification, frozen funded UTC allowances, one claim per epoch, separate USDC purchase and actual token-burn flows, pinned quotes and finalized receipt verification.
- /account: wallet identity, separate credit lots, available/reserved balances, request states and immutable ledger entries.
- /developers: one-time secrets for scoped hashed API keys, revocation, last use, spending caps, shared balance, and integration examples.
- /pricing, /transparency and /docs: exact service rates, funding evidence, verified receipts and clear product rules.

## Availability

The interface offers Local LLM with its custom endpoint still in development. The latest production configuration deliberately disables the previous GPT fallback. Context Studio runs locally in the browser; no custom inference or 95% savings claim is made.

Initial cleared funding, daily budget and balances are zero; new issuance is paused. Token mint, decimals, minimum holding, RPC, payment recipient and fixed burn conversion are unset. Purchases, burns and grants cannot activate with placeholder configuration or unfunded obligations. API keys are our own service keys, never upstream provider keys.

Read [OPERATOR.md](OPERATOR.md) for secure configuration, funding, provider verification and activation. Read [ACCEPTANCE.md](ACCEPTANCE.md) for the distinction between controlled tests and production verification.

## Checks

```sh
cd release
npm run typecheck
npm test
npm run build
npx playwright install chromium
npx playwright test
```

GitHub Actions runs these checks on the maintained release/. Tests use controlled provider/chain fixtures, never paid inference, mainnet funds or token destruction. Live inference and real finalized purchase/burn transactions require separately verified credentials and funded deployment.
