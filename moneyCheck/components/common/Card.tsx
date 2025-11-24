// Reusable card container component
import React from 'react';
import { View, Pressable, StyleSheet, Platform } from 'react-native';
import type { PropsWithChildren } from 'react';
import type { ViewStyle } from 'react-native';

interface CardProps extends PropsWithChildren {
  style?: ViewStyle;
  elevated?: boolean;
  padding?: number;
  onPress?: () => void;
  accessibilityLabel?: string;
}

export function Card({ children, style, elevated = true, padding = 12, onPress, accessibilityLabel }: CardProps) {
  const Container: any = onPress ? Pressable : View;

  const containerProps = onPress
    ? { onPress, accessibilityRole: 'button' as const, accessibilityLabel }
    : { accessibilityLabel };

  return (
    <Container style={[styles.base, elevated ? styles.elevated : null, { padding }, style]} {...containerProps}>
      {children}
    </Container>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    backgroundColor: '#ffffff',
  },
  elevated: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
    },
    android: {
      elevation: 2,
    },
    default: {},
  }),
});
