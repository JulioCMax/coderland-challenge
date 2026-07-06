import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, type DimensionValue, type ViewStyle } from 'react-native';
import { colors, radii } from '../../theme';

interface Props {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  style?: ViewStyle;
}

/**
 * Pulsing placeholder block for loading states. Animates opacity on the native
 * driver and stops on unmount, so it never leaks timers into the test runner.
 */
export default function Skeleton({ width = '100%', height = 16, radius = radii.sm, style }: Props) {
  const opacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.5, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.block, { width, height, borderRadius: radius, opacity }, style]}
    />
  );
}

const styles = StyleSheet.create({
  block: { backgroundColor: colors.skeleton },
});
