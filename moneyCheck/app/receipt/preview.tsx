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
  const [isProcessing, setIsProcessing] = useState(false);

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
      // TODO: Process image with OCR
      // For now, just navigate to processing screen
      router.push({
        pathname: '/receipt/processing',
        params: { imageUri },
      });
    } catch (error) {
      console.error('Error processing image:', error);
      hapticError();
      showErrorToast('Failed to process image. Please try again.');
      setIsProcessing(false);
    }
  };

  if (!imageUri) {
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
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      <View style={styles.controls}>
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={20} color="#787774" />
          <Text style={styles.infoText}>
            Review the image and confirm to continue
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
});
