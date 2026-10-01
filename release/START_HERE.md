# Run LOCAL LANGUAGE MODEL — $LLM

Use this **release/** directory. Earlier root and app/ scaffolding is superseded.

```sh
cd release
npm install
cp .env.example .env
npm run dev
```

Development preview: http://localhost:5173. The workspace preview is deployed on Vercel; see VERCEL.md.

Build and run: npm run build, then npm start. For a built local preview set PUBLIC_URL=http://localhost:3000. For production use the exact HTTPS origin, persistent SQLite disk, secure server credentials and cleared funding.

Validation: npm run typecheck; npm test; npm run build; npm audit; npx playwright install chromium; npx playwright test --config playwright.mobile.config.ts. The authoritative GitHub workflow is **Verified release**. Earlier workflows target superseded entries or an ambiguous mobile selector and remain failed; they do not validate this release entry.

Recorded first release results: TypeScript passed, production build passed, 27 controlled tests passed, dependency audit found zero vulnerabilities. The first mobile test reached the navigation step and failed on a selector matching both a hero CTA and sidebar link. The focused mobile config selects the corrected tests at 390px and 320px. The Verified release workflow also tests physical process restart and actual HTTP wallet authentication, API-key revocation and custom-model unavailability with zero charges.

No custom serving endpoint, cleared production funds or canonical token configuration has been provided. Local Language Model is the only offered model and remains In development. The prior hosted adapter is not an active option or fallback. Daily budget/funding are zero, issuance paused, and money flows disabled. Controlled fixtures do not verify live paid inference or actual mainnet finalization. See OPERATOR.md and ACCEPTANCE.md.
