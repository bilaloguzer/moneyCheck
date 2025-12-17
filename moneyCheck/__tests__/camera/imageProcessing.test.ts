import { ImageProcessor } from '../../lib/services/image/ImageProcessor';
import * as ImageManipulator from 'expo-image-manipulator';

// Mock expo-image-manipulator
jest.mock('expo-image-manipulator', () => ({
  manipulateAsync: jest.fn(),
  SaveFormat: { JPEG: 'jpeg', PNG: 'png' },
}));

describe('ImageProcessor', () => {
  let processor: ImageProcessor;

  beforeEach(() => {
    processor = new ImageProcessor();
    jest.clearAllMocks();
  });

  describe('preprocess', () => {
    it('should resize and compress the image', async () => {
      const mockResult = { uri: 'processed-image.jpg', width: 1080, height: 1920 };
      (ImageManipulator.manipulateAsync as jest.Mock).mockResolvedValue(mockResult);

      const result = await processor.preprocess('original-image.jpg');

      expect(ImageManipulator.manipulateAsync).toHaveBeenCalledWith(
        'original-image.jpg',
        [{ resize: { width: 1080 } }],
        { compress: 0.8, format: 'jpeg' }
      );
      expect(result).toBe('processed-image.jpg');
    });
  });

  describe('compress', () => {
    it('should compress the image with default quality', async () => {
      const mockResult = { uri: 'compressed-image.jpg' };
      (ImageManipulator.manipulateAsync as jest.Mock).mockResolvedValue(mockResult);

      const result = await processor.compress('original-image.jpg');

      expect(ImageManipulator.manipulateAsync).toHaveBeenCalledWith(
        'original-image.jpg',
        [],
        { compress: 0.6, format: 'jpeg' }
      );
      expect(result).toBe('compressed-image.jpg');
    });

    it('should compress the image with specified quality', async () => {
        const mockResult = { uri: 'compressed-image.jpg' };
        (ImageManipulator.manipulateAsync as jest.Mock).mockResolvedValue(mockResult);
  
        const result = await processor.compress('original-image.jpg', 0.5);
  
        expect(ImageManipulator.manipulateAsync).toHaveBeenCalledWith(
          'original-image.jpg',
          [],
          { compress: 0.5, format: 'jpeg' }
        );
        expect(result).toBe('compressed-image.jpg');
      });
  });

  describe('crop', () => {
      it('should crop the image with given dimensions', async () => {
          const mockResult = { uri: 'cropped.jpg' };
          (ImageManipulator.manipulateAsync as jest.Mock).mockResolvedValue(mockResult);

          const result = await processor.crop('original.jpg', 10, 10, 100, 100);

          expect(ImageManipulator.manipulateAsync).toHaveBeenCalledWith(
              'original.jpg',
              [{ crop: { originX: 10, originY: 10, width: 100, height: 100 } }],
              { format: 'jpeg' }
          );
          expect(result).toBe('cropped.jpg');
      });

      it('should throw error for invalid dimensions', async () => {
        await expect(processor.crop('original.jpg', 0, 0, 0, 100)).rejects.toThrow('Invalid crop dimensions');
      });
  });

  describe('rotate', () => {
      it('should rotate the image', async () => {
        const mockResult = { uri: 'rotated.jpg' };
        (ImageManipulator.manipulateAsync as jest.Mock).mockResolvedValue(mockResult);

        const result = await processor.rotate('original.jpg', 90);

        expect(ImageManipulator.manipulateAsync).toHaveBeenCalledWith(
            'original.jpg',
            [{ rotate: 90 }],
            { format: 'jpeg' }
        );
        expect(result).toBe('rotated.jpg');
      });
  });
});


