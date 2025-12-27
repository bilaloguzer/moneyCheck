// Receipt capture screen - camera with edge detection, capture button, gallery import
import { View, StyleSheet, Platform, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView } from '@/components/camera/CameraView';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';

// We need to dynamically import or handle the plugin safely because it might crash if not linked
let DocumentScanner: any;
try {
  DocumentScanner = require('react-native-document-scanner-plugin').default;
} catch (e) {
  console.warn('DocumentScanner plugin not found or failed to load', e);
}

export default function ReceiptCaptureScreen() {
  const router = useRouter();

  const handleCapture = (uri: string) => {
    router.push({
      pathname: '/receipt/preview',
      params: { imageUri: uri },
    });
  };
  
  const scanDocument = async () => {
    if (!DocumentScanner) {
        alert("Document Scanner module is not available. Please rebuild the app.");
        return;
    }
    try {
      const { scannedImages } = await DocumentScanner.scanDocument({
        maxNumDocuments: 1
      });
      if (scannedImages && scannedImages.length > 0) {
        handleCapture(scannedImages[0]);
      }
    } catch (error) {
        console.error("Document scanner error", error);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView onCapture={handleCapture} ratio="4:3" />
      
      {/* Optional: Add a floating button to trigger system document scanner if preferred */}
      {DocumentScanner && (
        <TouchableOpacity style={styles.scannerButton} onPress={scanDocument}>
          <Ionicons name="scan" size={24} color="white" />
          <Text style={styles.scannerText}>Auto-Crop Scan</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scannerButton: {
      position: 'absolute',
      top: 60,
      right: 20,
      backgroundColor: 'rgba(0,0,0,0.6)',
      padding: 10,
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      zIndex: 10
  },
  scannerText: {
      color: 'white',
      fontWeight: '600'
  }
});
