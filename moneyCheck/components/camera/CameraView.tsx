// Camera viewport with enhanced UI overlay and capture controls
import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { CameraView as ExpoCamera, CameraType, FlashMode as ExpoFlashMode } from 'expo-camera';
import type { CameraView as CameraViewType } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCamera } from '@/hooks/useCamera';
import type { FlashMode } from '@/lib/types/camera.types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalization } from '@/contexts/LocalizationContext';

interface CameraViewProps {
  onCapture: (uri: string) => void;
  onCancel?: () => void;
  ratio?: string;
}

export function CameraView({ onCapture, onCancel, ratio = '16:9' }: CameraViewProps) {
  const cameraRef = useRef<CameraViewType | null>(null);
  const router = useRouter();
  const { t } = useLocalization();
  const [isReady, setIsReady] = useState(false);
  const insets = useSafeAreaInsets();

  const {
    hasPermission,
    permissionStatus,
    requestPermission,
    flashMode,
    toggleFlash,
    zoom,
    increaseZoom,
    decreaseZoom,
    captureImage,
    pickFromGallery,
    isCapturing,
  } = useCamera({
    autoRequestPermission: true,
    initialFlashMode: 'off',
    initialZoom: 0,
  });

  const handleZoomIn = () => {
    increaseZoom(0.05);
  };

  const handleZoomOut = () => {
    decreaseZoom(0.05);
  };

  const takePicture = async () => {
    const uri = await captureImage(cameraRef);
    if (uri) {
      onCapture(uri);
    }
  };

  const handleGalleryPick = async () => {
    const uri = await pickFromGallery();
    if (uri) {
      // Gallery picks should always use photo mode, not QR mode
      onCapture(uri);
    }
  };

  const getFlashIcon = (): any => {
    if (flashMode === 'off') return 'flash-off';
    if (flashMode === 'on') return 'flash';
    return 'flash-outline';
  };

  if (permissionStatus === 'undetermined') {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View style={styles.center}>
        <Text style={styles.permissionText}>{t('camera.permissionRequired')}</Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>{t('camera.grantPermission')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getExpoFlashMode = (): ExpoFlashMode => {
    if (flashMode === 'on') return 'on';
    if (flashMode === 'auto') return 'auto';
    return 'off';
  };

  return (
    <View style={styles.container}>
      <ExpoCamera
        ref={cameraRef}
        style={styles.camera}
        facing="back"
        flash={getExpoFlashMode()}
        onCameraReady={() => setIsReady(true)}
        zoom={zoom}
      >
        {/* Top Controls Bar */}
        <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
          {/* Cancel Button */}
          {onCancel && (
            <TouchableOpacity 
              onPress={onCancel} 
              style={[styles.cancelButton, { top: insets.top + 12 }]}
            >
              <Ionicons name="close" size={28} color="white" />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[styles.flashButton, { top: insets.top + 12 }]}
            onPress={toggleFlash}
            activeOpacity={0.7}
          >
            <Ionicons name={getFlashIcon()} size={26} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.overlay} pointerEvents="none">
          <View style={styles.frameContainer}>
            <View style={styles.frame}>
              <View style={[styles.corner, styles.cornerTopLeft]} />
              <View style={[styles.corner, styles.cornerTopRight]} />
              <View style={[styles.corner, styles.cornerBottomLeft]} />
              <View style={[styles.corner, styles.cornerBottomRight]} />
            </View>
            <Text style={styles.instructionText}>
              {t('camera.positionReceipt')}
            </Text>
          </View>
        </View>

        {/* Bottom Controls Bar */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.sideButton}
            onPress={handleGalleryPick}
            activeOpacity={0.7}
          >
            <Ionicons name="images" size={28} color="#FFFFFF" />
            <Text style={styles.sideButtonText}>{t('camera.gallery')}</Text>
          </TouchableOpacity>

          <View style={styles.captureContainer}>
            <TouchableOpacity
              style={[
                styles.captureButton,
                (!isReady || isCapturing) && styles.captureButtonDisabled
              ]}
              onPress={takePicture}
              disabled={!isReady || isCapturing}
              activeOpacity={0.8}
            >
              {isCapturing ? (
                <ActivityIndicator size="large" color="#FFFFFF" />
              ) : (
                <View style={styles.innerCircle} />
              )}
            </TouchableOpacity>
            {isReady && (
              <Text style={styles.captureHint}>{t('camera.tapToCapture')}</Text>
            )}
          </View>

          <View style={styles.sideButton}>
            <TouchableOpacity onPress={handleZoomIn} activeOpacity={0.7} style={styles.zoomButton}>
              <Ionicons name="add-circle-outline" size={28} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.sideButtonText}>{(zoom * 100).toFixed(0)}</Text>
            <TouchableOpacity onPress={handleZoomOut} activeOpacity={0.7} style={styles.zoomButton}>
              <Ionicons name="remove-circle-outline" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </ExpoCamera>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: '#000',
  },
  camera: { 
    flex: 1,
  },
  center: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: '#000',
    padding: 24,
  },
  permissionText: { 
    color: '#FFFFFF', 
    fontSize: 15,
    paddingHorizontal: 24, 
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  permissionButton: {
    backgroundColor: '#37352F',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E9E9E7',
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
  },
  
  // Top Bar
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  topButton: { // This style is no longer used for the top buttons, but kept for reference if needed elsewhere.
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(55, 53, 47, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },

  // Center Overlay
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frameContainer: {
    alignItems: 'center',
  },
  frame: {
    width: 320,
    height: 420,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: '#FFFFFF',
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 6,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 6,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 6,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 6,
  },
  instructionText: {
    marginTop: 24,
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '500',
    textAlign: 'center',
    backgroundColor: 'rgba(55, 53, 47, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    overflow: 'hidden',
  },

  // Bottom Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  sideButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    gap: 6,
  },
  sideButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  captureContainer: {
    alignItems: 'center',
    gap: 8,
  },
  captureButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  innerCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
  },
  captureHint: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '500',
    textAlign: 'center',
  },
  zoomButton: {
    padding: 4,
  },
  
  // Top Bar Buttons
  backButton: {
    padding: 12,
    backgroundColor: 'rgba(55, 53, 47, 0.7)',
    borderRadius: 22,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    padding: 12,
    position: 'absolute',
    left: 20, // Align with paddingHorizontal of topBar
    zIndex: 1,
    backgroundColor: 'rgba(55, 53, 47, 0.7)',
    borderRadius: 22,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flashButton: {
    padding: 12,
    position: 'absolute',
    right: 20, // Align with paddingHorizontal of topBar on the right
    zIndex: 1,
    backgroundColor: 'rgba(55, 53, 47, 0.7)',
    borderRadius: 22,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // QR Mode Styles
  qrFrame: {
    width: 280,
    height: 280,
  },
  cornerDetected: {
    borderColor: '#2C9364', // Green when QR detected
  },
});
