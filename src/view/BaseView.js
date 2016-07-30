import Conf from '../config/conf.json';
import * as BaseAction from '../const/BaseAction';
import SpriteFactory from '../factory/SpriteFactory';
import ImageRepository from '../repository/ImageRepository';

// viewクラスのインターフェース的なサムシング
export default class BaseView {
  initialize(imagesData = {}) {
    return this.initializeCurrentAction().then(()=>{
      return this.initializeSprites(imagesData)
    }).then(()=>{
      return this.getVisibleSpriteKeysWithPromise(imagesData);
    });
  }

  initializeCurrentAction() {
    return new Promise((resolve, reject) => {
      this.currentAction = BaseAction.ACTION_NONE;
      resolve();
    });
  }

  getSprite(key) {
    return this.sprites[key];
  }

  getAllSpirites() {
    return Object.keys(this.sprites).map(key => this.sprites[key]);
  }

  initializeSprites(imagesData) {
    this.sprites = {};
    return new Promise((resolve, reject) => {
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
      resolve(datas);
    }).then(datas => Promise.all(datas.map(data => SpriteFactory.generateWithPromise(
        data.x,
        data.y,
        data.fileName
      ).then(sprite =>{
        return {
          name: data.name,
          sprite: sprite
        };
      })
    ))).then(datas => {
      //console.log(datas);
      datas.forEach(data => {
        //console.log(data.sprite.image);
        this.sprites[data.name] = data.sprite;
      });
      return Promise.resolve();
    });
  }

  getVisibleSpriteKeysWithPromise(imagesData) {
    return Promise.resolve(imagesData.filter(data => data.show).map(data => data.name)).then(keys=>{
      this.visibleSpriteKeys = keys;
      return Promise.resolve();
    });
  }

  getVisibleSprites() {
    return this.visibleSpriteKeys.map(key => this.getSprite(key));
  }

  getAction() {
    return this.currentAction;
  }
}
