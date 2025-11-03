// Home screen - main dashboard with recent receipts, quick stats, capture button
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to moneyCheck</Text>
        <Text style={styles.subtitle}>Scan receipts and track your spending</Text>
      </View>

      <TouchableOpacity
        style={styles.scanButton}
        onPress={() => router.push('/receipt/capture')}
      >
        <Ionicons name="camera" size={32} color="#fff" />
        <Text style={styles.scanButtonText}>Scan Receipt</Text>
      </TouchableOpacity>

      <View style={styles.quickStats}>
        <Text style={styles.sectionTitle}>Quick Stats</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Receipts</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>₺0.00</Text>
            <Text style={styles.statLabel}>This Month</Text>
          </View>
        </View>
      </View>

      <View style={styles.recentSection}>
        <Text style={styles.sectionTitle}>Recent Receipts</Text>
        <Text style={styles.emptyText}>No receipts yet. Scan your first receipt!</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  scanButton: {
    backgroundColor: '#2563EB',
    margin: 24,
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  quickStats: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2563EB',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  recentSection: {
    padding: 24,
  },
  emptyText: {
    textAlign: 'center',
    color: '#64748B',
    fontSize: 14,
    marginTop: 32,
  },
});
