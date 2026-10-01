# Run LOCAL LANGUAGE MODEL — $LLM

Use this **release/** directory. Earlier root and app/ scaffolding is superseded.

```sh
cd release
npm install
cp .env.example .env
npm run dev
```

Development preview: http://localhost:5173. No public deployment has been created.

Build and run: npm run build, then npm start. For a built local preview set PUBLIC_URL=http://localhost:3000. For production use the exact HTTPS origin, persistent SQLite disk, secure server credentials and cleared funding.

Validation: npm run typecheck; npm test; npm run build; npm audit; npx playwright install chromium; npx playwright test --config playwright.mobile.config.ts. The authoritative GitHub workflow is **Verified release**. Earlier workflows target superseded entries or an ambiguous mobile selector and remain failed; they do not validate this release entry.

Recorded first release results: TypeScript passed, production build passed, 27 controlled tests passed, dependency audit found zero vulnerabilities. The first mobile test reached the navigation step and failed on a selector matching both a hero CTA and sidebar link. The focused mobile config selects the corrected tests at 390px and 320px. The Verified release workflow also tests physical process restart and actual HTTP curl/JavaScript examples with a controlled upstream fixture.

No real model key, cleared production funds, canonical token configuration or deployment has been provided. OpenAI gpt-4.1-mini is the real integration target, currently unconnected. Daily budget/funding are zero, issuance paused, and money flows disabled. Controlled fixtures do not verify live paid inference or actual mainnet finalization. See OPERATOR.md and ACCEPTANCE.md.
