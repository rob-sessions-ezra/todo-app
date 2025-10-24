import { createContext, useContext, useMemo, useState } from 'react';
import { api, auth } from '../services/api';
import { useQueryClient } from '@tanstack/react-query';

type AuthState = {
  email: string;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [email, setEmail] = useState(auth.email);
  const queryClient = useQueryClient();
  const value = useMemo<AuthState>(() => ({
    email,
    isAuthenticated: !!auth.token,

    async login(e, p) {
      const res = await api.login(e, p);
      setEmail(res.email);

      // Refetch data under the authenticated identity
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['lists'] }),
        queryClient.invalidateQueries({ queryKey: ['tasks'] }),
      ]);
    },

    async register(e, p) {
      const res = await api.register(e, p);
      setEmail(res.email);

      // Refetch data under the authenticated identity
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['lists'] }),
        queryClient.invalidateQueries({ queryKey: ['tasks'] }),
      ]);
    },

    async logout() {
      await api.logout(); // ensures server deletes cookie before we refetch
      setEmail('');
      
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['lists'] }),
        queryClient.invalidateQueries({ queryKey: ['tasks'] }),
      ]);
    }
  }), [email, queryClient]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
