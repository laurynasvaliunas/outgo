export const fontFamilies = {
  sans: "PlusJakartaSans_400Regular",
  medium: "PlusJakartaSans_500Medium",
  semiBold: "PlusJakartaSans_600SemiBold",
  bold: "PlusJakartaSans_700Bold",
  extraBold: "PlusJakartaSans_800ExtraBold"
};

export const colors = {
  primary50: "#E8EAFB",
  primary100: "#D5D9F5",
  primary200: "#ADB4EB",
  primary300: "#7D87DD",
  primary400: "#5866D1",
  primary500: "#3A4BBF",
  primary600: "#2E3CA0",
  primary700: "#243080",
  primary800: "#1A2363",
  primary900: "#111650",
  amber300: "#FCD39A",
  amber400: "#F9B95A",
  amber500: "#F5A023",
  teal300: "#58B98A",
  teal400: "#4FB4AE",
  teal500: "#00897B",
  background: "#F7F6F2",
  backgroundElevated: "#FEFEFC",
  surface: "#FEFEFC",
  surfaceMuted: "#EEECEA",
  surfacePressed: "#F2F0EA",
  border: "#E2E0DB",
  borderStrong: "#C9C5BC",
  text: "#1E1C18",
  textMuted: "#5C5850",
  textSubtle: "#9B978F",
  muted: "#9B978F",
  danger: "#E85D5D",
  dangerSoft: "#FCE7E7",
  warning: "#F5A023",
  warningSoft: "#FEF2DC",
  success: "#4CAF7D",
  successSoft: "#E3F4EC",
  info: "#3A4BBF",
  infoSoft: "#E8EAFB",
  mapPin: "#3A4BBF",
  shadow: "#111650",
  white: "#FFFFFF",
  black: "#000000",
  darkBg: "#12111A",
  darkCard: "#1E1D28",
  darkSurface: "#282739",
  darkBorder: "#33324A",
  darkText: "#F0EFF8",
  darkTextSub: "#B9B6CA",
  darkMuted: "#7F7B95",
  primary: "#3A4BBF",
  primaryDark: "#111650",
  primarySoft: "#E8EAFB",
  primarySofter: "#F1F2FD",
  accent: "#F5A023",
  accentSoft: "#FEF2DC",
  blue: "#3A4BBF",
  blueSoft: "#E8EAFB",
  lavender: "#5866D1",
  lavenderSoft: "#E8EAFB"
};

export const categoryColors = {
  coffee: "#C97B4B",
  walk: "#5B8C6A",
  study: "#6B7FD4",
  sport: "#E85D5D",
  board_games: "#9B59B6",
  language_exchange: "#00897B",
  food: "#E07B39",
  culture: "#C0392B",
  volunteering: "#27AE60",
  no_phone: "#5C5850",
  other: "#3A4BBF"
} as const;

export const categoryEmojis = {
  coffee: "☕",
  walk: "🚶",
  study: "📚",
  sport: "⚡",
  board_games: "🎲",
  language_exchange: "💬",
  food: "🍜",
  culture: "🎨",
  volunteering: "🤝",
  no_phone: "📵",
  other: "✨"
} as const;

export const spacing = {
  xxs: 2,
  xs: 4,
  s: 6,
  sm: 8,
  ms: 10,
  md: 12,
  ml: 14,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  giant: 48,
  jumbo: 56,
  mega: 64
};

export const radii = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999
};

export const typography = {
  tiny: 11,
  xs: 11,
  small: 13,
  body: 15,
  md: 17,
  subheading: 20,
  heading: 24,
  title: 30,
  hero: 38
};

export const lineHeights = {
  tiny: 15,
  small: 18,
  body: 22,
  md: 24,
  subheading: 28,
  heading: 32,
  title: 38,
  hero: 46
};

export const shadows = {
  soft: {
    shadowColor: colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3
  },
  medium: {
    shadowColor: colors.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5
  },
  large: {
    shadowColor: colors.shadow,
    shadowOpacity: 0.16,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 16 },
    elevation: 8
  },
  pin: {
    shadowColor: colors.primary500,
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8
  }
};

export const textStyles = {
  tiny: {
    fontFamily: fontFamilies.bold,
    fontSize: typography.tiny,
    lineHeight: lineHeights.tiny,
    letterSpacing: 0.2
  },
  small: {
    fontFamily: fontFamilies.semiBold,
    fontSize: typography.small,
    lineHeight: lineHeights.small,
    letterSpacing: 0
  },
  body: {
    fontFamily: fontFamilies.sans,
    fontSize: typography.body,
    lineHeight: lineHeights.body,
    letterSpacing: 0
  },
  md: {
    fontFamily: fontFamilies.medium,
    fontSize: typography.md,
    lineHeight: lineHeights.md,
    letterSpacing: 0
  },
  subheading: {
    fontFamily: fontFamilies.bold,
    fontSize: typography.subheading,
    lineHeight: lineHeights.subheading,
    letterSpacing: 0
  },
  heading: {
    fontFamily: fontFamilies.extraBold,
    fontSize: typography.heading,
    lineHeight: lineHeights.heading,
    letterSpacing: 0
  },
  title: {
    fontFamily: fontFamilies.extraBold,
    fontSize: typography.title,
    lineHeight: lineHeights.title,
    letterSpacing: 0
  },
  hero: {
    fontFamily: fontFamilies.extraBold,
    fontSize: typography.hero,
    lineHeight: lineHeights.hero,
    letterSpacing: 0
  }
};
