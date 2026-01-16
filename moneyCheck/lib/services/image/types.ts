// Image preprocessing type definitions

export interface Bounds {
  topLeft: { x: number; y: number };
  topRight: { x: number; y: number };
  bottomLeft: { x: number; y: number };
  bottomRight: { x: number; y: number };
}

export interface PreprocessingOptions {
  autoCrop?: boolean;           // Auto-detect and crop to receipt
  enhanceContrast?: boolean;    // Increase contrast
  adjustBrightness?: boolean;   // Auto-adjust brightness
  sharpen?: boolean;            // Enhance sharpness
  correctPerspective?: boolean; // Fix skewed images
  reduceNoise?: boolean;        // Remove noise
  quality?: number;             //Output quality (0-1)
}

export interface PreprocessedImageResult {
  uri: string;
  originalUri: string;
  appliedOperations: string[];
  processingTimeMs: number;
  bounds?: Bounds;
}

export interface ImageManipulationAction {
  resize?: {
    width?: number;
    height?: number;
  };
  crop?: {
    originX: number;
    originY: number;
    width: number;
    height: number;
  };
}
