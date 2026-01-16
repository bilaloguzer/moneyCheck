// Receipt capture screen - camera with edge detection, capture button, gallery import
import { View, StyleSheet, Platform, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView } from '@/components/camera/CameraView';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { showErrorToast } from '@/lib/utils/toast';
import { hapticMedium, hapticError } from '@/lib/utils/haptics';
import { ImagePreprocessingService } from '@/lib/services/image';
import { useState } from 'react';

// We need to dynamically import or handle the plugin safely because it might crash if not linked
let DocumentScanner: any;
try {
  DocumentScanner = require('react-native-document-scanner-plugin').default;
} catch (e) {
  console.warn('DocumentScanner plugin not found or failed to load', e);
}

export default function ReceiptCaptureScreen() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCapture = async (uri: string) => {
    hapticMedium();
    setIsProcessing(true);

    try {
      console.log('Starting image preprocessing...');
      
      // Apply preprocessing to enhance the image for OCR
      const result = await ImagePreprocessingService.preprocessReceiptImage(uri, {
        autoCrop: false, // Disable for now as we don't have full edge detection
        enhanceContrast: true,
        adjustBrightness: true,
        sharpen: true,
        correctPerspective: false,
        reduceNoise: false,
        quality: 0.9,
      });

      console.log('Preprocessing complete:', {
        operations: result.appliedOperations,
        time: result.processingTimeMs,
      });

      // Navigate to preview with preprocessed image
      router.push({
        pathname: '/receipt/preview',
        params: { 
          imageUri: result.uri,
          originalUri: result.originalUri,
        },
      });
    } catch (error) {
      console.error('Preprocessing error:', error);
      hapticError();
      showErrorToast('Failed to process image');
      
      // Fallback: navigate with original image
      router.push({
        pathname: '/receipt/preview',
        params: { imageUri: uri },
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const scanDocument = async () => {
    if (!DocumentScanner) {
        hapticError();
        showErrorToast('Document Scanner module is not available. Please rebuild the app.');
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
        console.error('Document scanner error', error);
        hapticError();
        showErrorToast('Failed to scan document');
    }
  };

  return (
    <View style={styles.container}>
      <CameraView onCapture={handleCapture} ratio="4:3" />
      
      {/* Processing Overlay */}
      {isProcessing && (
        <View style={styles.processingOverlay}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.processingText}>Enhancing image...</Text>
        </View>
      )}
      
      {/* Optional: Add a floating button to trigger system document scanner if preferred */}
      {DocumentScanner && !isProcessing && (
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
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    gap: 16,
  },
  processingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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
