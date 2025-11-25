// Camera viewport with simple edge detection overlay and capture control
import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Camera } from 'expo-camera';

interface CameraViewProps {
  onCapture: (uri: string) => void;
  ratio?: string;
}

interface CameraInstance {
  takePictureAsync: (options?: any) => Promise<{ uri: string }>;
}

export function CameraView({ onCapture, ratio = '16:9' }: CameraViewProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isReady, setIsReady] = useState(false);
  const cameraRef = useRef<CameraInstance | null>(null);

  // expo-camera's exported value can confuse TS in some setups; use a local any-typed alias for JSX
  const ExpoCameraComponent: any = Camera;

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const takePicture = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8, skipProcessing: true });
      onCapture(photo.uri);
    } catch (err) {
      console.warn('takePicture error', err);
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.center}>
        <Text style={styles.permissionText}>Camera permission is required. Please enable it in settings.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ExpoCameraComponent
        ref={cameraRef}
        style={styles.camera}
        ratio={ratio}
        onCameraReady={() => setIsReady(true)}
      >
        <View style={styles.overlay} pointerEvents="none">
          <View style={styles.frame} />
        </View>

        <View style={styles.controls} pointerEvents="box-none">
          <TouchableOpacity
            style={[styles.captureButton, !isReady && styles.captureButtonDisabled]}
            onPress={takePicture}
            disabled={!isReady}
          >
            <View style={styles.innerCircle} />
          </TouchableOpacity>
        </View>
      </ExpoCameraComponent>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  permissionText: { color: '#fff', paddingHorizontal: 20, textAlign: 'center' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frame: {
    width: '86%',
    height: '60%',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.9)',
    borderRadius: 8,
  },
  controls: {
    position: 'absolute',
    bottom: 28,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  captureButtonDisabled: {
    opacity: 0.6,
  },
  innerCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
  },
});
