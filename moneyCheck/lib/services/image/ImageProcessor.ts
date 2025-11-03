// Preprocesses receipt images - handles rotation, contrast adjustment, perspective correction

export class ImageProcessor {
  async preprocess(imagePath: string): Promise<string> {
    throw new Error('Not implemented');
  }

  async adjustContrast(imagePath: string): Promise<string> {
    throw new Error('Not implemented');
  }

  async correctPerspective(imagePath: string, corners: number[][]): Promise<string> {
    throw new Error('Not implemented');
  }
}
