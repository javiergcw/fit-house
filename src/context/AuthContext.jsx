import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);
const STORAGE_KEY = 'fit-house-user';

function normalizeUser(apiUser) {
  if (!apiUser) return null;
  const name = [apiUser.first_name, apiUser.last_name].filter(Boolean).join(' ') || apiUser.email;
  return { ...apiUser, name };
}

function loadStoredSession() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const session = JSON.parse(stored);
    if (!session?.token || !session?.user) return null;
    return {
      ...session,
      user: normalizeUser(session.user),
    };
  } catch (_) {
    return null;
  }
}

function saveSession(session) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => loadStoredSession());

  useEffect(() => {
    setSession(loadStoredSession());
  }, []);

  const user = session?.user ?? null;
  const company = session?.company ?? null;

  /** Recibe los datos devueltos por el caso de uso loginUser y establece la sesión */
  const loginWithData = (data) => {
    if (!data?.token || !data?.user) return;
    const normalized = {
      token: data.token,
      user: normalizeUser(data.user),
      company: data.company ?? null,
    };
    setSession(normalized);
    saveSession(normalized);
  };

  const logout = () => {
    setSession(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, company, loginWithData, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
