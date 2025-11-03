// Bar/line chart for spending over time
import { View, StyleSheet } from 'react-native';
import type { SpendingTrend } from '@/lib/types';

interface SpendingChartProps {
  data: SpendingTrend[];
  type?: 'line' | 'bar';
}

export function SpendingChart({ data, type = 'bar' }: SpendingChartProps) {
  return null; // Implementation placeholder
}
