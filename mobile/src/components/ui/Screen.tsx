import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { colors, spacing } from '../../theme';

interface Props {
  children: ReactNode;
  /** When true the content scrolls; use for short, static screens. Lists bring their own scrolling. */
  scroll?: boolean;
  contentStyle?: ViewStyle;
}

/**
 * App-wide page wrapper: paints the neutral background and applies the standard
 * gutters. The native-stack header already handles the top safe area.
 */
export default function Screen({ children, scroll = false, contentStyle }: Props) {
  if (scroll) {
    return (
      <ScrollView
        style={styles.root}
        contentContainerStyle={[styles.scrollContent, styles.gutters, contentStyle]}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    );
  }

  return <View style={[styles.root, styles.flexContent, styles.gutters, contentStyle]}>{children}</View>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  flexContent: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingVertical: spacing.xl },
  gutters: { paddingHorizontal: spacing.xl },
});
