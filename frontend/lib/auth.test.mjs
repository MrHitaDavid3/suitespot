// Task 5.2.4 - unit tests for lib/auth.ts. No test runner is installed, so
// these use Node's built-in one:
//   node --experimental-strip-types --test lib/auth.test.mjs
import { afterEach, beforeEach, describe, test } from "node:test";
import assert from "node:assert/strict";

import {
  authFetch,
  clearTokens,
  getAccessToken,
  getRefreshToken,
  isExpired,
  refreshSession,
  saveTokens,
} from "./auth.ts";

const API = "http://localhost:8000";

// A JWT with the given payload. Only the payload matters to isExpired.
function jwt(payload) {
  const b64url = (obj) => Buffer.from(JSON.stringify(obj)).toString("base64url");
  return `${b64url({ alg: "HS256", typ: "JWT" })}.${b64url(payload)}.sig`;
}
const nowSec = () => Math.floor(Date.now() / 1000);

function memoryStorage() {
  const data = new Map();
  return {
    getItem: (k) => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => data.set(k, String(v)),
    removeItem: (k) => data.delete(k),
  };
}

function throwingStorage() {
  const fail = () => {
    throw new Error("SecurityError");
  };
  return { getItem: fail, setItem: fail, removeItem: fail };
}

// Queue of responses (or Errors) that fetch returns in order; records calls.
function mockFetch(...responses) {
  const calls = [];
  globalThis.fetch = async (url, init = {}) => {
    calls.push({ url, init });
    const next = responses.shift();
    if (next instanceof Error) throw next;
    return next;
  };
  return calls;
}

const json = (status, body = {}) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

const realFetch = globalThis.fetch;
beforeEach(() => {
  globalThis.localStorage = memoryStorage();
});
afterEach(() => {
  globalThis.fetch = realFetch;
  delete globalThis.localStorage;
});

describe("isExpired", () => {
  test("fresh token is not expired", () => {
    assert.equal(isExpired(jwt({ sub: "u", exp: nowSec() + 900 })), false);
  });
  test("past exp is expired", () => {
    assert.equal(isExpired(jwt({ sub: "u", exp: nowSec() - 1 })), true);
  });
  test("expiring within 30 seconds counts as expired", () => {
    assert.equal(isExpired(jwt({ sub: "u", exp: nowSec() + 10 })), true);
  });
  test("garbage and missing exp are expired", () => {
    assert.equal(isExpired("garbage"), true);
    assert.equal(isExpired(""), true);
    assert.equal(isExpired(jwt({ sub: "u" })), true);
  });
  test("handles base64url characters in the payload", () => {
    // "~~~" and "???" encode to base64url with "-" and "_".
    const token = jwt({ sub: "~~~???", exp: nowSec() + 900 });
    assert.match(token.split(".")[1], /[-_]/);
    assert.equal(isExpired(token), false);
  });
});

describe("token store", () => {
  test("save, read and clear", () => {
    saveTokens({ access_token: "a", refresh_token: "r" });
    assert.equal(getAccessToken(), "a");
    assert.equal(getRefreshToken(), "r");
    clearTokens();
    assert.equal(getAccessToken(), null);
    assert.equal(getRefreshToken(), null);
  });
  test("blocked storage (private mode) does not throw", () => {
    globalThis.localStorage = throwingStorage();
    saveTokens({ access_token: "a", refresh_token: "r" });
    clearTokens();
    assert.equal(getAccessToken(), null);
  });
});

describe("refreshSession", () => {
  test("success saves the new pair", async () => {
    saveTokens({ access_token: "old-a", refresh_token: "old-r" });
    const calls = mockFetch(json(200, { access_token: "new-a", refresh_token: "new-r" }));

    assert.equal(await refreshSession(), true);
    assert.equal(calls[0].url, `${API}/auth/refresh`);
    assert.deepEqual(JSON.parse(calls[0].init.body), { refresh_token: "old-r" });
    assert.equal(getAccessToken(), "new-a");
    assert.equal(getRefreshToken(), "new-r");
  });

  test("401 clears the tokens", async () => {
    saveTokens({ access_token: "a", refresh_token: "r" });
    mockFetch(json(401, { detail: "Invalid session token." }));

    assert.equal(await refreshSession(), false);
    assert.equal(getRefreshToken(), null);
  });

  test("server error keeps the tokens (no logout during a deploy)", async () => {
    saveTokens({ access_token: "a", refresh_token: "r" });
    mockFetch(json(502));

    assert.equal(await refreshSession(), false);
    assert.equal(getRefreshToken(), "r");
  });

  test("network error keeps the tokens", async () => {
    saveTokens({ access_token: "a", refresh_token: "r" });
    mockFetch(new TypeError("Failed to fetch"));

    assert.equal(await refreshSession(), false);
    assert.equal(getRefreshToken(), "r");
  });

  test("no refresh token returns false without calling the API", async () => {
    const calls = mockFetch();
    assert.equal(await refreshSession(), false);
    assert.equal(calls.length, 0);
  });

  test("concurrent calls share one request", async () => {
    saveTokens({ access_token: "a", refresh_token: "r" });
    const calls = mockFetch(json(200, { access_token: "a2", refresh_token: "r2" }));

    const results = await Promise.all([refreshSession(), refreshSession(), refreshSession()]);
    assert.deepEqual(results, [true, true, true]);
    assert.equal(calls.length, 1);
  });
});

describe("authFetch", () => {
  test("attaches the bearer token and keeps caller headers", async () => {
    saveTokens({ access_token: "a", refresh_token: "r" });
    const calls = mockFetch(json(200));

    const res = await authFetch("/bookings", { headers: { "X-Test": "1" } });
    assert.equal(res.status, 200);
    assert.equal(calls[0].url, `${API}/bookings`);
    assert.equal(calls[0].init.headers.get("Authorization"), "Bearer a");
    assert.equal(calls[0].init.headers.get("X-Test"), "1");
  });

  test("on 401 refreshes once and retries with the new token", async () => {
    saveTokens({ access_token: "a", refresh_token: "r" });
    const calls = mockFetch(
      json(401),
      json(200, { access_token: "a2", refresh_token: "r2" }),
      json(200, { ok: true }),
    );

    const res = await authFetch("/bookings");
    assert.equal(res.status, 200);
    assert.equal(calls.length, 3);
    assert.equal(calls[1].url, `${API}/auth/refresh`);
    assert.equal(calls[2].init.headers.get("Authorization"), "Bearer a2");
  });

  test("a second 401 is returned, not retried again", async () => {
    saveTokens({ access_token: "a", refresh_token: "r" });
    const calls = mockFetch(
      json(401),
      json(200, { access_token: "a2", refresh_token: "r2" }),
      json(401),
    );

    const res = await authFetch("/bookings");
    assert.equal(res.status, 401);
    assert.equal(calls.length, 3);
  });

  test("401 with a failed refresh returns the original 401", async () => {
    saveTokens({ access_token: "a", refresh_token: "r" });
    const calls = mockFetch(json(401), json(401));

    const res = await authFetch("/bookings");
    assert.equal(res.status, 401);
    assert.equal(calls.length, 2);
    assert.equal(getAccessToken(), null);
  });

  test("other errors pass through without a refresh", async () => {
    saveTokens({ access_token: "a", refresh_token: "r" });
    const calls = mockFetch(json(500));

    assert.equal((await authFetch("/bookings")).status, 500);
    assert.equal(calls.length, 1);
  });

  test("no token sends no Authorization header", async () => {
    const calls = mockFetch(json(401));
    await authFetch("/bookings");
    assert.equal(calls[0].init.headers.has("Authorization"), false);
  });
});
