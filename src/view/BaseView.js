import Conf from '../config/conf.json';
import * as BaseAction from '../const/BaseAction';
import SpriteFactory from '../factory/SpriteFactory';
import ImageRepository from '../repository/ImageRepository';
import SceneRepository from '../repository/SceneRepository';
import AudioRepository from '../repository/AudioRepository';

// viewクラスのインターフェース的なサムシング
export default class BaseView {
  async initialize(imagesData = [], bgmPath = '') {
    this.sprites = await this.generateSprites(imagesData);
    if (bgmPath !== '') {
      this.bgm = await AudioRepository.getAudioWithPromise(bgmPath);
    } else {
      this.bgm = null;
    }
    console.log(this.bgm);
  }

  getSprite(key) {
    return this.sprites[key];
  }

  getAllSpirites() {
    return Object.keys(this.sprites).map(key => this.sprites[key]);
  }

  async generateSprites(imagesData) {
    const sprites = {};
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
      sprites[data.name] = sprite;
    }
    return sprites;
  }

  playBgm() {
    if (this.bgm === null) {
      return;
    }
    this.bgm.play();
  }

  stopBgm() {
    if (this.bgm === null) {
      return;
    }
    this.bgm.stop();
  }

  showFirst() {}
}
