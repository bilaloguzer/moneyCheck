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
    backgroundColor: '#F7F6F3',
  },
  header: {
    padding: 24,
    paddingTop: 32,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9E9E7',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#37352F',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#787774',
    lineHeight: 22,
  },
  scanButton: {
    backgroundColor: '#37352F',
    margin: 24,
    marginTop: 32,
    padding: 18,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#00000020',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  quickStats: {
    padding: 24,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#787774',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9E9E7',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#37352F',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#787774',
  },
  recentSection: {
    padding: 24,
  },
  emptyText: {
    textAlign: 'center',
    color: '#787774',
    fontSize: 14,
    marginTop: 32,
    lineHeight: 20,
  },
});
