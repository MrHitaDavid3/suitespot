// Task 5.2.3 - session token store + authenticated fetch.
// Tokens come from the API (5.2.2) and live in localStorage. The server is the
// authority on whether a token is valid; the client only reads `exp` to know
// when to refresh early.
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const ACCESS_KEY = "suitespot.access";
const REFRESH_KEY = "suitespot.refresh";

export type Tokens = { access_token: string; refresh_token: string };

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function saveTokens(tokens: Tokens) {
  try {
    localStorage.setItem(ACCESS_KEY, tokens.access_token);
    localStorage.setItem(REFRESH_KEY, tokens.refresh_token);
  } catch {
    // Storage blocked (private mode etc.) - the user just won't stay logged in.
  }
}

export function clearTokens() {
  try {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  } catch {}
}

export const getAccessToken = () => read(ACCESS_KEY);
export const getRefreshToken = () => read(REFRESH_KEY);

// True if the token is unreadable or expires within the next 30 seconds.
export function isExpired(token: string): boolean {
  try {
    const part = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const { exp } = JSON.parse(atob(part));
    return typeof exp !== "number" || exp * 1000 < Date.now() + 30_000;
  } catch {
    return true;
  }
}

let refreshing: Promise<boolean> | null = null;

// Trade the refresh token for a new pair. Concurrent callers share one request.
export function refreshSession(): Promise<boolean> {
  if (!refreshing) {
    refreshing = (async () => {
      const refresh_token = getRefreshToken();
      if (!refresh_token) return false;
      try {
        const res = await fetch(`${API_URL}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token }),
        });
        if (!res.ok) {
          clearTokens();
          return false;
        }
        saveTokens(await res.json());
        return true;
      } catch {
        // Network error: keep the tokens, the next call can retry.
        return false;
      }
    })().finally(() => {
      refreshing = null;
    });
  }
  return refreshing;
}

// fetch() against the API with the access token attached. On a 401 it
// refreshes once and retries; a second 401 is returned to the caller.
export async function authFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const send = () => {
    const headers = new Headers(init.headers);
    const token = getAccessToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return fetch(`${API_URL}${path}`, { ...init, headers });
  };

  const res = await send();
  if (res.status !== 401 || !(await refreshSession())) return res;
  return send();
}
