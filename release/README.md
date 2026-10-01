# LOCAL LANGUAGE MODEL — $LLM

**This release/ directory is the runnable standalone application.** It contains normal React, Vite, Node.js and SQLite source files. The earlier root/app scaffolding is superseded by this folder. The authoritative CI workflow is verified.yml.

Requires Node.js 24 or later. From release/:

```sh
npm install
cp .env.example .env
npm run dev
```

Development URL: http://localhost:5173. The helpers load .env server-side; secrets are never bundled into the browser.

```sh
npm run typecheck
npm test
npm run build
npm start
```

Built local URL: http://localhost:3000; set PUBLIC_URL to that origin for a built local preview. The workspace preview is deployed on Vercel; see VERCEL.md. For production set NODE_ENV=production, PUBLIC_URL to the exact public HTTPS origin and DB_PATH to a persistent disk. Use this folder's Dockerfile and maintain one app instance per ledger.

Routes: /, /chat, /credits, /account, /developers, /pricing, /transparency and /docs. The chat workspace is the primary interface.

The server implements wallet signatures, scoped hashed API keys, persistent conversations, a provider adapter layer, exact credit lots, an immutable ledger, funded holder epochs, canonical USDC payment quotes, actual checked-token burn quotes, finalized receipt verification, anti-replay, atomic reservations and restart reconciliation. The token instruction module encodes only canonical legacy SPL transferChecked/burnChecked instructions and ATA derivation; its exact bytes are tested.

The only offered model is our custom Local Language Model, currently In development with no connected serving endpoint. GPT-4.1 is removed from the product. The prior hosted adapter remains dormant for reference; it cannot be selected, probed, or used as fallback. Custom rates and limits will be published after endpoint verification. Initial funding and daily budget are zero, issuance is paused, and mint/recipient/conversion configuration is unset. Inference and financial operations stay unavailable until real funded configuration is verified. This is a standalone rebuild; no previous hosted ledger has been imported or changed.

Read OPERATOR.md and ACCEPTANCE.md in this folder. Controlled provider and chain fixtures are not proof of paid inference or real mainnet transaction behavior. GitHub Actions records build, typecheck, automated tests, audit and mobile evidence. Production activation still requires real credentials, cleared funding, canonical configuration and verified deployment behavior.
