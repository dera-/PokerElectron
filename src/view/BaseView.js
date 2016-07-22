import Conf from '../config/conf.json';
import BaseAction from '../const/BaseAction';
import SpriteFactory from '../../factory/SpriteFactory';
import ImageRepository from '../../repository/ImageRepository';

// viewクラスのインターフェース的なサムシング
export default class BaseView {
  constructor(imagesData) {
    this.sprites = this.generateSprites(imagesData);
    this.visibleSpriteKeys = this.getVisibleSpriteKeys(imagesData);
    this.currentAction = BaseAction.ACTION_NONE;
  }

  getSprite(key) {
    return this.sprites[key];
  }

  getAllSpirites() {
    return Object.keys(this.sprites).map(key => this.sprites[key]);
  }

  generateSprites(imagesData) {
    const sprites = {};
    imagesData.forEach(data => {
      if ('image_dir' in data) {
        ImageRepository.getImageNames(data.image_dir).forEach(fileName => {
          sprites[data.name + '_' + fileName] = SpriteFactory.generate(
            Conf.main.width * data.x,
            Conf.main.height * data.y,
            Conf.main.width * data.width,
            Conf.main.width * data.height,
            data.image_dir + '/' + fileName
          );
        });
      } else if ('image_path' in data) {
        sprites[data.name] = SpriteFactory.generate(
          Conf.main.width * data.x,
          Conf.main.height * data.y,
          Conf.main.width * data.width,
          Conf.main.width * data.height,
          data.image_path
        );
      }
      return sprites;
    });
  }

  getVisibleSpriteKeys(imagesData) {
    return imagesData.filter(data => data.show).map(data => data.name);
  }

  getVisibleSprites() {
    return this.visibleSpriteKeys.map(key => this.getSprite(key));
  }

  getAction() {
    return this.currentAction;
  }
}
