import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { PublicClientApplication, AccountInfo, InteractionRequiredAuthError } from '@azure/msal-browser';
import { msalConfig, loginRequest, apiTokenRequest } from './authConfig';

// Singleton MSAL instance shared across the app.
export const msalInstance = new PublicClientApplication(msalConfig);

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AccountInfo | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  login: async () => {},
  logout: async () => {},
  getAccessToken: async () => null,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeMsal = async () => {
      try {
        await msalInstance.initialize();
        const response = await msalInstance.handleRedirectPromise();
        if (response?.account) {
          setAccount(response.account);
          msalInstance.setActiveAccount(response.account);
        } else {
          const accounts = msalInstance.getAllAccounts();
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            msalInstance.setActiveAccount(accounts[0]);
          }
        }
      } catch (error) {
        console.error('[Auth] MSAL initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeMsal();
  }, []);

  const login = useCallback(async () => {
    await msalInstance.loginRedirect(loginRequest);
  }, []);

  const logout = useCallback(async () => {
    if (account) {
      await msalInstance.logoutRedirect({ postLogoutRedirectUri: msalConfig.auth.postLogoutRedirectUri });
    }
  }, [account]);

  const getAccessToken = useCallback(async (): Promise<string | null> => {
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
    <AuthContext.Provider value={{ isAuthenticated: !!account, isLoading, user: account, login, logout, getAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
