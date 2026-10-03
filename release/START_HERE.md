# Start FreeLM

Use this release directory. Node.js 24 is required.

```sh
npm install
cp .env.example .env
npm run dev
```

Local preview: http://localhost:5173. Deployed workspace: https://local-language-model.vercel.app.

For the requested free-tier router, follow [router/README.md](router/README.md) and [/setup](https://local-language-model.vercel.app/setup). Add provider credentials only to the private router dashboard and unified credentials only to account-service variables. Keep the existing ledger and its /data volume.

FreeLLMAPI needs provider keys and has quotas. A ready catalog entry and actual streamed usage probe must pass before it is advertised as available. Exact published service prices remain independent of provider free-tier prices. Existing accounts, purchased credits and receipts survive the rebrand.

```sh
npm run typecheck
npm test
npm run build
npm audit
npx playwright install chromium
npx playwright test --config playwright.compute.config.ts
```

The authoritative CI is Verified release. It records controlled wallet, ledger, provider, receipt, restart and desktop/mobile results. See [OPERATOR.md](OPERATOR.md) for funded activation and recovery; controlled tests do not prove production mainnet or real-provider behavior.
