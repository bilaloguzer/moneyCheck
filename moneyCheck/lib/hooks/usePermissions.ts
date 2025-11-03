// Hook for requesting and checking app permissions (camera, storage)
import { useState, useCallback } from 'react';
import { Camera } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';

export function usePermissions() {
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const [mediaLibraryPermission, setMediaLibraryPermission] = useState<boolean | null>(null);

  const requestCameraPermission = useCallback(async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setCameraPermission(status === 'granted');
    return status === 'granted';
  }, []);

  const requestMediaLibraryPermission = useCallback(async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    setMediaLibraryPermission(status === 'granted');
    return status === 'granted';
  }, []);

  return {
    cameraPermission,
    mediaLibraryPermission,
    requestCameraPermission,
    requestMediaLibraryPermission,
  };
}
