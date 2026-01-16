// Camera-related type definitions
import type { CameraView as CameraViewType } from 'expo-camera';

export type FlashMode = 'off' | 'on' | 'auto';

export type PermissionStatus = 'granted' | 'denied' | 'undetermined';

export interface CaptureOptions {
  quality?: number;
  skipProcessing?: boolean;
  exif?: boolean;
}

export interface PickerOptions {
  allowsEditing?: boolean;
  quality?: number;
  mediaType?: 'images' | 'videos' | 'all';
}

export interface ImageResult {
  uri: string;
  width?: number;
  height?: number;
  cancelled: boolean;
}

export interface CameraPermissionState {
  granted: boolean;
  canAskAgain: boolean;
  status: PermissionStatus;
}

export interface MediaLibraryPermissionState {
  granted: boolean;
  canAskAgain: boolean;
  status: PermissionStatus;
}
