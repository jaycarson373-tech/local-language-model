import test from "node:test";
import assert from "node:assert/strict";
import {database} from "../server/database";
import {renewServing} from "../server/serving-maintenance";
import {Service} from "../server/service";

const hour = 3600000;
const start = 1700000000000;
function activated(db: ReturnType<typeof database>, verifiedAt: number) {
  db.prepare("INSERT INTO settings VALUES('verified_custom_provider',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value")
    .run(JSON.stringify({fingerprint: "previously-verified", verifiedAt}));
}

test("maintenance never starts initial paid verification or rechecks a fresh connection", async () => {
  const db = database(":memory:"); let calls = 0;
  const verify = async () => { calls++; };
  await renewServing(db, verify, start);
  activated(db, start);
  await renewServing(db, verify, start + 19 * hour);
  assert.equal(calls, 0);
  db.close();
});

test("verification renews before expiry and concurrent maintenance only dispatches once", async () => {
  const db = database(":memory:"); activated(db, start); let calls = 0;
  let finish!: () => void;
  const verify = async () => { calls++; await new Promise<void>(resolve => { finish = resolve; }); activated(db, start + 20 * hour); };
  const first = renewServing(db, verify, start + 20 * hour);
  await renewServing(db, verify, start + 20 * hour);
  assert.equal(calls, 1);
  finish(); await first;
  await renewServing(db, verify, start + 25 * hour);
  assert.equal(calls, 1);
  db.close();
});

test("failed checks stay unavailable and durable throttling survives verifier state removal", async () => {
  const db = database(":memory:"); activated(db, start); let calls = 0;
  const fail = async () => { calls++; db.prepare("DELETE FROM settings WHERE key='verified_custom_provider'").run(); throw new Error("Provider unavailable"); };
  await renewServing(db, fail, start + 20 * hour);
  assert.equal(db.prepare("SELECT value FROM settings WHERE key='verified_custom_provider'").get(), undefined);
  await renewServing(db, fail, start + 21 * hour);
  assert.equal(calls, 1);
  await renewServing(db, fail, start + 26 * hour);
  assert.equal(calls, 2);
  db.close();
});

test("the service runs renewal only after activation and respects the operator pause", async () => {
  const previous = process.env.LLM_MODEL_PROTOCOL;
  process.env.LLM_MODEL_PROTOCOL = "hosted-credit-sse";
  const db = database(":memory:"); const service = new Service(db); let calls = 0;
  activated(db, Date.now() - 21 * hour);
  service.prepareCapacity = async () => {};
  service.admin = async (path) => { assert.equal(path, "/api/admin/provider/verify"); calls++; return Response.json({verified: true}); };
  try {
    await service.maintenance(); assert.equal(calls, 0);
    service.f.configure(0, 0, false);
    await service.maintenance(); assert.equal(calls, 1);
  } finally {
    if (previous === undefined) delete process.env.LLM_MODEL_PROTOCOL; else process.env.LLM_MODEL_PROTOCOL = previous;
    db.close();
  }
});
