// Data management screen - manage user data (export, delete, view storage usage)
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/common/Button';
import { useState } from 'react';
import { ExportService } from '@/lib/services/export/ExportService';
import { SupabaseReceiptService } from '@/lib/services/SupabaseReceiptService';
import { useRouter } from 'expo-router';

export default function DataManagementScreen() {
  const router = useRouter();
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const { error } = await ExportService.exportToCSV();
      if (error) throw error;
      // Success export opens share sheet directly, no alert needed normally, 
      // but let's confirm if not obvious
    } catch (error: any) {
      if (error.message !== 'Sharing not available on this device') {
        Alert.alert('Export Failed', error.message || 'Unknown error');
      } else {
         Alert.alert('Error', 'Sharing is not available on this device');
      }
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAll = () => {
    Alert.alert(
      'Delete All Data',
      'Are you absolutely sure? This will permanently delete ALL your receipts. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              const { error } = await SupabaseReceiptService.deleteAllData();
              if (error) throw error;
              Alert.alert('Success', 'All your data has been deleted.');
              router.replace('/(tabs)/history');
            } catch (error: any) {
              Alert.alert('Delete Failed', error.message || 'Unknown error');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>EXPORT DATA</Text>
        <TouchableOpacity 
          style={styles.option} 
          onPress={handleExport}
          disabled={exporting}
        >
          <View style={styles.optionLeft}>
            <Ionicons name="download-outline" size={22} color="#787774" />
            <View style={styles.optionText}>
              <Text style={styles.optionTitle}>Export as CSV</Text>
              <Text style={styles.optionDescription}>
                Download all your receipt data
              </Text>
            </View>
          </View>
          {exporting ? (
             <ActivityIndicator size="small" color="#37352F" />
          ) : (
             <Ionicons name="chevron-forward" size={20} color="#9B9A97" />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>STORAGE</Text>
        <View style={styles.option}>
          <View style={styles.optionLeft}>
            <Ionicons name="folder-outline" size={22} color="#787774" />
            <View style={styles.optionText}>
              <Text style={styles.optionTitle}>Storage Used</Text>
              <Text style={styles.optionDescription}>Calculated on export</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.dangerSection}>
        <Text style={styles.sectionTitle}>DANGER ZONE</Text>
        <View style={styles.dangerCard}>
          <Text style={styles.dangerTitle}>Delete All Data</Text>
          <Text style={styles.dangerDescription}>
            This will permanently delete all your receipts and cannot be undone.
          </Text>
          <Button
            title={deleting ? "Deleting..." : "Delete All Data"}
            variant="danger"
            onPress={handleDeleteAll}
            disabled={deleting}
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
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E9E9E7',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 15,
    color: '#37352F',
    fontWeight: '500',
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  optionDescription: {
    fontSize: 13,
    color: '#787774',
    lineHeight: 18,
  },
  dangerSection: {
    marginTop: 32,
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  dangerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E9E9E7',
    padding: 20,
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E03E3E',
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  dangerDescription: {
    fontSize: 14,
    color: '#787774',
    lineHeight: 20,
    marginBottom: 16,
  },
});
