// Skeleton Loader Component
// Shows loading placeholders while content is loading

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton = ({ width = '100%', height = 20, borderRadius = 4, style }: SkeletonProps) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width: width as any,
          height: height as any,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
};

// Pre-built skeleton components for common use cases
export const SkeletonReceiptCard = () => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Skeleton width={40} height={40} borderRadius={20} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Skeleton width="70%" height={16} style={{ marginBottom: 8 }} />
        <Skeleton width="50%" height={14} />
      </View>
      <Skeleton width={60} height={20} borderRadius={10} />
    </View>
  </View>
);

export const SkeletonAnalyticsCard = () => (
  <View style={styles.card}>
    <Skeleton width="40%" height={18} style={{ marginBottom: 16 }} />
    <Skeleton width="100%" height={200} borderRadius={8} style={{ marginBottom: 12 }} />
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Skeleton width="30%" height={14} />
      <Skeleton width="20%" height={14} />
    </View>
  </View>
);

export const SkeletonItemRow = () => (
  <View style={styles.itemRow}>
    <Skeleton width={10} height={10} borderRadius={5} />
    <View style={{ flex: 1, marginLeft: 12 }}>
      <Skeleton width="80%" height={15} style={{ marginBottom: 6 }} />
      <Skeleton width="50%" height={12} />
    </View>
    <Skeleton width={60} height={16} />
  </View>
);

export const SkeletonList = ({ count = 3 }: { count?: number }) => (
  <View>
    {Array.from({ length: count }).map((_, index) => (
      <SkeletonReceiptCard key={index} />
    ))}
  </View>
);

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E1E1E1',
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E9E9E7',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 8,
  },
});
