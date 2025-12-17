// Single line item display/edit row with product name, quantity, price
import { View, Text, TextInput, StyleSheet } from 'react-native';
import type { LineItem } from '@/lib/types';

interface LineItemRowProps {
  item: LineItem;
  editable?: boolean;
  onUpdate?: (item: LineItem) => void;
}

export function LineItemRow({ item, editable, onUpdate }: LineItemRowProps) {
  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <Text style={styles.productName}>{item.productName}</Text>
        <View style={styles.details}>
          <Text style={styles.detailText}>
            Qty: {item.quantity} × ₺{item.unitPrice.toFixed(2)}
          </Text>
          {item.category && (
            <Text style={styles.category}>{item.category}</Text>
          )}
        </View>
      </View>
      <Text style={styles.totalPrice}>₺{item.totalPrice.toFixed(2)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E9E9E7',
    backgroundColor: '#FFFFFF',
  },
  leftSection: {
    flex: 1,
    marginRight: 16,
  },
  productName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#37352F',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    color: '#787774',
    fontWeight: '400',
  },
  category: {
    fontSize: 12,
    color: '#9B9A97',
    backgroundColor: '#F7F6F3',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 3,
  },
  totalPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: '#37352F',
    letterSpacing: -0.2,
  },
});
