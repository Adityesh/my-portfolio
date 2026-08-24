import React, { createContext } from 'react';

export interface ThemeContextType {
  isDark: boolean;
  setTheme: (dark: boolean) => void;
}

export const ThemeContext = createContext<ThemeContextType | [boolean, React.Dispatch<React.SetStateAction<boolean>>]>({
  isDark: false,
  setTheme: () => {},
});

export const ThemeProvider = ThemeContext.Provider;
export const ThemeConsumer = ThemeContext.Consumer;
