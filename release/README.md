# FreeLM

FreeLM is the application and AI workspace. The existing $LLM token, wallet accounts, service API keys, immutable ledger, credit lots and transaction receipts are retained.

The canonical runnable app is `release/`: React, Vite, Node 24 and SQLite. Root/app scaffolding is historical; deployments use this release. Existing databases remain at their configured paths, including /data/llm.sqlite. A brand change does not reset or rename financial records.

```sh
npm install
cp .env.example .env
npm run dev
npm run typecheck
npm test
npm run build
npm start
```

FreeLLMAPI free-tier serving uses the new `freellmapi-sse` adapter. Deploy the isolated router in `router/`, add usable provider keys, and connect its private unified key and HTTPS /v1 URL to FreeLM. The public freellmapi.co website is not an inference endpoint. Read [router/README.md](router/README.md) and use [/setup](https://local-language-model.vercel.app/setup) for exact configuration blocks.

The adapter verifies ready catalog entries, pins a model, checks the actual serving header, streams text, rejects estimated usage for settlement and preserves uncertain reservations. It does not replace authentication or credit accounting. The funded hosted and custom endpoint adapters remain available for existing installations.

Public API model ID: `free-lm`. Existing clients using `local-language-model` remain accepted. Existing API-key prefixes and session cookies remain compatible.

Customer service prices are independent of provider free-tier pricing. The existing $1 USDC package still adds $1 of usage; no unrequested conversion or new token ticker is introduced. Daily claims remain disabled. Purchases/burns require verified serving and sufficient cleared reserve. No free quotas count as cash funding.

Run verified.yml for build, typecheck, ledger/provider tests and desktop/mobile browser evidence. The FreeLLMAPI project describes its free tiers as experimental, so an installed adapter alone is not proof of production AI or payment availability.
