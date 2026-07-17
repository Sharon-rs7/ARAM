import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getCurrentUser, userApi } from '../services/api.js';

const ThemeContext = createContext(null);
const MODES = ['LIGHT', 'DARK', 'SYSTEM'];

function getSystemTheme() {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function normalizeMode(mode) {
  return MODES.includes(mode) ? mode : 'SYSTEM';
}

export function ThemeProvider({ children }) {
  const currentUser = getCurrentUser();
  const [mode, setModeState] = useState(() => normalizeMode(currentUser?.themePreference || localStorage.getItem('themePreference')));
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
  if (!value) throw new Error('useTheme must be used inside ThemeProvider');
  return value;
}
