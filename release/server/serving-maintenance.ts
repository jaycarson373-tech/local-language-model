import {row, transaction, type DB} from "./database";

const RENEW_AFTER = 20 * 60 * 60 * 1000;
const RETRY_AFTER = 6 * 60 * 60 * 1000;
const STATE_KEY = "serving_renewal";

function record(db: DB, key: string): Record<string, unknown> | null {
  try {
    const stored = row<{value: string}>(db, "SELECT value FROM settings WHERE key=?", key);
    return stored ? JSON.parse(stored.value) : null;
  } catch { return null; }
}

// Renew an already activated serving connection before its 24-hour check expires.
// A durable claim bounds paid probes across restarts and concurrent calls. Actual
// funding, streaming identity and usage checks remain in the existing verifier.
export async function renewServing(db: DB, verify: () => Promise<unknown>, now = Date.now()) {
  const claimed = transaction(db, () => {
    const verified = record(db, "verified_custom_provider");
    const state = record(db, STATE_KEY);
    const verifiedAt = Number(verified?.verifiedAt);
    const wasVerified = Number.isSafeInteger(verifiedAt) && verifiedAt > 0 && verifiedAt <= now;
    if (!wasVerified && state?.enabled !== true) return false;
    if (wasVerified && now - verifiedAt < RENEW_AFTER) return false;
    const attemptedAt = Number(state?.attemptedAt);
    if (Number.isSafeInteger(attemptedAt) && now - attemptedAt < RETRY_AFTER) return false;
    db.prepare("INSERT INTO settings VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value")
      .run(STATE_KEY, JSON.stringify({enabled: true, attemptedAt: now, status: "checking"}));
    return true;
  });
  if (!claimed) return;
  let status = "verified";
  try { await verify(); } catch { status = "failed"; }
  db.prepare("UPDATE settings SET value=? WHERE key=?")
    .run(JSON.stringify({enabled: true, attemptedAt: now, status}), STATE_KEY);
}
