// Settings screen - app settings, language, data management, export, account deletion
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';

export default function SettingsScreen() {
  const router = useRouter();
  const { signOut, user } = useAuth();

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
  dangerItem: {
    borderBottomWidth: 0,
  },
  dangerText: {
    color: '#E03E3E',
    fontWeight: '500',
  },
});
