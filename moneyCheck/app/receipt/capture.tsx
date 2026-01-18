// Receipt capture screen - camera with edge detection, capture button, gallery import
import { View, StyleSheet, Platform, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView } from '@/components/camera/CameraView';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { hapticMedium, hapticError, hapticSuccess } from '@/lib/utils/haptics';
import { ImagePreprocessingService } from '@/lib/services/image';
import { QRCodeService } from '@/lib/services/qr';
import { useState } from 'react';
import type { QRScanMode } from '@/lib/types';

// We need to dynamically import or handle the plugin safely because it might crash if not linked
let DocumentScanner: any;
try {
  DocumentScanner = require('react-native-document-scanner-plugin').default;
} catch (e) {
  console.warn('DocumentScanner plugin not found or failed to load', e);
}

type HybridStep = 'qr_pending' | 'qr_scanned' | 'photo_capture';

export default function ReceiptCaptureScreen() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [mode, setMode] = useState<QRScanMode>('qr'); // Start with QR in hybrid mode
  const [hybridStep, setHybridStep] = useState<HybridStep>('qr_pending');
  const [qrData, setQRData] = useState<any>(null);

  // Handle photo capture (either standalone or after QR in hybrid mode)
  const handlePhotoCapture = async (uri: string) => {
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
      // If we have QR data (hybrid mode) AND we're in qr_scanned state, include it
      // Otherwise treat as photo-only (handles gallery picks correctly)
      const isHybridMode = qrData && hybridStep === 'qr_scanned';
      
      router.push({
        pathname: '/receipt/preview',
        params: { 
          imageUri: result.uri,
          originalUri: result.originalUri,
          qrData: isHybridMode ? JSON.stringify(qrData) : undefined,
          source: isHybridMode ? 'hybrid' : 'photo',
        },
      });
    } catch (error) {
      console.error('Preprocessing error:', error);
      hapticError();
      showErrorToast('Failed to process image');
      
      // Fallback: navigate with original image
      const isHybridMode = qrData && hybridStep === 'qr_scanned';
      
      router.push({
        pathname: '/receipt/preview',
        params: { 
          imageUri: uri,
          qrData: isHybridMode ? JSON.stringify(qrData) : undefined,
          source: isHybridMode ? 'hybrid' : 'photo',
        },
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle QR code scanning in hybrid mode
  const handleQRScannedInHybrid = async (qrString: string) => {
    hapticSuccess();
    setIsProcessing(true);
    
    try {
      console.log('Processing QR code...');
      
      // Process QR code through our service
      const result = await QRCodeService.processQRCode(qrString);
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to parse QR code');
      }
      
      console.log('QR parsed successfully:', {
        merchant: result.data.merchantName || result.data.merchantTitle,
        total: result.data.totalAmount,
      });
      
      // Store QR data and transition to photo capture
      setQRData(result.data);
      setHybridStep('qr_scanned');
      setMode('photo'); // Switch to photo mode
      
      showSuccessToast('✓ QR Scanned! Now take a photo of the receipt');
    } catch (error) {
      console.error('QR processing error:', error);
      hapticError();
      showErrorToast(error instanceof Error ? error.message : 'Failed to process QR code');
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
      <CameraView 
        onCapture={handlePhotoCapture} 
        onQRScanned={handleQRScannedInHybrid}
        mode={mode}
        ratio="4:3" 
      />
      
      {/* Hybrid Status Indicator */}
      {hybridStep === 'qr_scanned' && !isProcessing && (
        <View style={styles.hybridStatusBadge}>
          <Ionicons name="checkmark-circle" size={20} color="#2C9364" />
          <Text style={styles.hybridStatusText}>QR ✓ | Now take photo</Text>
        </View>
      )}
      
      {/* Skip QR Button (visible when waiting for QR) */}
      {hybridStep === 'qr_pending' && mode === 'qr' && !isProcessing && (
        <TouchableOpacity 
          style={styles.skipQRButton} 
          onPress={() => {
            setHybridStep('photo_capture');
            setMode('photo');
            hapticMedium();
            showSuccessToast('Switched to photo-only mode');
          }}
        >
          <Ionicons name="camera" size={20} color="white" />
          <Text style={styles.skipQRText}>Skip QR - Use Photo Only</Text>
        </TouchableOpacity>
      )}
      
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
  },
  modeToggleButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  modeToggleText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  hybridStatusBadge: {
    position: 'absolute',
    top: 120,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  hybridStatusText: {
    backgroundColor: 'rgba(44, 147, 100, 0.95)',
    color: 'white',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    fontWeight: '600',
    fontSize: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    overflow: 'hidden',
  },
  skipQRButton: {
    position: 'absolute',
    bottom: 140,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    zIndex: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  skipQRText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 15,
  },
});
