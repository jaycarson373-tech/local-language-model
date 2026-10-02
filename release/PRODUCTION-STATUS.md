# LocalLM production recovery — October 2, 2026

Public app: https://locallm.fun
Persistent API: https://local-language-model-production.up.railway.app
Railway project: upbeat-achievement; service: local-language-model; environment: production.

The production frontend relays to this API using its existing server-only LLM_BACKEND_URL. Railway uses PUBLIC_URL=https://locallm.fun, PORT=8080, DB_PATH=/data/llm.sqlite and a managed persistent /data volume. Docker VOLUME instructions must not be reintroduced: Railway rejects them. No database lives in Vercel's ephemeral filesystem.

The existing paid hosted-provider key was verified without exposing it. The configured key's available funding ceiling was imported through the provider-backed stock endpoint. A real eight-output-token verification completed with confirmed usage. Production wallet nonce signing, session retrieval, API-key creation/revocation, replay rejection and logout also passed using one unfunded diagnostic account. No real customer payment was made or simulated into production credit.

Already verified hosted serving connections renew through existing maintenance before the 24-hour check expires. Renewal uses the existing funded verifier; there is no bypass of model identity, usage accounting or provider balance checks. Attempts are persisted, bounded to one per six hours, and skipped while the operator pauses the service. First activation still requires explicit verification.

Purchases remain blocked until the owner supplies PAYMENT_RECIPIENT, a Solana public address. Do not invent a recipient or repurpose a different project's treasury. After configuration, verify the canonical mainnet USDC payment and resulting service balance with a real controlled purchase. Current retail pricing is 3.3 times verified provider pricing, so $1 service usage is backed by approximately $0.303 of provider capacity. Service API codes are scoped account keys; they are not OpenRouter account keys or transferable gift codes.

Daily holder allocations remain zero and burn redemption remains unconfigured. Those token-dependent features do not need to be activated for prepaid purchases. Provider and admin secrets are server-only. A newly generated admin credential is backed up in the owner's private ~/.config/local-language-model directory; never copy it into this repository, chat or client code.
