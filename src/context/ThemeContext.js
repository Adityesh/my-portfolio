import React from 'react';

export const ThemeContext = React.createContext({
    isDark : false,
    setTheme : () => {}
});

export const ThemeProvider = ThemeContext.Provider
export const ThemeConsumer = ThemeContext.Consumer