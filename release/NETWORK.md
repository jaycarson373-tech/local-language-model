# Compute homepage and live telemetry

The homepage shows three product areas: the compute account, Local Model workspace and GPU network. Wallet balance, frozen daily allocation, available credit and published reset deadline come from authenticated `/api/me`. Balance observations carry an evidence timestamp. Unknown balances, absent epochs and unavailable counters show an em dash. No allowance is calculated from an invented token threshold.

`GET /api/network` is a public, uncached, sanitized status endpoint. Without the persistent backend, the Vercel relay reports its actual preview state: interface and relay ready; durable account backend, custom inference and hardware telemetry not connected. No synthetic usage, GPUs, VRAM or utilization is returned.

## Read actual GPU telemetry

On the NVIDIA host, run the supplied collector after installing Node 24 and this release's dependencies:

```sh
node --env-file=.env scripts/gpu-collector.ts
```

Set `LLM_TELEMETRY_TOKEN` to a cryptographically random secret of at least 32 characters using your secret manager. The collector binds to 127.0.0.1:9108 by default (`LLM_TELEMETRY_PORT` and `LLM_TELEMETRY_BIND` are optional). Keep it private and use an authenticated HTTPS reverse proxy reachable from the persistent account service.

The collector runs the real `nvidia-smi` command for GPU UUID, total memory in MiB and utilization percentage. It never fabricates a successful sample when that command fails. GPU online means accessible to nvidia-smi; it does not mean the model is serving. Requests served, tokens generated and model version stay null until real serving counters are connected.

Configure only the persistent backend:
- `LLM_TELEMETRY_URL=https://YOUR-COLLECTOR/metrics`
- `LLM_TELEMETRY_TOKEN=YOUR-READ-ONLY-SECRET`

No `VITE_` secret is used. No browser request reaches the collector. The account service validates HTTPS, authentication, response size, integer counters, GPU identities and sample freshness. Samples older than 60 seconds, malformed samples and request failures produce unavailable values. Requests are deduplicated and cached for up to 15 seconds; the homepage refreshes every 15 seconds. No stale success is kept indefinitely.

The HTTPS JSON collector contract is:

```json
{
  "observedAt": "ISO UTC time of the actual sample",
  "gpus": [
    {"id": "private GPU identifier", "online": true, "vramBytes": "measured integer bytes", "utilizationBps": 0}
  ],
  "requestsServed": null,
  "tokensGenerated": null,
  "modelVersion": null
}
```

This describes a contract, not an active production sample. Utilization uses integer basis points (100 = 1%). Aggregate VRAM counts online GPUs. Aggregate utilization is the mean across online GPUs. Counter values, when measured, are unsigned integer strings to preserve precision; null means unknown. Counters must cover the disclosed hardware-serving scope, never website visits or projected usage. Model version is an actual served identifier, not the UI's LLM-1 preview label.

The public endpoint omits GPU identifiers, credentials, internal URLs, prompts and collector extras. Readings are attributed to an authenticated collector, not independently audited measurements. Receiving telemetry never enables chat, new grants or burns. The custom model adapter still requires verified execution, exact published rates, limits and complete usage accounting.

## Inventory versus telemetry

The repository records the operator's October 1, 2026 confirmation of a four-RTX-5090 server (32GB each), 256GB ECC and Threadripper PRO. The homepage labels this as operator-confirmed inventory. It is separate from measured online capacity. No published inventory value is used as a substitute for live telemetry.

Inference, when connected, runs on operator hardware. The brand does not imply inference on the customer's device. Context Studio remains a separate browser tool whose real local processing is preserved.

## Verification

Node tests cover actual account field mapping, integer formatting, unknown metrics, sanitized authenticated samples, stale/future/invalid/oversized samples and nvidia-smi output parsing. Browser checks cover the homepage, wallet CTA, account data, network readings, custom-only workspace, context handoff and responsive layouts. Controlled samples are clearly test fixtures and do not verify your physical hardware or production inference endpoint.
