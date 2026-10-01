# Recorded acceptance status

Source exists in app/ and is committed to this GitHub repository. There is no standalone public deployment yet. GitHub Actions is the validation runner; inspect its latest run for authoritative pass/fail results. This document does not claim those checks have passed before the run completes.

Automated controlled checks cover:
- Wallet message authentication, nonce replay/expiration and cross-origin rejection.
- Ineligible and excluded wallets; exactly one concurrent daily claim.
- Full evidenced 24-hour qualification and transfer qualification restart.
- Proportional rounding and balance splitting.
- Daily-credit expiration, purchased/burned permanence and earliest-expiring settlement.
- Concurrent reservations, ledger equality and immutable history.
- Receipt replay, insufficient reserve, overlapping obligations and paused valid quote settlement.
- API-key scope, hashing, spending caps and revocation.
- Restart-state reconciliation and retention of uncertain provider costs.
- Split SSE parsing, complete normalized usage, incomplete-usage protection and the supported text-chat endpoint.
- Canonical finalized signed burn/payment message verification, wrong network, nonfinalized receipts, wrong mint, altered messages and transfer-as-burn rejection.
- Mobile viewport usability and honest unavailable operations.
- Build and TypeScript checks.

Controlled provider and chain fixtures are explicitly test-only. They are not proof of real provider availability, live wallet-extension behavior, actual mainnet payments/burns or deployment restart safety. No upstream key, production mint, cleared funding or public deployment is supplied. Live model streaming and real finalized financial operations remain unverified and disabled pending those configurations.

Initial economics: zero cleared funding, zero daily budget, zero issued credit obligations, new issuance paused; canonical mint/minimum/payment recipient/burn conversion are unset. OpenAI gpt-4.1-mini is the adapter target; no actual model is currently connected. The custom model is In development.
