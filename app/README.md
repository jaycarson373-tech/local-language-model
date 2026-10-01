# LOCAL LANGUAGE MODEL — $LLM

This directory contains the standalone application. **Use scripts/run.mjs and vite.standalone.ts.** The corrected browser entry is src/workspace.tsx. Earlier scaffolding entries main.tsx, vite.config.ts, Dockerfile and the original root workflow are superseded; the authoritative workflow is [Standalone validation](../.github/workflows/standalone.yml).

Node.js 24 is required. From this directory:

```sh
npm install
cp .env.example .env
node scripts/run.mjs dev
```

Local URL: http://localhost:5173. No public deployment has been created. Configuration remains empty and funded balances remain zero, so real-money operations and inference are unavailable until the operator securely configures and verifies them.

Build and run:

```sh
node scripts/run.mjs build
node scripts/run.mjs start
```

Built preview URL: http://localhost:3000. Set PUBLIC_URL to that origin for a built local preview. In production set NODE_ENV=production and PUBLIC_URL to the exact public HTTPS origin, with a persistent DB_PATH. Use Dockerfile.standalone when building a container.

Validation:

```sh
node scripts/run.mjs typecheck
npm test
node scripts/run.mjs build
npx playwright install chromium
npx playwright test
```

All routes: /, /chat, /credits, /account, /developers, /pricing, /transparency and /docs. Wallet identity, credit lots, funded allocations, quotes, receipts, reservations, usage and API keys persist in transactional SQLite. The ledger is append-only. Model integration targets OpenAI gpt-4.1-mini; no real credential or production funding is included. Our future custom model remains In development.

Read ../OPERATOR.md and ../ACCEPTANCE.md for security, funded activation and controlled-test versus production verification. This is a standalone rebuild; no previous hosted records have been imported or modified.
