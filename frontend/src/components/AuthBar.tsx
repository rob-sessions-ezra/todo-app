import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { ThemeToggle } from './ThemeToggle';

export function AuthBar() {
  const { isAuthenticated, email, login, register, logout } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [e, setE] = useState('');
  const [p, setP] = useState('');

  if (isAuthenticated) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600 dark:text-slate-300">{email}</span>
        <button
          onClick={logout}
          className="text-sm px-3 py-1.5 rounded-md border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700"
        >
          Logout
        </button>
        <ThemeToggle />
      </div>
    );
  }

  return (
    <form
      onSubmit={async (e0) => {
        e0.preventDefault();
        if (!e || !p) {
            return;
        }
        if (mode === 'login') {
            await login(e, p);
        }
        else {
            await register(e, p);
        }
        setE('');
        setP('');
      }}
      className="flex items-center gap-2"
    >
      <input
        type="email"
        placeholder="email"
        value={e}
        onChange={ev => setE(ev.target.value)}
        className="px-2 py-1 border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-sm"
      />
      <input
        type="password"
        placeholder="password"
        value={p}
        onChange={ev => setP(ev.target.value)}
        className="px-2 py-1 border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-sm"
      />
      <button
        type="submit"
        className="text-sm px-3 py-1.5 rounded-md border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700"
      >
        {mode === 'login' ? 'Login' : 'Sign up'}
      </button>
      <button
        type="button"
        onClick={() => setMode(m => (m === 'login' ? 'register' : 'login'))}
        className="text-xs text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200"
      >
        {mode === 'login' ? 'Need an account?' : 'Have an account?'}
      </button>
      <ThemeToggle />
    </form>
  );
}
