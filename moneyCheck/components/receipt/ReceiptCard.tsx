// Receipt list item card - shows merchant, date, total, thumbnail
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import type { Receipt } from '@/lib/types';

interface ReceiptCardProps {
  receipt: Receipt;
  onPress: () => void;
}

export function ReceiptCard({ receipt, onPress }: ReceiptCardProps) {
  return null; // Implementation placeholder
}
