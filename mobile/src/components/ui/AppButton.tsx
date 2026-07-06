import { Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';
import { colors, radii, spacing, typography } from '../../theme';

type Variant = 'primary' | 'secondary' | 'ghost';

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  style?: ViewStyle;
}

/** Themed button with pressed/disabled states, replacing RN's platform `Button`. */
export default function AppButton({ label, onPress, variant = 'primary', disabled = false, style }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant].container,
        pressed && !disabled ? variantStyles[variant].pressed : null,
        disabled ? styles.disabled : null,
        style,
      ]}
    >
      <Text style={[styles.label, variantStyles[variant].label]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: radii.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { ...typography.subtitle, fontSize: 15 },
  disabled: { opacity: 0.45 },
});

const variantStyles: Record<Variant, { container: ViewStyle; pressed: ViewStyle; label: { color: string } }> = {
  primary: {
    container: { backgroundColor: colors.primary },
    pressed: { backgroundColor: colors.primaryPressed },
    label: { color: colors.onPrimary },
  },
  secondary: {
    container: { backgroundColor: colors.primarySoft },
    pressed: { backgroundColor: '#E0E4FB' },
    label: { color: colors.primaryDark },
  },
  ghost: {
    container: { backgroundColor: 'transparent' },
    pressed: { backgroundColor: colors.surfaceAlt },
    label: { color: colors.primary },
  },
};
