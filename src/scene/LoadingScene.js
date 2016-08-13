import BaseScene from './BaseScene';
import SceneRepository from '../repository/SceneRepository';
import ImageRepository from '../repository/ImageRepository';
import Conf from '../config/conf.json';

export default class LoadingScene extends BaseScene {
  initializeLoadingScene() {
    return this.initialize().then(() => {
      return this;
    });
  }

  start(status) {
    const image = ImageRepository.getLoaingImage();
    const sprite = new Sprite(image.width, image.height);
    sprite.x = 0;
    sprite.y = 0;
    sprite.image = image;
    SceneRepository.addEntityToCurrentScene(Conf.data.loading.image_path, sprite);
  }
}
