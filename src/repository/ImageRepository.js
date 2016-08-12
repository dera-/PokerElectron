import GameRepository from './GameRepository';
import Conf from '../config/conf.json';

const loadedImagePathSets = new Set();
const IMAGE_DIRECTORY_PATH = 'image/';

export default class ImageRepository {
  static getImageWithPromise(imagePath) {
    const game = GameRepository.get();
    if (!loadedImagePathSets.has(imagePath)) {
      return new Promise((resolve, reject)=>{
        game.load(IMAGE_DIRECTORY_PATH + imagePath, () => {
          loadedImagePathSets.add(imagePath);
          resolve(imagePath);
        });
      }).then((path)=>{
        return game.assets[IMAGE_DIRECTORY_PATH + path];
      });
    } else {
      return Promise.resolve(game.assets[IMAGE_DIRECTORY_PATH + imagePath]);
    }
  }

  static getImage(imagePath) {
    if (loadedImagePathSets.has(imagePath)) {
      return GameRepository.get().assets[IMAGE_DIRECTORY_PATH + imagePath];
    }
    return null;
  }

  static getLoaingImage() {
    return GameRepository.get().assets[Conf.data.loading.image_path];
  }
}
