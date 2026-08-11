import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Models } from 'appwrite';
import { account, ID } from '../lib/appwrite';

type AppwriteUser = Models.User<Models.Preferences>;

interface AuthContextValue {
  user: AppwriteUser | null;
  loading: boolean;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  logIn: (email: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppwriteUser | null>(null);
  const [loading, setLoading] = useState(true);

  async function refreshUser() {
    try {
      const current = await account.get();
      setUser(current);
    } catch {
      setUser(null);
    }
  }

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, []);

  async function signUp(name: string, email: string, password: string) {
    await account.create(ID.unique(), email, password, name);
    await account.createEmailPasswordSession(email, password);
    await refreshUser();
  }

  async function logIn(email: string, password: string) {
    await account.createEmailPasswordSession(email, password);
    await refreshUser();
  }

  async function logOut() {
    await account.deleteSession('current');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, signUp, logIn, logOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
