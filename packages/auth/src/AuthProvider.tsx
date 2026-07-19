import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { PublicClientApplication, AccountInfo, InteractionRequiredAuthError } from '@azure/msal-browser';
import { msalConfig, loginRequest, apiTokenRequest } from './authConfig';

// Constructing PublicClientApplication can throw (e.g. Web Crypto unavailable in this
// browser/context). It must never take the whole app down with it — guard it and let
// AuthProvider surface a visible error instead of the app failing to mount at all.
let msalInstance: PublicClientApplication | null = null;
let msalInitError: string | null = null;
try {
  msalInstance = new PublicClientApplication(msalConfig);
} catch (error) {
  msalInitError = error instanceof Error ? error.message : String(error);
  console.error('[Auth] Failed to construct MSAL instance:', error);
}

export { msalInstance };

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AccountInfo | null;
  authError: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  authError: null,
  login: async () => {},
  logout: async () => {},
  getAccessToken: async () => null,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(msalInitError);

  useEffect(() => {
    if (!msalInstance) {
      setIsLoading(false);
      return;
    }

    const initializeMsal = async () => {
      try {
        await msalInstance!.initialize();
        const response = await msalInstance!.handleRedirectPromise();
        if (response?.account) {
          setAccount(response.account);
          msalInstance!.setActiveAccount(response.account);
        } else {
          const accounts = msalInstance!.getAllAccounts();
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            msalInstance!.setActiveAccount(accounts[0]);
          }
        }
      } catch (error) {
        console.error('[Auth] MSAL initialization error:', error);
        setAuthError(error instanceof Error ? error.message : String(error));
      } finally {
        setIsLoading(false);
      }
    };

    initializeMsal();
  }, []);

  const login = useCallback(async () => {
    if (!msalInstance) return;
    await msalInstance.loginRedirect(loginRequest);
  }, []);

  const logout = useCallback(async () => {
    if (msalInstance && account) {
      await msalInstance.logoutRedirect({ postLogoutRedirectUri: msalConfig.auth.postLogoutRedirectUri });
    }
  }, [account]);

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    if (!msalInstance) return null;
    const activeAccount = msalInstance.getActiveAccount() || msalInstance.getAllAccounts()[0];
    if (!activeAccount) return null;

    try {
      const response = await msalInstance.acquireTokenSilent({ ...apiTokenRequest, account: activeAccount });
      return response.accessToken;
    } catch (error) {
      if (error instanceof InteractionRequiredAuthError) {
        await msalInstance.acquireTokenRedirect(apiTokenRequest);
      }
      console.error('[Auth] Token acquisition error:', error);
      return null;
    }
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!account, isLoading, user: account, authError, login, logout, getAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
