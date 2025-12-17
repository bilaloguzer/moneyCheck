// History screen - list of all receipts with search and filter options
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function HistoryScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emptyText}>No receipts yet</Text>
        <Text style={styles.emptySubtext}>
          Your scanned receipts will appear here
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F6F3',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#37352F',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#787774',
    lineHeight: 20,
  },
});
