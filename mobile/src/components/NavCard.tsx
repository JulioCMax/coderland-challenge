import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, shadows, spacing, typography } from '../theme';

interface Props {
  title: string;
  subtitle: string;
  /** Single-letter monogram shown in the leading tile (no icon dependency). */
  monogram: string;
  tone: string;
  onPress: () => void;
}

/** Tappable navigation row used on Home: monogram tile + title/subtitle + chevron. */
export default function NavCard({ title, subtitle, monogram, tone, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed ? styles.pressed : null]}
    >
      <View style={[styles.tile, { backgroundColor: tone }]}>
        <Text style={styles.monogram}>{monogram}</Text>
      </View>
      <View style={styles.body}>
        <Text style={typography.subtitle}>{title}</Text>
        <Text style={[typography.caption, styles.subtitle]}>{subtitle}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.lg,
    ...shadows.sm,
  },
  pressed: { backgroundColor: colors.surfaceAlt, transform: [{ scale: 0.99 }] },
  tile: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monogram: { color: colors.onPrimary, fontSize: 20, fontWeight: '700' },
  body: { flex: 1, gap: 2 },
  subtitle: { color: colors.textMuted },
  chevron: { color: colors.textFaint, fontSize: 26, fontWeight: '300', marginLeft: spacing.xs },
});
