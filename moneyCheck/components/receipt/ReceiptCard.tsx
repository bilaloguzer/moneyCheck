// Receipt list item card - shows merchant, date, total, thumbnail
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import type { Receipt } from '@/lib/types';

interface ReceiptCardProps {
  receipt: Receipt;
  onPress: () => void;
}

export function ReceiptCard({ receipt, onPress }: ReceiptCardProps) {
  const date = new Date(receipt.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.textContent}>
          <Text style={styles.merchantName}>{receipt.merchantName}</Text>
          <Text style={styles.date}>{date}</Text>
        </View>
        <Text style={styles.total}>₺{receipt.total.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E9E9E7',
    marginBottom: 8,
    shadowColor: '#00000015',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  textContent: {
    flex: 1,
  },
  merchantName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#37352F',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  date: {
    fontSize: 13,
    color: '#787774',
    fontWeight: '400',
  },
  total: {
    fontSize: 16,
    fontWeight: '600',
    color: '#37352F',
    marginLeft: 16,
    letterSpacing: -0.2,
  },
});
