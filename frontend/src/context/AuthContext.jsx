import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  clearSession,
  fetchCurrentUser,
  getStoredUser,
  login as loginRequest,
  register as registerRequest,
  socialLogin as socialLoginRequest,
} from '../lib/authApi.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const current = await fetchCurrentUser();
      if (!cancelled) {
        setUser(current);
        setIsLoading(false);
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (credentials) => {
    const nextUser = await loginRequest(credentials);
    setUser(nextUser);
    return nextUser;
  }, []);

  const register = useCallback(async (payload) => {
    const nextUser = await registerRequest(payload);
    setUser(nextUser);
    return nextUser;
  }, []);

  const socialLogin = useCallback(async (payload) => {
    const nextUser = await socialLoginRequest(payload);
    setUser(nextUser);
    return nextUser;
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      login,
      register,
      socialLogin,
      logout,
    }),
    [user, isLoading, login, register, socialLogin, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
