import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, shadows, spacing, typography } from '../theme';
import Avatar from './ui/Avatar';

interface Props {
  name: string;
  avatar?: string;
}

/** A person in the external listado: photo (or initials) leading, name alongside. */
export default function PersonRow({ name, avatar }: Props) {
  return (
    <View style={styles.row}>
      <Avatar name={name} uri={avatar} />
      <Text style={[typography.subtitle, styles.name]} numberOfLines={1}>
        {name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    ...shadows.sm,
  },
  name: { flexShrink: 1 },
});
