# Local LLM: product architecture and deployment direction

## Implementation status

The authoritative product lives in `release/`. React/Vite provides the workspace, browser-only context preparation, credit pages and documentation. The same-origin Vercel API relay requires a separate persistent Node 24 service backed by transactional SQLite. Wallet authentication, scoped developer credentials and reserve/settlement accounting exist in the backend; they require production configuration and operational verification.

The custom model endpoint is not connected. The upstream change disabling GPT fallback is preserved. Frontend model identity is Local LLM; it must not imply that cloud inference runs on the user's device. Context Studio does run locally in the browser and never uploads notes by itself.

## Reference inference paths

These are researched options, not installed hardware or a universally optimal setup.

- Apple Silicon: MLX LM, compatible licensed weights sized for available unified memory, evaluated quantization and prompt cache. LoRA is a possible adaptation path after establishing baseline quality.
- GPU serving: vLLM, supported weights and precision, admission control and an authenticated endpoint. Prefix caches need tenant isolation appropriate to the deployment. Benchmark under realistic concurrent use rather than single-request demonstrations.

Choose only after confirming actual RAM/VRAM, model, context length, latency goals and concurrent users. Do not download weights, provision paid infrastructure or describe a custom model as trained merely to populate a marketing diagram.

## Model rollout

1. Inventory real hardware and a permitted dataset.
2. Select licensed weights and record a baseline on held-out tasks.
3. Adapt if justified; compare quality and cost before/after.
4. Load-test the serving runtime and meter complete input/output usage.
5. Connect the authenticated adapter, verify reserves, failures and reconciliation.
6. Publish actual prices and measurements; activate inference only after verification.

Training is opt-in. User notes and chats are not automatically training data. Text deduplication, quantization and prefix caching are separate optimizations; none alone proves a universal saving.

## Pricing comparison

`src/comparison.ts` contains a dated comparison snapshot, separate from financial billing code. Standard uncached API prices checked October 1, 2026: GPT-6.1 Sol and Claude Sonnet 5.5 at $2 input / $10 output per million tokens; GPT-6 Luna at $0.10 / $0.50. Update these source-backed inputs when the published prices change.

The calculator starts with hypothetical Local LLM rates of $0.10 / $0.50. This yields a 95% price difference against those premium baselines and 0% against the efficient-tier baseline. It is not an available offer, measured benchmark or quality-equivalence claim. Consumer subscriptions, tools, long-context premiums, batch discounts and taxes are excluded. Tokenizers differ. Self-hosting economics must include hardware amortization, utilization, power/hosting and operations, separately from subsidies and retail rates.

## Funding

Paid usage creates a service obligation. Received creator fees, operator funding and available operating surplus can support new daily pools after existing obligations and overhead. Burn redemptions need their own reserved funding because burning produces no operating cash. The product does not promise token-holder revenue sharing.

## Primary references

- [MLX LM](https://github.com/ml-explore/mlx-lm)
- [vLLM online serving](https://docs.vllm.ai/en/latest/serving/online_serving/)
- [vLLM prefix caching](https://docs.vllm.ai/en/latest/features/automatic_prefix_caching/)
- [OpenAI API pricing](https://developers.openai.com/api/docs/pricing)
- [Anthropic API pricing](https://platform.claude.com/docs/en/about-claude/pricing)
