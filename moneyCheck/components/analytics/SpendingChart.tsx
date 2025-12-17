// Bar/line chart for spending over time
import { View, Text, StyleSheet } from 'react-native';
import type { SpendingTrend } from '@/lib/types';

interface SpendingChartProps {
  data: SpendingTrend[];
  type?: 'line' | 'bar';
}

export function SpendingChart({ data, type = 'bar' }: SpendingChartProps) {
  // Placeholder implementation with Notion styling
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Spending Over Time</Text>
      <View style={styles.chartPlaceholder}>
        <Text style={styles.placeholderText}>
          Chart visualization will appear here
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E9E9E7',
    padding: 20,
    shadowColor: '#00000015',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#787774',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  chartPlaceholder: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F6F3',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E9E9E7',
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontSize: 14,
    color: '#9B9A97',
    fontWeight: '400',
  },
});
