import type { Configuration, LogLevel as LogLevelType } from '@azure/msal-browser';
import { LogLevel } from '@azure/msal-browser';

type ImportMetaEnv = { env?: Record<string, string | undefined> };

function readEnv(key: string, fallback: string): string {
  const env = (import.meta as unknown as ImportMetaEnv).env;
  return env?.[key] ?? fallback;
}

// Entra App Registration for atlas.sagesure.io.
// Public client (SPA, PKCE) — no client secret involved.
export const ENTRA_CLIENT_ID = readEnv('VITE_ENTRA_CLIENT_ID', '30d2deb0-ee52-4949-a8f8-035e6053a812');
export const ENTRA_TENANT_ID = readEnv('VITE_ENTRA_TENANT_ID', 'e9394f90-446d-41dd-8c8c-98ac08c5f090');
export const ENTRA_API_SCOPE = readEnv('VITE_ENTRA_API_SCOPE', `api://${ENTRA_CLIENT_ID}/access_as_user`);

const redirectUri = readEnv('VITE_ENTRA_REDIRECT_URI', typeof window !== 'undefined' ? window.location.origin : '');

export const msalConfig: Configuration = {
  auth: {
    clientId: ENTRA_CLIENT_ID,
    authority: 'https://login.microsoftonline.com/common',
    redirectUri,
    postLogoutRedirectUri: redirectUri,
    navigateToLoginRequestUrl: false,
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level: LogLevelType, message: string, containsPii: boolean) => {
        if (containsPii) return;
        if (level === LogLevel.Error) console.error(message);
      },
    },
  },
};

// `user` (AccountInfo) comes from the ID token's own claims (name, preferred_username)
// via MSAL's account cache -- this app never calls Microsoft Graph for anything, so
// User.Read was never actually needed. It used to be requested here anyway, alongside
// the custom API scope -- combining a Microsoft Graph scope with a custom "expose an
// API" App ID URI scope in one request fails for this app's signInAudience
// (AzureADandPersonalMicrosoftAccount) with AADSTS70011 "scopes ... are not compatible
// with each other". Removing the unused scope removes the whole class of risk rather
// than working around the specific rejection. MSAL adds openid/profile/offline_access
// to every interactive login automatically -- no need to list them.
export const loginRequest = { scopes: [ENTRA_API_SCOPE] };
export const apiTokenRequest = { scopes: [ENTRA_API_SCOPE] };
