# FreeLM — $LLM

The maintained application is [release/](release/): the FreeLM workspace, wallet accounts, persistent credit ledger and developer API.

Preview: **https://local-language-model.vercel.app**. The deployment URL and existing $LLM token remain compatible with existing accounts.

```sh
cd release
npm install
cp .env.example .env
npm run dev
```

FreeLLMAPI is now supported as a separate self-hosted free-tier router. It needs provider credentials and has provider quotas; freellmapi.co is not an anonymous inference endpoint. See [router setup](release/router/README.md), [copyable setup](https://local-language-model.vercel.app/setup), and the [operator guide](release/OPERATOR.md).

Authentication, API-key hashes, credit lots, payments, burns, request recovery and historical records are preserved. New requests use public model ID `free-lm`; the previous ID remains accepted. No database reset or new token is required.

The existing $1 canonical Solana USDC package remains $1 of service usage. Paid checkout, daily grants and burn quotes still require verified serving and backed capacity. Daily claims and larger packages remain disabled in the interface.

Run build, typecheck and controlled ledger/provider/browser checks through [Verified release](https://github.com/jaycarson373-tech/local-language-model/actions/workflows/verified.yml). Real-model availability and finalized mainnet transactions must be verified on the configured deployment; controlled fixtures are not production evidence.
