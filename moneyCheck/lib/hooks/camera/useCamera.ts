import { useState, useCallback, useRef } from 'react';
import { CameraView, CameraType, FlashMode, useCameraPermissions } from 'expo-camera';

export interface UseCameraResult {
  cameraRef: React.RefObject<CameraView>;
  permission: boolean | null;
  requestPermission: () => Promise<boolean>;
  type: CameraType;
  setType: (type: CameraType) => void;
  flash: FlashMode;
  setFlash: (mode: FlashMode) => void;
  takePicture: () => Promise<string | null>;
  isReady: boolean;
}

export function useCamera(): UseCameraResult {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [type, setType] = useState<CameraType>('back');
  const [flash, setFlash] = useState<FlashMode>('off');
  const [isReady, setIsReady] = useState(false);

  // Wrapper for requestPermission that returns boolean directly
  const handleRequestPermission = useCallback(async () => {
    const result = await requestPermission();
    return result.granted;
  }, [requestPermission]);

  const takePicture = useCallback(async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          skipProcessing: false, // Set to true if speed is critical
        });
        return photo?.uri || null;
      } catch (error) {
        console.error('Failed to take picture:', error);
        return null;
      }
    }
    return null;
  }, []);

  return {
    cameraRef,
    permission: permission?.granted ?? null,
    requestPermission: handleRequestPermission,
    type,
    setType,
    flash,
    setFlash,
    takePicture,
    isReady: true, // Camera view is ready to be mounted if permissions allow
  };
}
