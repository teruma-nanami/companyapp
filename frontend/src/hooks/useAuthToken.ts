// src/hooks/useAuthToken.ts
import { useAuth0 } from "@auth0/auth0-react";

export function useAuthToken() {
  const { isAuthenticated, loginWithRedirect, getAccessTokenSilently } =
    useAuth0();

  function authFetch(url: string, init?: RequestInit): Promise<Response> {
    return getAccessTokenSilently().then((token) => {
      const headers: HeadersInit = {
        ...(init?.headers ?? {}),
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      };

      return fetch(url, {
        ...init,
        headers,
      });
    });
  }

  return {
    isAuthenticated,
    loginWithRedirect,
    authFetch,
  };
}
