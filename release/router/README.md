# FreeLM serving router

FreeLLMAPI is a separate self-hosted router, not a public anonymous inference API at freellmapi.co. This directory pins its official v0.13.3 image. Its database is separate from FreeLM accounts, balances and receipts.

1. Create a separate Railway service from this repository with Root Directory `/release/router`. Mount a persistent volume at `/data`. Keep the existing FreeLM account service and its volume.
2. In router Variables, set `ENCRYPTION_KEY` to a privately generated 64-character hexadecimal secret. Keep it stable when redeploying; provider keys are encrypted with it.
3. Seed the first dashboard account using private `FREEAPI_CONFIG_JSON` with an `admin` email/password, or claim the dashboard using its first-run setup code from the private logs. Never publish these credentials.
4. Generate the router's public HTTPS domain. Open its dashboard, add valid provider free-tier keys, and enable only free-tier text models that report exact input/output usage. Quotas and provider terms still apply. Keep paid custom endpoints out of this route.
5. Copy the router's unified API key from its Keys page to `FREELLMAPI_API_KEY` in the existing FreeLM account service. Set `FREELLMAPI_BASE_URL=https://YOUR_ROUTER_ORIGIN/v1`, `FREELLMAPI_MODEL=auto`, and `LLM_MODEL_PROTOCOL=freellmapi-sse`.
6. Set exact published `LLM_INPUT_USD_PER_MILLION` and `LLM_OUTPUT_USD_PER_MILLION` service rates. They are customer prices, separate from provider free tiers. Set context/output limits from the available model. No default retail price is invented.
7. Redeploy the account service, record cleared funding with the existing `fund` command and a verified receipt, and run `node scripts/activate-router.mjs --buffer 1` privately. It checks catalog availability and actual streamed usage before funded $1 checkout opens. No free-tier quota is imported as dollar funding.

`auto` chooses the first ready text catalog entry and pins its ID. Models reporting only estimated usage cannot settle retail charges. Expired catalog evidence, a different served model, errors or incomplete streams stop verified settlement and retain uncertain reservations.

FreeLLMAPI's own README labels this free-tier router for experimentation and recommends paid serving for a production product. Free tiers have variable latency, quotas and no SLA. This integration is preview-ready until your deployment, provider permissions, exact usage, reserve funding and end-to-end purchase/chat flow are verified. It does not make an unfunded paid service production-ready.

Sources: https://github.com/tashfeenahmed/freellmapi/tree/v0.13.3 and https://freellmapi.co
