import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('ch-theme');
    const resolved: Theme = (saved === 'light' || saved === 'dark') ? saved : 'dark';
    // Set synchronously here so first React render already has correct data-theme
    // (inline script in index.html also does this, but this is a second safety net)
    document.documentElement.setAttribute('data-theme', resolved);
    return resolved;
  });

  // Keep in sync when user toggles
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ch-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    // Enable transitions only during manual toggle, not on page load
    document.documentElement.classList.add('theme-transitions-enabled');
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
