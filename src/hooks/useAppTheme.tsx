import "expo-sqlite/localStorage/install";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren
} from "react";
import { useColorScheme } from "react-native";
import {
  createShadows,
  darkColors,
  lightColors,
  type ThemeColors
} from "@/lib/theme";

export type ThemePreference = "system" | "light" | "dark";

type AppThemeContextValue = {
  colors: ThemeColors;
  isDark: boolean;
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
  shadows: ReturnType<typeof createShadows>;
};

const STORAGE_KEY = "outgo.themePreference";

const AppThemeContext = createContext<AppThemeContextValue | undefined>(undefined);

function readStoredPreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
  } catch {
    // Preference persistence is best-effort; system theme remains available.
  }
  return "system";
}

export function AppThemeProvider({ children }: PropsWithChildren) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>("system");

  useEffect(() => {
    setPreferenceState(readStoredPreference());
  }, []);

  const setPreference = useCallback((nextPreference: ThemePreference) => {
    setPreferenceState(nextPreference);
    try {
      localStorage.setItem(STORAGE_KEY, nextPreference);
    } catch {
      // Ignore persistence failures; the in-memory setting still updates.
    }
  }, []);

  const isDark = preference === "dark" || (preference === "system" && systemScheme === "dark");
  const themeColors = isDark ? darkColors : lightColors;

  const value = useMemo<AppThemeContextValue>(
    () => ({
      colors: themeColors,
      isDark,
      preference,
      setPreference,
      shadows: createShadows(themeColors)
    }),
    [isDark, preference, setPreference, themeColors]
  );

  return <AppThemeContext.Provider value={value}>{children}</AppThemeContext.Provider>;
}

export function useAppTheme() {
  const context = useContext(AppThemeContext);
  if (!context) {
    throw new Error("useAppTheme must be used inside AppThemeProvider.");
  }
  return context;
}

export function useThemeColors() {
  return useAppTheme().colors;
}
