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
        if ('image_dir' in data) {
          datas = datas.concat(ImageRepository.getImageNames(data.image_dir).map(fileName => {
            return {
              name: data.name + '_' + fileName,
              x: Conf.main.width * data.x,
              y: Conf.main.height * data.y,
              width: Conf.main.width * data.width,
              height: Conf.main.width * data.height,
              fileName: data.image_dir + '/' + fileName
            }
          }));
        } else if ('image_path' in data) {
          datas.push({
            name: data.name,
            x: Conf.main.width * data.x,
            y: Conf.main.height * data.y,
            width: Conf.main.width * data.width,
            height: Conf.main.width * data.height,
            fileName: data.image_path
          });
        }
      });
      resolve(datas);
    }).then(datas => Promise.all(datas.map(data => SpriteFactory.generateWithPromise(
        data.x,
        data.y,
        data.width,
        data.height,
        data.fileName
      ).then(sprite =>{
        console.log(data.name);
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
    console.log("getVisibleSprites");
    console.log(this.visibleSpriteKeys);
    return this.visibleSpriteKeys.map(key => this.getSprite(key));
  }

  getAction() {
    return this.currentAction;
  }
}
