// useCamera Hook - Manage camera state and operations
import { useState, useEffect, useRef, RefObject } from 'react';
import type { CameraView as CameraViewType } from 'expo-camera';
import { CameraService } from '@/lib/services/camera';
import type { FlashMode, PermissionStatus } from '@/lib/types/camera.types';
import { hapticSuccess, hapticError, hapticLight } from '@/lib/utils/haptics';
import { showErrorToast } from '@/lib/utils/toast';

export interface UseCameraOptions {
  autoRequestPermission?: boolean;
  initialFlashMode?: FlashMode;
  initialZoom?: number;
}

export interface UseCameraReturn {
  // Permission States
  hasPermission: boolean;
  permissionStatus: PermissionStatus;
  requestPermission: () => Promise<void>;
  
  // Camera States
  isReady: boolean;
  flashMode: FlashMode;
  zoom: number;
  
  // Actions
  setFlashMode: (mode: FlashMode) => void;
  toggleFlash: () => void;
  increaseZoom: (step?: number) => void;
  decreaseZoom: (step?: number) => void;
  resetZoom: () => void;
  setZoom: (level: number) => void;
  
  // Capture
  captureImage: (cameraRef: RefObject<CameraViewType | null>) => Promise<string | null>;
  pickFromGallery: () => Promise<string | null>;
  
  // Loading/Error States
  isCapturing: boolean;
  error: string | null;
  clearError: () => void;
}

export function useCamera(options: UseCameraOptions = {}): UseCameraReturn {
  const {
    autoRequestPermission = true,
    initialFlashMode = 'off',
    initialZoom = 0,
  } = options;

  // Permission states
  const [hasPermission, setHasPermission] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>('undetermined');

  // Camera states
  const [isReady, setIsReady] = useState(false);
  const [flashMode, setFlashMode] = useState<FlashMode>(initialFlashMode);
  const [zoom, setZoomState] = useState(initialZoom);

  // Loading/Error states
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize camera permissions
  useEffect(() => {
    const initPermissions = async () => {
      const status = await CameraService.getCameraPermissionStatus();
      setHasPermission(status.granted);
      setPermissionStatus(status.status);

      if (autoRequestPermission && !status.granted && status.canAskAgain) {
        await requestPermission();
      }
    };

    initPermissions();
  }, [autoRequestPermission]);

  /**
   * Request camera permission
   */
  const requestPermission = async () => {
    try {
      const status = await CameraService.requestCameraPermission();
      setHasPermission(status.granted);
      setPermissionStatus(status.status);

      if (!status.granted) {
        setError('Camera permission denied. Please enable it in settings.');
        hapticError();
      }
    } catch (err) {
      console.error('Permission request error:', err);
      setError('Failed to request camera permission');
      hapticError();
    }
  };

  /**
   * Toggle flash mode (off -> on -> auto -> off)
   */
  const toggleFlash = () => {
    hapticLight();
    const newMode = CameraService.cycleFlashMode(flashMode);
    setFlashMode(newMode);
  };

  /**
   * Increase zoom level
   */
  const increaseZoom = (step: number = 0.05) => {
    setZoomState((prev) => CameraService.normalizeZoomLevel(prev + step));
  };

  /**
   * Decrease zoom level
   */
  const decreaseZoom = (step: number = 0.05) => {
    setZoomState((prev) => CameraService.normalizeZoomLevel(prev - step));
  };

  /**
   * Reset zoom to 0
   */
  const resetZoom = () => {
    setZoomState(0);
  };

  /**
   * Set zoom level directly
   */
  const setZoom = (level: number) => {
    setZoomState(CameraService.normalizeZoomLevel(level));
  };

  /**
   * Capture image from camera
   */
  const captureImage = async (
    cameraRef: RefObject<CameraViewType | null>
  ): Promise<string | null> => {
    if (!cameraRef.current || isCapturing) {
      return null;
    }

    setIsCapturing(true);
    setError(null);

    try {
      const captureOptions = CameraService.getCaptureOptions(0.85);
      const photo = await cameraRef.current.takePictureAsync(captureOptions);

      if (!photo || !photo.uri) {
        throw new Error('Failed to capture photo');
      }

      hapticSuccess();
      return photo.uri;
    } catch (err) {
      console.error('Capture error:', err);
      const errorMessage = 'Failed to capture photo. Please try again.';
      setError(errorMessage);
      showErrorToast(errorMessage);
      hapticError();
      return null;
    } finally {
      setIsCapturing(false);
    }
  };

  /**
   * Pick image from gallery
   */
  const pickFromGallery = async (): Promise<string | null> => {
    setError(null);

    try {
      // Request media library permission
      const permStatus = await CameraService.requestMediaLibraryPermission();
      
      if (!permStatus.granted) {
        const errorMessage = 'Please allow access to your photo library.';
        setError(errorMessage);
        showErrorToast(errorMessage);
        hapticError();
        return null;
      }

      // Pick image
      const result = await CameraService.pickImageFromGallery({
        allowsEditing: false,
        quality: 0.85,
      });

      if (result.cancelled || !result.uri) {
        return null;
      }

      hapticSuccess();
      return result.uri;
    } catch (err) {
      console.error('Gallery picker error:', err);
      const errorMessage = 'Failed to open gallery. Please try again.';
      setError(errorMessage);
      showErrorToast(errorMessage);
      hapticError();
      return null;
    }
  };

  /**
   * Clear error state
   */
  const clearError = () => {
    setError(null);
  };

  return {
    // Permission States
    hasPermission,
    permissionStatus,
    requestPermission,
    
    // Camera States
    isReady,
    flashMode,
    zoom,
    
    // Actions
    setFlashMode,
    toggleFlash,
    increaseZoom,
    decreaseZoom,
    resetZoom,
    setZoom,
    
    // Capture
    captureImage,
    pickFromGallery,
    
    // Loading/Error States
    isCapturing,
    error,
    clearError,
  };
}
