# Verified Local Language Model release

Repository: https://github.com/jaycarson373-tech/local-language-model
Runnable source: https://github.com/jaycarson373-tech/local-language-model/tree/main/release
Verified source commit: 4f40db80be0a26c2c3b82715e46d1f8a670d3cbe
Successful validation: https://github.com/jaycarson373-tech/local-language-model/actions/runs/36921289889
Portable source, resolved lockfile and mobile evidence: https://github.com/jaycarson373-tech/local-language-model/actions/runs/36921289889/artifacts/11191389675
Evidence ZIP SHA-256: fc3bfa441f0f548456692d7d88c72eacfc5aba69fade2ae075db9681f8face45

## Working source features

The release contains a normal React/Vite workspace and Node.js/SQLite server: wallet signatures and sessions, conversation history, streaming hosted-model adapter, Markdown/highlighted code/copy/stop/retry, separate credit lots, immutable ledger, proportional funded UTC allocations, canonical USDC purchase quotes, checked canonical burn quotes, finalized receipt verification and replay protection, hashed revocable scoped API keys, exact pricing, transparency and documentation. All requested routes are implemented.

This is a standalone rebuild. Earlier hosted balances and records were not modified or imported. Use release/START_HERE.md; earlier root/app scaffolding and workflows are superseded.

## Exact availability

No public deployment URL exists for this standalone release. Local development URL is http://localhost:5173. Built local preview is http://localhost:3000 with PUBLIC_URL set to that origin. Production needs the exact public HTTPS origin and a persistent private SQLite disk.

No real hosted model is currently connected. The actual adapter target is OpenAI gpt-4.1-mini. The future custom Local Language Model remains In development. Requests use hosted servers; the brand does not claim on-device inference.

## Credit and funding defaults

One dollar = 1,000,000,000 integer units. Published input rate is $0.40 per million tokens; output rate is $1.60 per million. Tools are unsupported. Daily credits expire 24 hours after issuance; purchased/burned credits have no daily expiration. Earliest-expiring lots are reserved first.

Initial cleared funding, daily budget and obligations are zero. New issuance is paused. Actual mint, decimals, minimum holding, RPC, recipient, exclusions and fixed promotional burn conversion are unset. New financial operations remain unavailable without verified provider configuration and funded capacity. Funding receipts are explicitly operator attestations; actual provider invoice spending is not integrated.

## Recorded checks

GitHub Actions completed successfully on the verified source commit:

| Check | Recorded result |
| --- | --- |
| TypeScript | Passed |
| Production frontend build | Passed |
| Controlled automated tests | 29 passed, 0 failed |
| Mobile at 390px and 320px | 2 passed |
| npm dependency audit | 0 vulnerabilities |
| Wallet authentication | Actual HTTP ephemeral-wallet signature flow passed; replay/expiry/origin tests passed |
| Daily claims | Ineligible/excluded rejected; concurrent eligible claim issued once |
| Token movement | Recipient qualification restart and frozen-epoch duplicate prevention passed in controlled history tests |
| Expiration | Daily credits expired; purchased and burned credits remained |
| Streaming and usage | Complete controlled upstream SSE streamed through the actual HTTP gateway; exact balance/key usage settled |
| Concurrent spending | Overspending reservations rejected |
| Receipts | Replay protection and signed canonical burn/payment message checks passed against controlled chain fixtures |
| Reserves | Insufficient funding blocked allocations and burn quotes; overlaps and valid paused quotes stayed funded |
| API keys | Hashing, scope, cap and HTTP revocation checks passed |
| Restart recovery | Fresh process reopened the physical SQLite ledger; undispatched reservations released, uncertain provider cost retained |
| API examples | Documented curl and JavaScript requests exercised the actual HTTP endpoint against a test-only controlled upstream |

These checks do not prove live paid OpenAI availability, real mobile-wallet-extension behavior, archive RPC throughput or real mainnet payment/burn finalization. No funds were transferred and no real tokens were burned during validation.

## Remaining work and operator-only inputs

No further user action is needed for the GitHub push. For production activation the operator must provide: (1) a funded OpenAI credential and secure admin secret; (2) actual canonical mint/decimals/minimum/excluded addresses, archive RPC, canonical USDC recipient and a chosen capped fixed burn conversion; (3) cleared inference funding with receipts and the chosen future daily budget/safety buffer; and (4) a persistent HTTPS deployment target/origin.

After those inputs exist, run the documented funding/provider verification/index activation operations and record real model, wallet, finalized payment/burn and chosen-host restart results. A full 24 hours of finalized holder history must accumulate before qualifying new balances. Production capacity and funding evidence require operator reconciliation. Failed/uncertain provider probe overhead needs verified manual investigation; automatic probe-overhead reconciliation is not implemented.

Repository cleanup of superseded scaffolding/workflows remains blocked in this session: automatic tool approval rejected existing-file edits and branch creation with “MCP tool call requires approval, but approval policy is never.” New-file commits worked, so the complete tested source is in release/. The authoritative green workflow is Verified release; old workflows still target superseded code or an ambiguous selector.

Status: **source pushed and local preview/build verified; production financial operation and actual hosted-model execution are not activated or verified.**
