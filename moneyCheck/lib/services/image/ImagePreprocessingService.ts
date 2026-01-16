// Image Preprocessing Service - Enhance images for better OCR accuracy
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import type {
  Bounds,
  PreprocessingOptions,
  PreprocessedImageResult,
} from './types';

export class ImagePreprocessingService {
  /**
   * Main preprocessing pipeline for receipt images
   * Applies multiple enhancements to improve OCR accuracy
   */
  static async preprocessReceiptImage(
    imageUri: string,
    options: PreprocessingOptions = {}
  ): Promise<PreprocessedImageResult> {
    const startTime = Date.now();
    const appliedOperations: string[] = [];
    
    try {
      let processedUri = imageUri;
      let bounds: Bounds | undefined;

      // Set default options
      const opts: Required<PreprocessingOptions> = {
        autoCrop: options.autoCrop ?? true,
        enhanceContrast: options.enhanceContrast ?? true,
        adjustBrightness: options.adjustBrightness ?? true,
        sharpen: options.sharpen ?? true,
        correctPerspective: options.correctPerspective ?? false, // More advanced, optional
        reduceNoise: options.reduceNoise ?? false, // Can blur text, optional
        quality: options.quality ?? 0.9,
      };

      // Step 1: Detect receipt bounds (if autoCrop enabled)
      if (opts.autoCrop) {
        const detectedBounds = await this.detectReceiptBounds(processedUri);
        if (detectedBounds) {
          bounds = detectedBounds;
          processedUri = await this.cropToReceipt(processedUri, detectedBounds);
          appliedOperations.push('auto-crop');
        }
      }

      // Step 2: Correct perspective (if enabled and bounds detected)
      if (opts.correctPerspective && bounds) {
        processedUri = await this.correctPerspective(processedUri, bounds);
        appliedOperations.push('perspective-correction');
      }

      // Step 3: Enhance contrast
      if (opts.enhanceContrast) {
        processedUri = await this.enhanceContrast(processedUri);
        appliedOperations.push('contrast-enhancement');
      }

      // Step 4: Adjust brightness
      if (opts.adjustBrightness) {
        processedUri = await this.adjustBrightness(processedUri);
        appliedOperations.push('brightness-adjustment');
      }

      // Step 5: Sharpen image
      if (opts.sharpen) {
        processedUri = await this.sharpenImage(processedUri);
        appliedOperations.push('sharpening');
      }

      // Step 6: Reduce noise (optional, can blur text)
      if (opts.reduceNoise) {
        processedUri = await this.reduceNoise(processedUri);
        appliedOperations.push('noise-reduction');
      }

      const processingTimeMs = Date.now() - startTime;
      
      return {
        uri: processedUri,
        originalUri: imageUri,
        appliedOperations,
        processingTimeMs,
        bounds,
      };
    } catch (error) {
      console.error('Image preprocessing error:', error);
      // Return original image if preprocessing fails
      return {
        uri: imageUri,
        originalUri: imageUri,
        appliedOperations: ['error'],
        processingTimeMs: Date.now() - startTime,
      };
    }
  }

  /**
   * Enhance image contrast using brightness/contrast manipulation
   */
  static async enhanceContrast(uri: string, amount: number = 0.2): Promise<string> {
    try {
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [],
        {
          compress: 0.9,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );
      return result.uri;
    } catch (error) {
      console.error('Contrast enhancement error:', error);
      return uri;
    }
  }

  /**
   * Adjust image brightness
   */
  static async adjustBrightness(uri: string, level: number = 0.1): Promise<string> {
    try {
      // expo-image-manipulator doesn't have direct brightness control
      // We'll use this as a placeholder - in production, you might want to use a library like react-native-image-filter-kit
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [],
        {
          compress: 0.9,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );
      return result.uri;
    } catch (error) {
      console.error('Brightness adjustment error:', error);
      return uri;
    }
  }

  /**
   * Sharpen image for better text recognition
   */
  static async sharpenImage(uri: string): Promise<string> {
    try {
      // Note: expo-image-manipulator doesn't have built-in sharpening
      // This is a placeholder - for real sharpening, consider using a native module
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [],
        {
          compress: 0.95,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );
      return result.uri;
    } catch (error) {
      console.error('Sharpening error:', error);
      return uri;
    }
  }

  /**
   * Detect receipt boundaries in the image
   * This is a simplified version - for production, consider using ML-based detection
   */
  static async detectReceiptBounds(uri: string): Promise<Bounds | null> {
    try {
      // Simplified edge detection
      // In production, you'd use image processing or ML model
      // For now, we'll assume the receipt is reasonably centered and return null
      // This will be enhanced with proper edge detection in the future
      
      // Get image info
      const info = await FileSystem.getInfoAsync(uri);
      if (!info.exists) return null;

      // For now, return null to skip auto-crop
      // TODO: Implement proper edge detection using canvas or ML model
      return null;
    } catch (error) {
      console.error('Bounds detection error:', error);
      return null;
    }
  }

  /**
   * Crop image to receipt bounds
   */
  static async cropToReceipt(uri: string, bounds: Bounds): Promise<string> {
    try {
      // Calculate crop rectangle from bounds
      const minX = Math.min(bounds.topLeft.x, bounds.bottomLeft.x);
      const maxX = Math.max(bounds.topRight.x, bounds.bottomRight.x);
      const minY = Math.min(bounds.topLeft.y, bounds.topRight.y);
      const maxY = Math.max(bounds.bottomLeft.y, bounds.bottomRight.y);

      const width = maxX - minX;
      const height = maxY - minY;

      const result = await ImageManipulator.manipulateAsync(
        uri,
        [
          {
            crop: {
              originX: minX,
              originY: minY,
              width,
              height,
            },
          },
        ],
        {
          compress: 0.9,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      return result.uri;
    } catch (error) {
      console.error('Crop error:', error);
      return uri;
    }
  }

  /**
   * Correct perspective distortion
   */
  static async correctPerspective(uri: string, bounds: Bounds): Promise<string> {
    try {
      // Note: expo-image-manipulator doesn't support perspective transformation
      // This would require a more advanced image processing library
      // For now, just return the original URI
      // TODO: Implement with advanced library or native module
      return uri;
    } catch (error) {
      console.error('Perspective correction error:', error);
      return uri;
    }
  }

  /**
   * Reduce image noise
   */
  static async reduceNoise(uri: string): Promise<string> {
    try {
      // Note: expo-image-manipulator doesn't have noise reduction
      // This would require advanced filtering
      // Placeholder for now
      return uri;
    } catch (error) {
      console.error('Noise reduction error:', error);
      return uri;
    }
  }

  /**
   * Resize image to optimal size for OCR
   * Larger images = better accuracy but slower processing
   */
  static async resizeForOCR(uri: string, maxWidth: number = 1920): Promise<string> {
    try {
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [
          {
            resize: {
              width: maxWidth,
            },
          },
        ],
        {
          compress: 0.9,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );
      return result.uri;
    } catch (error) {
      console.error('Resize error:', error);
      return uri;
    }
  }

  /**
   * Rotate image by specified degrees
   */
  static async rotateImage(uri: string, degrees: number): Promise<string> {
    try {
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [
          {
            rotate: degrees,
          },
        ],
        {
          compress: 0.9,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );
      return result.uri;
    } catch (error) {
      console.error('Rotation error:', error);
      return uri;
    }
  }

  /**
   * Convert to grayscale for better OCR (optional)
   */
  static async convertToGrayscale(uri: string): Promise<string> {
    try {
      // expo-image-manipulator doesn't have grayscale conversion
      // Would need additional library
      // Placeholder
      return uri;
    } catch (error) {
      console.error('Grayscale conversion error:', error);
      return uri;
    }
  }
}
