/**
 * Design tokens for Mutadawil.
 * Glass-metaphor palette with emerald / coral / gold semantic colors.
 */

export type ThemeMode = 'dark' | 'light';

export interface ThemePalette {
  mode: ThemeMode;
  bg: string;
  bgElevated: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  divider: string;
  overlay: string;
  text: string;
  textMuted: string;
  textSubtle: string;
  textInverse: string;
  primary: string;
  primarySoft: string;
  onPrimary: string;
  gain: string;
  gainSoft: string;
  loss: string;
  lossSoft: string;
  gold: string;
  goldSoft: string;
  info: string;
  infoSoft: string;
  buy: string;
  sell: string;
  shadow: string;
}

const darkPalette: ThemePalette = {
  mode: 'dark',
  bg: '#08101F',
  bgElevated: '#0F1A2E',
  surface: '#131F36',
  surfaceAlt: '#1A2942',
  border: '#22334F',
  divider: '#1B2A45',
  overlay: 'rgba(3, 8, 18, 0.72)',
  text: '#EAF0FA',
  textMuted: '#A6B2C8',
  textSubtle: '#7A8AA6',
  textInverse: '#08101F',
  primary: '#22D3A5',
  primarySoft: 'rgba(34, 211, 165, 0.14)',
  onPrimary: '#03130E',
  gain: '#22D3A5',
  gainSoft: 'rgba(34, 211, 165, 0.14)',
  loss: '#FF6B84',
  lossSoft: 'rgba(255, 107, 132, 0.14)',
  gold: '#F5C56A',
  goldSoft: 'rgba(245, 197, 106, 0.14)',
  info: '#5EA8FF',
  infoSoft: 'rgba(94, 168, 255, 0.14)',
  buy: '#22D3A5',
  sell: '#FF6B84',
  shadow: '#000000',
};

const lightPalette: ThemePalette = {
  mode: 'light',
  bg: '#F4F6FB',
  bgElevated: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceAlt: '#EEF2F9',
  border: '#DDE4EF',
  divider: '#E6EBF3',
  overlay: 'rgba(15, 23, 42, 0.35)',
  text: '#0E1B2E',
  textMuted: '#425067',
  textSubtle: '#6A7891',
  textInverse: '#FFFFFF',
  primary: '#0FB585',
  primarySoft: 'rgba(15, 181, 133, 0.14)',
  onPrimary: '#FFFFFF',
  gain: '#0FB585',
  gainSoft: 'rgba(15, 181, 133, 0.12)',
  loss: '#E23A5C',
  lossSoft: 'rgba(226, 58, 92, 0.12)',
  gold: '#C68A18',
  goldSoft: 'rgba(198, 138, 24, 0.12)',
  info: '#2F73E0',
  infoSoft: 'rgba(47, 115, 224, 0.12)',
  buy: '#0FB585',
  sell: '#E23A5C',
  shadow: '#0B1A33',
};

export const palettes: Record<ThemeMode, ThemePalette> = {
  dark: darkPalette,
  light: lightPalette,
};

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
};

export const radius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
  pill: 999,
};

export const font = {
  h1: 26,
  h2: 22,
  h3: 18,
  h4: 16,
  body: 15,
  caption: 13,
  micro: 11,
};

export const weight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const shadows = (palette: ThemePalette) => ({
  card: {
    shadowColor: palette.shadow,
    shadowOpacity: palette.mode === 'dark' ? 0.4 : 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  fab: {
    shadowColor: palette.primary,
    shadowOpacity: 0.4,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
});
