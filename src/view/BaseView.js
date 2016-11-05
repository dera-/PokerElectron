import Conf from '../config/conf.json';
import * as BaseAction from '../const/BaseAction';
import SpriteFactory from '../factory/SpriteFactory';
import ImageRepository from '../repository/ImageRepository';
import SceneRepository from '../repository/SceneRepository';

// viewクラスのインターフェース的なサムシング
export default class BaseView {
  initialize(imagesData = []) {
    this.initializeSprites(imagesData);
  }

  getSprite(key) {
    return this.sprites[key];
  }

  getAllSpirites() {
    return Object.keys(this.sprites).map(key => this.sprites[key]);
  }

  async initializeSprites(imagesData) {
    this.sprites = {};
    let datas = [];
    imagesData.forEach(data => {
      if (data.image_path instanceof Array) {
        datas = datas.concat(data.image_path.map(fileName => {
          return {
            name: data.name + '_' + fileName,
            x: Conf.main.width * data.x,
            y: Conf.main.height * data.y,
            fileName: fileName
          }
        }));
      } else {
        datas.push({
          name: data.name,
          x: Conf.main.width * data.x,
          y: Conf.main.height * data.y,
          fileName: data.image_path
        });
      }
    });
    for (let data of datas) {
      let sprite = await SpriteFactory.generateWithPromise(data.x, data.y, data.fileName);
      this.sprites[data.name] = data.sprite;
    }
  }

  showFirst() {}
}
