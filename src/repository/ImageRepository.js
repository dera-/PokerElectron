import GameRepository from './GameRepository';
import FileUtil from '../util/FileUtil';
import Conf from '../config/conf.json';

const loadedImagePathSets = new Set();
const IMAGE_DIRECTORY_PATH = Conf.main.image_dir + '/';

export default class ImageRepository {
  static setImage(imagePath) {
    GameRepository.get().load(IMAGE_DIRECTORY_PATH + imagePath, () => {
      loadedImagePathSets.add(imagePath);
    });
  }

  static getImage(imagePath) {
    const game = GameRepository.get();
    return game.assets[IMAGE_DIRECTORY_PATH + imagePath];
  }

  static isLoaded(imagePath) {
    return loadedImagePathSets.has(imagePath);
  }

  static getImageNames(dir) {
    return FileUtil.getFileNameList(IMAGE_DIRECTORY_PATH + dir);
  }
}
