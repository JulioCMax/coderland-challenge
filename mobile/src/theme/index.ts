import { Platform, type TextStyle, type ViewStyle } from 'react-native';

/**
 * Single source of truth for the app's visual identity.
 *
 * The palette is built around the indigo the app already used (#3730A3 / #EEF2FF),
 * turned into a small Material-inspired tonal set. Every screen and component reads
 * from these tokens so the UI reads as one system instead of loose screens.
 */

export const colors = {
  // Brand (indigo)
  primary: '#4F46E5',
  primaryDark: '#3730A3',
  primaryPressed: '#4338CA',
  primarySoft: '#EEF2FF',
  onPrimary: '#FFFFFF',

  // Surfaces
  background: '#F4F5FB',
  surface: '#FFFFFF',
  surfaceAlt: '#F9FAFB',

  // Text
  text: '#171821',
  textMuted: '#6B7280',
  textFaint: '#9CA3AF',

  // Lines
  border: '#E5E7EB',

  // Semantic
  success: '#047857',
  successSoft: '#ECFDF5',
  danger: '#B91C1C',
  dangerSoft: '#FEF2F2',

  // Skeleton / placeholder
  skeleton: '#E7E9F2',
  skeletonHighlight: '#F2F3F9',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
} as const;

export const typography = {
  display: { fontSize: 28, fontWeight: '700', letterSpacing: -0.5, color: colors.text } satisfies TextStyle,
  title: { fontSize: 20, fontWeight: '700', color: colors.text } satisfies TextStyle,
  subtitle: { fontSize: 16, fontWeight: '600', color: colors.text } satisfies TextStyle,
  body: { fontSize: 15, fontWeight: '400', color: colors.text } satisfies TextStyle,
  bodyMuted: { fontSize: 15, fontWeight: '400', color: colors.textMuted } satisfies TextStyle,
  caption: { fontSize: 13, fontWeight: '400', color: colors.textMuted } satisfies TextStyle,
  overline: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.textMuted,
  } satisfies TextStyle,
} as const;

/**
 * Cross-platform elevation. iOS reads the shadow* props; Android reads `elevation`.
 */
export const shadows: Record<'sm' | 'md', ViewStyle> = {
  sm: Platform.select({
    ios: {
      shadowColor: '#0B1020',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
    },
    default: { elevation: 2 },
  })!,
  md: Platform.select({
    ios: {
      shadowColor: '#0B1020',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.1,
      shadowRadius: 14,
    },
    default: { elevation: 5 },
  })!,
};

export const theme = { colors, spacing, radii, typography, shadows } as const;
export default theme;
