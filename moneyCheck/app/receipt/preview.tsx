// Image preview screen - preview captured image before processing, option to retake or proceed
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/common/Button';
import { useState, useCallback } from 'react';
import { showErrorToast } from '@/lib/utils/toast';
import { hapticMedium, hapticError, hapticLight } from '@/lib/utils/haptics';

export default function ImagePreviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const imageUri = params.imageUri as string;
  const qrData = params.qrData as string;
  const source = (params.source as string) || 'photo';
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Parse QR data if available
  const parsedQRData = qrData ? JSON.parse(qrData) : null;

  // Reset processing state when screen comes back into focus
  useFocusEffect(
    useCallback(() => {
      setIsProcessing(false);
    }, [])
  );

  const handleRetake = () => {
    hapticLight();
    router.back();
  };

  const handleConfirm = async () => {
    setIsProcessing(true);
    hapticMedium();
    try {
      // Navigate to processing screen
      router.push({
        pathname: '/receipt/processing',
        params: { 
          imageUri,
          qrData,
          source,
        },
      });
    } catch (error) {
      console.error('Error processing image:', error);
      hapticError();
      showErrorToast('Failed to process image. Please try again.');
      setIsProcessing(false);
    }
  };

  if (!imageUri && !qrData) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color="#E03E3E" />
        <Text style={styles.errorText}>No image found</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.qrPlaceholder}>
            <Ionicons name="qr-code" size={80} color="#2C9364" />
            <Text style={styles.qrPlaceholderText}>QR Code Scanned</Text>
          </View>
        )}
        
        {/* Source Badge */}
        <View style={[styles.sourceBadge, source === 'qr' && styles.sourceBadgeQR]}>
          <Ionicons 
            name={source === 'qr' ? 'qr-code' : 'camera'} 
            size={14} 
            color="#FFFFFF" 
          />
          <Text style={styles.sourceBadgeText}>
            {source === 'qr' ? 'QR Code' : 'Photo'}
          </Text>
        </View>
      </View>

      <View style={styles.controls}>
        {/* QR Data Preview */}
        {parsedQRData && (
          <View style={styles.qrDataCard}>
            <Text style={styles.qrDataTitle}>Scanned Data:</Text>
            <Text style={styles.qrDataItem}>
              Store: {parsedQRData.merchant?.name || 'Unknown'}
            </Text>
            <Text style={styles.qrDataItem}>
              Total: ₺{parsedQRData.total?.value?.toFixed(2) || '0.00'}
            </Text>
            <Text style={styles.qrDataItem}>
              Date: {new Date(parsedQRData.date?.value).toLocaleDateString('tr-TR')}
            </Text>
          </View>
        )}
        
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={20} color="#787774" />
          <Text style={styles.infoText}>
            {source === 'qr' 
              ? 'QR code data extracted. Confirm to save receipt.'
              : 'Review the image and confirm to continue'
            }
          </Text>
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.retakeButton}
            onPress={handleRetake}
            activeOpacity={0.7}
          >
            <Ionicons name="camera-reverse" size={24} color="#37352F" />
            <Text style={styles.retakeText}>Retake</Text>
          </TouchableOpacity>

          <View style={styles.confirmButtonContainer}>
            <Button
              title={isProcessing ? 'Processing...' : 'Confirm & Process'}
              onPress={handleConfirm}
              disabled={isProcessing}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F6F3',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#F7F6F3',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#37352F',
    marginTop: 16,
  },
  imageContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  controls: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E9E9E7',
    paddingTop: 20,
    paddingBottom: 32,
    paddingHorizontal: 24,
    gap: 20,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F7F6F3',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E9E9E7',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#787774',
    lineHeight: 20,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  retakeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E9E9E7',
    backgroundColor: '#FFFFFF',
  },
  retakeText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#37352F',
  },
  confirmButtonContainer: {
    flex: 1,
  },
  qrPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  qrPlaceholderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C9364',
  },
  sourceBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(55, 53, 47, 0.9)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  sourceBadgeQR: {
    backgroundColor: 'rgba(44, 147, 100, 0.9)',
  },
  sourceBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  qrDataCard: {
    backgroundColor: '#F0F7F4',
    padding: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#B8E3CD',
    gap: 8,
  },
  qrDataTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C9364',
    marginBottom: 4,
  },
  qrDataItem: {
    fontSize: 14,
    color: '#37352F',
    lineHeight: 20,
  },
});
