import { IReportCard } from '@/types/marks.type';
import React, { createContext, useContext, useState } from 'react';

interface Theme {
  primary: string;
  secondary: string;
  tertiary: string;
}

const ThemeContext = createContext({
  theme: {
    primary: '#333333',
    secondary: '#001F3F',
    tertiary: '#800000',
  } as Theme,
  setTheme: (theme: Theme) => {},
});

export const useTheme = () => useContext(ThemeContext);

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>({
    primary: '#333333',
    secondary: '#001F3F',
    tertiary: '#800000',
  });

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
