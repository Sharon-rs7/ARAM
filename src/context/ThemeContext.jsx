import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getCurrentUser, userApi } from '@/services/api.js';

const ThemeContext = createContext(null);
const MODES = ['LIGHT', 'DARK', 'SYSTEM'];

function getSystemTheme() {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function normalizeMode(mode) {
  return (mode && MODES.includes(mode)) ? mode : 'LIGHT';
}

export function ThemeProvider({ children }) {
  const currentUser = getCurrentUser();
  const [mode, setModeState] = useState(() => {
    const saved = localStorage.getItem('themePreference');
    if (saved && MODES.includes(saved)) return saved;
    if (currentUser?.themePreference && MODES.includes(currentUser.themePreference)) {
      return currentUser.themePreference;
    }
    return 'LIGHT';
  });
  const [systemTheme, setSystemTheme] = useState(getSystemTheme);

  useEffect(() => {
    const media = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!media) return undefined;
    const listener = () => setSystemTheme(getSystemTheme());
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  const resolvedTheme = mode === 'SYSTEM' ? systemTheme : mode.toLowerCase();

  useEffect(() => {
    localStorage.setItem('themePreference', mode);
    document.documentElement.dataset.theme = resolvedTheme;
    if (resolvedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [mode, resolvedTheme]);

  async function setMode(nextMode) {
    const normalized = normalizeMode(nextMode);
    setModeState(normalized);
    const user = getCurrentUser();
    if (user?.id) {
      try {
        const updated = await userApi.updateTheme(normalized);
        localStorage.setItem('user', JSON.stringify(updated));
      } catch {
        localStorage.setItem('themePreference', normalized);
      }
    }
  }

  const value = useMemo(() => ({ mode, resolvedTheme, setMode }), [mode, resolvedTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) {
    return { mode: "light", resolvedTheme: "light", setMode: () => {} };
  }
  return value;
}
