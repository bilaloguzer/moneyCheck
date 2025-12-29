// Empty State Component
// Shows friendly messages when there's no data

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export const EmptyState = ({
  icon = 'file-tray-outline',
  title,
  description,
  actionText,
  onAction,
  style,
}: EmptyStateProps) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={64} color="#C9CBCF" />
      </View>
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
      {actionText && onAction && (
        <Button
          title={actionText}
          onPress={onAction}
          containerStyle={styles.button}
        />
      )}
    </View>
  );
};

// Pre-built empty states for common scenarios
export const EmptyReceipts = ({ onAddReceipt }: { onAddReceipt: () => void }) => (
  <EmptyState
    icon="receipt-outline"
    title="No receipts yet"
    description="Start scanning receipts to track your spending"
    actionText="Scan Receipt"
    onAction={onAddReceipt}
  />
);

export const EmptySearchResults = () => (
  <EmptyState
    icon="search-outline"
    title="No results found"
    description="Try adjusting your search or filters"
  />
);

export const EmptyAnalytics = () => (
  <EmptyState
    icon="stats-chart-outline"
    title="No data for this period"
    description="Add some receipts to see your spending analytics"
  />
);

export const EmptyCategory = ({ categoryName }: { categoryName: string }) => (
  <EmptyState
    icon="pricetag-outline"
    title={`No items in ${categoryName}`}
    description="Items in this category will appear here"
  />
);

export const NetworkError = ({ onRetry }: { onRetry: () => void }) => (
  <EmptyState
    icon="cloud-offline-outline"
    title="Connection Error"
    description="Please check your internet connection and try again"
    actionText="Retry"
    onAction={onRetry}
  />
);

export const GenericError = ({ onRetry }: { onRetry?: () => void }) => (
  <EmptyState
    icon="alert-circle-outline"
    title="Something went wrong"
    description="An error occurred. Please try again"
    actionText={onRetry ? "Retry" : undefined}
    onAction={onRetry}
  />
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  iconContainer: {
    marginBottom: 24,
    opacity: 0.6,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#37352F',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    color: '#787774',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  button: {
    minWidth: 160,
  },
});
