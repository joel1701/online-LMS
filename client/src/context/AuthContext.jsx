import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi, getToken, setToken, setUnauthorizedHandler } from '../services/api';

// Demo authentication: the token is kept in localStorage and validated with
// GET /api/auth/me on load. Swap for JWT handling when real auth is added.
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(Boolean(getToken()));

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout);
    if (!getToken()) return;
    authApi
      .me()
      .then((res) => setUser(res.user))
      .catch(() => logout())
      .finally(() => setChecking(false));
  }, [logout]);

  const login = useCallback(async (identifier, password) => {
    const res = await authApi.login(identifier, password);
    setToken(res.token);
    setUser(res.user);
    return res.user;
  }, []);

  const value = useMemo(() => ({ user, setUser, checking, login, logout }), [user, checking, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

export const ROLE_HOME = { student: '/student', teacher: '/teacher', admin: '/admin' };
export const ROLE_LABEL = { student: 'Student', teacher: 'Faculty', admin: 'Administrator' };
