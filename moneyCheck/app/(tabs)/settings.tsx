// Settings screen - app settings, language, data management, export, account deletion
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { SupabasePriceService } from '@/lib/services/price';

export default function SettingsScreen() {
  const router = useRouter();
  const { signOut, user } = useAuth();
  const [sharePriceData, setSharePriceData] = useState(false);
  const [loadingPreference, setLoadingPreference] = useState(true);

  // Load user preference on mount
  useEffect(() => {
    loadUserPreference();
  }, []);

  const loadUserPreference = async () => {
    try {
      const preference = await SupabasePriceService.getUserPreference();
      setSharePriceData(preference);
    } catch (error) {
      console.error('Error loading preference:', error);
    } finally {
      setLoadingPreference(false);
    }
  };

  const handleTogglePriceSharing = async (value: boolean) => {
    try {
      setSharePriceData(value);
      await SupabasePriceService.setUserPreference(value);
      
      if (value) {
        Alert.alert(
          'Price Sharing Enabled',
          'Your anonymized price data will help others find better deals. Product names are hashed for privacy.',
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      console.error('Error updating preference:', error);
      setSharePriceData(!value); // Revert on error
      Alert.alert('Error', error.message || 'Failed to update preference');
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              // Navigation will be handled automatically by auth state change
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to logout');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      {/* Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        {user && (
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="person" size={24} color="#64748B" />
              <Text style={styles.settingText}>Email</Text>
            </View>
            <Text style={styles.settingValue}>{user.email}</Text>
          </View>
        )}
        <TouchableOpacity
          style={[styles.settingItem, styles.dangerItem]}
          onPress={handleLogout}
        >
          <View style={styles.settingLeft}>
            <Ionicons name="log-out-outline" size={24} color="#E03E3E" />
            <Text style={[styles.settingText, styles.dangerText]}>Logout</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#E03E3E" />
        </TouchableOpacity>
      </View>

      {/* Privacy & Sharing Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy & Sharing</Text>
        <View style={styles.toggleContainer}>
          <View style={styles.toggleContent}>
            <Ionicons name="shield-checkmark" size={24} color="#2C9364" />
            <View style={styles.toggleTextContainer}>
              <Text style={styles.settingText}>Share Price Data</Text>
              <Text style={styles.settingDescription}>
                Help others find better deals
              </Text>
            </View>
          </View>
          {loadingPreference ? (
            <ActivityIndicator size="small" color="#787774" />
          ) : (
            <Switch
              value={sharePriceData}
              onValueChange={handleTogglePriceSharing}
              trackColor={{ false: '#E9E9E7', true: '#2C936440' }}
              thumbColor={sharePriceData ? '#2C9364' : '#787774'}
            />
          )}
        </View>
        <View style={styles.privacyNote}>
          <Ionicons name="information-circle-outline" size={16} color="#787774" />
          <Text style={styles.privacyNoteText}>
            Product names are hashed for privacy. No personal data is shared.
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data</Text>
        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => router.push('/settings/data-management')}
        >
          <View style={styles.settingLeft}>
            <Ionicons name="folder" size={24} color="#64748B" />
            <Text style={styles.settingText}>Data Management</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#64748B" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.settingItem}>
          <Text style={styles.settingText}>Version</Text>
          <Text style={styles.settingValue}>1.0.0</Text>
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
  header: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9E9E7',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#37352F',
    letterSpacing: -0.5,
  },
  section: {
    marginTop: 24,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E9E9E7',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#787774',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E9E9E7',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E9E9E7',
  },
  toggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 12,
  },
  toggleTextContainer: {
    flex: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingText: {
    fontSize: 15,
    color: '#37352F',
    fontWeight: '400',
  },
  settingValue: {
    fontSize: 15,
    color: '#787774',
  },
  settingDescription: {
    fontSize: 12,
    color: '#787774',
    marginTop: 4,
    lineHeight: 16,
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
  },
  privacyNoteText: {
    flex: 1,
    fontSize: 11,
    color: '#787774',
    lineHeight: 16,
  },
  dangerItem: {
    borderBottomWidth: 0,
  },
  dangerText: {
    color: '#E03E3E',
    fontWeight: '500',
  },
});
