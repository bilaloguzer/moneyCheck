// Loading spinner with optional message and overlay
import React from 'react';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'large';
  overlay?: boolean;
  color?: string;
}

export function LoadingSpinner({ message, size = 'large', overlay = false, color = '#37352F' }: LoadingSpinnerProps) {
  const containerStyles = [styles.container, overlay ? styles.overlayContainer : styles.inlineContainer];
  const textStyle = [styles.message, overlay ? styles.messageOverlay : styles.messageInline];

  return (
    <View style={containerStyles} pointerEvents={overlay ? 'auto' : 'none'}>
      <ActivityIndicator size={size} color={color} />
      {message ? <Text style={textStyle}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  inlineContainer: {
    padding: 8,
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(55, 53, 47, 0.4)',
    zIndex: 1000,
  },
  message: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  messageInline: {
    color: '#37352F',
  },
  messageOverlay: {
    color: '#FFFFFF',
  },
});
