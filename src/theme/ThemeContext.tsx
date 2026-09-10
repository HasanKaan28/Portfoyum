import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
import { ThemeColors, lightTheme, darkTheme } from './colors';

export type ThemePreference = 'system' | 'light' | 'dark';

interface ThemeContextType {
  colors: ThemeColors;
  isDark: boolean;
  themePreference: ThemePreference;
  setThemePreference: (pref: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  colors: darkTheme,
  isDark: true,
  themePreference: 'system',
  setThemePreference: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const deviceColorScheme = useDeviceColorScheme();
  const [themePreference, setThemePreference] = useState<ThemePreference>('system');

  const isDark =
    themePreference === 'system'
      ? deviceColorScheme === 'dark'
      : themePreference === 'dark';

  const colors = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ colors, isDark, themePreference, setThemePreference }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
