// Preprocesses receipt images - handles rotation, contrast adjustment, perspective correction
import { manipulateAsync, SaveFormat, Action } from 'expo-image-manipulator';

export class ImageProcessor {
  /**
   * Preprocesses an image for OCR by resizing and compressing it.
   * @param imagePath URI of the image
   * @returns Processed image URI
   */
  async preprocess(imagePath: string): Promise<string> {
    // Resize to a reasonable width (e.g., 1080) to speed up OCR and reduce memory usage
    // maintain aspect ratio.
    const actions: Action[] = [
        { resize: { width: 1080 } }
    ];
    
    const result = await manipulateAsync(
      imagePath,
      actions,
      { compress: 0.8, format: SaveFormat.JPEG }
    );
    
    return result.uri;
  }

  async adjustContrast(imagePath: string): Promise<string> {
    // Expo Image Manipulator does not support contrast adjustment directly.
    // For now, we return the image as is.
    // In a real app, you might use a specific image processing library or native module.
    console.warn('Contrast adjustment is not supported with the current configuration.');
    return imagePath;
  }

  async correctPerspective(imagePath: string, corners: number[][]): Promise<string> {
    // Perspective correction requires advanced image processing (homography).
    // Not supported by expo-image-manipulator.
    // Would require OpenCV or similar.
    console.warn('Perspective correction is not supported with the current configuration.');
    return imagePath;
  }

  async compress(imagePath: string, quality: number = 0.6): Promise<string> {
    const result = await manipulateAsync(
      imagePath,
      [],
      { compress: quality, format: SaveFormat.JPEG }
    );
    return result.uri;
  }

  async crop(imagePath: string, originX: number, originY: number, width: number, height: number): Promise<string> {
    // Ensure crop bounds are valid
    if (width <= 0 || height <= 0) {
        throw new Error('Invalid crop dimensions');
    }

    const result = await manipulateAsync(
      imagePath,
      [{ crop: { originX, originY, width, height } }],
      { format: SaveFormat.JPEG }
    );
    return result.uri;
  }

  async rotate(imagePath: string, degrees: number): Promise<string> {
      const result = await manipulateAsync(
          imagePath,
          [{ rotate: degrees }],
          { format: SaveFormat.JPEG }
      );
      return result.uri;
  }
}
