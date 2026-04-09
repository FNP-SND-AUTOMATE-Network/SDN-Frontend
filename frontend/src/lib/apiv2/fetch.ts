import createClient from "openapi-react-query";
import createFetchClient from "openapi-fetch";
import type { paths } from "./schema";

// Create a custom fetcher that always forces credentials inclusion 
// (openapi-fetch supports passing a custom fetch function)
const customFetch = (url: RequestInfo | URL, init?: RequestInit) => {
  return fetch(url, { ...init, credentials: "include" });
};

const fetchClient = createFetchClient<paths>({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
  fetch: customFetch,
});

// Interceptor for Auto-Silent Refresh on 401 Unauthorized
fetchClient.use({
  async onResponse({ request, response }) {
    // If we get 401 and it's NOT a login/refresh route, try to refresh
    if (response.status === 401 && !request.url.includes('/auth/')) {
      try {
        const refreshResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/refresh`, {
          method: "POST",
          credentials: "include", // Send the HttpOnly refresh_token cookie
        });

        if (refreshResponse.ok) {
          return await fetch(request);
        } else {
            // Force logout if refresh token is dead
            window.location.href = '/login';
        }
      } catch (error) {
        console.error("Silent refresh failed:", error);
      }
    }
    return response;
  },
});

export const $api = createClient(fetchClient);
export { fetchClient };
