// Welcome screen - first-time user welcome and app introduction
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/common/Button';
import { Ionicons } from '@expo/vector-icons';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to moneyCheck</Text>
          <Text style={styles.subtitle}>
            Track your spending effortlessly by scanning receipts
          </Text>
        </View>

        <View style={styles.features}>
          <View style={styles.feature}>
            <View style={styles.iconContainer}>
              <Ionicons name="camera" size={24} color="#37352F" />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Scan Receipts</Text>
              <Text style={styles.featureDescription}>
                Quickly capture receipts with your camera
              </Text>
            </View>
          </View>

          <View style={styles.feature}>
            <View style={styles.iconContainer}>
              <Ionicons name="stats-chart" size={24} color="#37352F" />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Track Spending</Text>
              <Text style={styles.featureDescription}>
                View analytics and insights on your purchases
              </Text>
            </View>
          </View>

          <View style={styles.feature}>
            <View style={styles.iconContainer}>
              <Ionicons name="shield-checkmark" size={24} color="#37352F" />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Privacy First</Text>
              <Text style={styles.featureDescription}>
                All data stored locally on your device
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          <Button
            title="Get Started"
            onPress={() => router.replace('/(tabs)')}
          />
        </View>
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
    padding: 24,
  },
  header: {
    marginTop: 60,
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#37352F',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#787774',
    lineHeight: 24,
  },
  features: {
    gap: 24,
    marginBottom: 48,
  },
  feature: {
    flexDirection: 'row',
    gap: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E9E9E7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    flex: 1,
    justifyContent: 'center',
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#37352F',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  featureDescription: {
    fontSize: 14,
    color: '#787774',
    lineHeight: 20,
  },
  actions: {
    marginTop: 'auto',
    paddingBottom: 32,
  },
});
