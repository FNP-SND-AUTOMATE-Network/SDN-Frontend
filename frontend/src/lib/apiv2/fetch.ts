import createClient from "openapi-react-query";
import createFetchClient from "openapi-fetch";
import type { paths } from "./schema";

const fetchClient = createFetchClient<paths>({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
});

// Auth middleware — injects Bearer token from localStorage on every request
fetchClient.use({
  async onRequest({ request }) {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("access_token")
        : null;
    if (token) {
      request.headers.set("Authorization", `Bearer ${token}`);
    }
    return request;
  },
});

export const $api = createClient(fetchClient);
export { fetchClient };
