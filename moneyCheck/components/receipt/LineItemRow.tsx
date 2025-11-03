// Single line item display/edit row with product name, quantity, price
import { View, Text, TextInput, StyleSheet } from 'react-native';
import type { LineItem } from '@/lib/types';

interface LineItemRowProps {
  item: LineItem;
  editable?: boolean;
  onUpdate?: (item: LineItem) => void;
}

export function LineItemRow({ item, editable, onUpdate }: LineItemRowProps) {
  return null; // Implementation placeholder
}
