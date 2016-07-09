import GameRepository from './GameRepository';

const loadedImagePathSets = new Set();

export default class ImageRepository {
  static setImage(imagePath) {
    GameRepository.get().load(imagePath, () => {
      loadedImagePathSets.add(imagePath);
    });
  }

  static isLoaded(imagePath) {
    return loadedImagePathSets.has(imagePath);
  }
}
