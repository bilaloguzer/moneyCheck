// Camera Service - Centralized camera utilities and permission handling
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import type {
  FlashMode,
  PermissionStatus,
  CaptureOptions,
  PickerOptions,
  ImageResult,
  CameraPermissionState,
  MediaLibraryPermissionState,
} from '@/lib/types/camera.types';

export class CameraService {
  /**
   * Request camera permission from user
   */
  static async requestCameraPermission(): Promise<CameraPermissionState> {
    try {
      const { status, canAskAgain, granted } = await Camera.requestCameraPermissionsAsync();
      return {
        granted,
        canAskAgain,
        status: this.mapPermissionStatus(status),
      };
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      return {
        granted: false,
        canAskAgain: false,
        status: 'denied',
      };
    }
  }

  /**
   * Get current camera permission status
   */
  static async getCameraPermissionStatus(): Promise<CameraPermissionState> {
    try {
      const { status, canAskAgain, granted } = await Camera.getCameraPermissionsAsync();
      return {
        granted,
        canAskAgain,
        status: this.mapPermissionStatus(status),
      };
    } catch (error) {
      console.error('Error getting camera permission status:', error);
      return {
        granted: false,
        canAskAgain: false,
        status: 'undetermined',
      };
    }
  }

  /**
   * Request media library permission
   */
  static async requestMediaLibraryPermission(): Promise<MediaLibraryPermissionState> {
    try {
      const { status, canAskAgain, granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      return {
        granted,
        canAskAgain,
        status: this.mapPermissionStatus(status),
      };
    } catch (error) {
      console.error('Error requesting media library permission:', error);
      return {
        granted: false,
        canAskAgain: false,
        status: 'denied',
      };
    }
  }

  /**
   * Get current media library permission status
   */
  static async getMediaLibraryPermissionStatus(): Promise<MediaLibraryPermissionState> {
    try {
      const { status, canAskAgain, granted } = await ImagePicker.getMediaLibraryPermissionsAsync();
      return {
        granted,
        canAskAgain,
        status: this.mapPermissionStatus(status),
      };
    } catch (error) {
      console.error('Error getting media library permission status:', error);
      return {
        granted: false,
        canAskAgain: false,
        status: 'undetermined',
      };
    }
  }

  /**
   * Validate and normalize flash mode
   */
  static validateFlashMode(mode: string): FlashMode {
    if (mode === 'on' || mode === 'off' || mode === 'auto') {
      return mode;
    }
    return 'off';
  }

  /**
   * Normalize zoom level to be within valid range [0, 1]
   */
  static normalizeZoomLevel(zoom: number): number {
    return Math.max(0, Math.min(1, zoom));
  }

  /**
   * Get default capture options
   */
  static getCaptureOptions(quality: number = 0.85): CaptureOptions {
    return {
      quality,
      skipProcessing: false,
      exif: true,
    };
  }

  /**
   * Pick an image from the gallery
   */
  static async pickImageFromGallery(options?: PickerOptions): Promise<ImageResult> {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: options?.allowsEditing ?? false,
        quality: options?.quality ?? 0.85,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return {
          uri: '',
          cancelled: true,
        };
      }

      const asset = result.assets[0];
      return {
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
        cancelled: false,
      };
    } catch (error) {
      console.error('Error picking image from gallery:', error);
      return {
        uri: '',
        cancelled: true,
      };
    }
  }

  /**
   * Cycle flash mode: off -> on -> auto -> off
   */
  static cycleFlashMode(current: FlashMode): FlashMode {
    if (current === 'off') return 'on';
    if (current === 'on') return 'auto';
    return 'off';
  }

  /**
   * Map expo permission status to our PermissionStatus type
   */
  private static mapPermissionStatus(status: string): PermissionStatus {
    if (status === 'granted') return 'granted';
    if (status === 'denied') return 'denied';
    return 'undetermined';
  }
}
