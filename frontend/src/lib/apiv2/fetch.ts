import createClient from "openapi-react-query";
import createFetchClient from "openapi-fetch";
import type { paths } from "./schema";

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Read a named cookie from document.cookie.
 * Returns undefined when running on the server (SSR) or when the cookie is absent.
 */
function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const prefix = `${name}=`;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(prefix));
  // Use slice instead of split("=")[1] to handle values containing "="
  return match ? decodeURIComponent(match.slice(prefix.length)) : undefined;
}

/** HTTP methods that mutate state and therefore require CSRF protection. */
const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

// ──────────────────────────────────────────────────────────────────────────────
// Custom fetch — credentials + CSRF token (double-submit cookie pattern)
// ──────────────────────────────────────────────────────────────────────────────
const customFetch = (url: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const method = (init?.method ?? "GET").toUpperCase();

  const headers = new Headers(init?.headers);

  // Attach X-CSRF-Token for all state-mutating requests.
  // The backend sets a "csrf_token" cookie (non-HttpOnly) after login.
  if (MUTATING_METHODS.has(method)) {
    const csrfToken = getCookie("csrf_token");
    if (csrfToken) {
      headers.set("X-CSRF-Token", csrfToken);
    }
  }

  return fetch(url, { ...init, headers, credentials: "include" });
};

// ──────────────────────────────────────────────────────────────────────────────
// openapi-fetch client
// ──────────────────────────────────────────────────────────────────────────────
const fetchClient = createFetchClient<paths>({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
  fetch: customFetch,
});

// ──────────────────────────────────────────────────────────────────────────────
// Response interceptors
// ──────────────────────────────────────────────────────────────────────────────
fetchClient.use({
  async onResponse({ request, response }) {
    const url = request.url;
    const isAuthRoute =
      url.includes("/auth/refresh") ||
      url.includes("/auth/login") ||
      url.includes("/auth/register");

    // ── 401 Unauthorized — silent token refresh ────────────────────────────
    if (response.status === 401 && !isAuthRoute) {
      try {
        // Use customFetch so the refresh POST includes credentials + CSRF token
        const refreshResponse = await customFetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          { method: "POST" }
        );

        if (refreshResponse.ok) {
          // Retry the original request via customFetch so CSRF token is attached
          return await customFetch(request.url, {
            method: request.method,
            headers: request.headers,
            body: request.body,
          });
        } else {
          // Refresh token expired or revoked — force logout
          window.location.href = "/login";
        }
      } catch (error) {
        console.error("Silent refresh failed:", error);
      }
    }

    // ── 403 Forbidden — RBAC enforcement ─────────────────────────────────────
    // Dispatch a custom event so any mounted SnackbarProvider / toast can catch it
    // without coupling this module to a specific UI library.
    if (response.status === 403) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("api:forbidden", {
            detail: { url, method: request.method },
          })
        );
      }
    }

    return response;
  },
});

// ──────────────────────────────────────────────────────────────────────────────
// Exports
// ──────────────────────────────────────────────────────────────────────────────
export const $api = createClient(fetchClient);
export { fetchClient };
