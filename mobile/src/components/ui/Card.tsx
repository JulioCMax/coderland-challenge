import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { colors, radii, shadows, spacing } from '../../theme';

interface Props {
  children: ReactNode;
  style?: ViewStyle | ViewStyle[];
}

/** Elevated white surface — the building block of the Material-inspired look. */
export default function Card({ children, style }: Props) {
  return <View style={[styles.card, styles.padded, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    ...shadows.sm,
  },
  padded: { padding: spacing.lg },
});
