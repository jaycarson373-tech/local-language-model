# Separate, pinned FreeLLMAPI router; never shares FreeLM's ledger database.
FROM ghcr.io/tashfeenahmed/freellmapi:v0.13.3
ENV FREEAPI_DB_PATH=/data/freellmapi.sqlite HOST=0.0.0.0
# ENCRYPTION_KEY and provider credentials must be configured privately.
# Persistent /data is mounted by the hosting service.
