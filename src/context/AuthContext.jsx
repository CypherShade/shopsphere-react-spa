import { createContext, useCallback, useContext, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const AuthContext = createContext(null);

export const DEMO_USER = { username: 'demo', password: 'demo1234' };

export function AuthProvider({ children }) {
  const [user, setUser] = useLocalStorage('ss-user', null);

  // Simulated async login; swap for a real API call without touching consumers
  const login = useCallback(
    async (username, password) => {
      await new Promise((r) => setTimeout(r, 500));
      if (username.trim().length < 3 || password.length < 6) {
        throw new Error('Username must be 3+ characters and password 6+ characters.');
      }
      const profile = {
        username: username.trim(),
        name: username.trim().replace(/^\w/, (c) => c.toUpperCase()),
        email: `${username.trim().toLowerCase()}@shopsphere.dev`,
        since: new Date().toISOString(),
      };
      setUser(profile);
      return profile;
    },
    [setUser]
  );

  const logout = useCallback(() => setUser(null), [setUser]);

  const updateProfile = useCallback(
    (patch) => setUser((prev) => (prev ? { ...prev, ...patch } : prev)),
    [setUser]
  );

  // Memoised value: consumers only re-render when the user actually changes
  const value = useMemo(
    () => ({ user, isAuthenticated: Boolean(user), login, logout, updateProfile }),
    [user, login, logout, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
