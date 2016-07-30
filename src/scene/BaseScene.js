import BaseService from '../service/BaseService';
import BaseView from '../view/BaseView';
import SceneRepository from '../repository/SceneRepository';
import * as BaseStatus from '../const/BaseStatus';

export default class BaseScene {
  initialize(object = {}) {
    return new Promise((resolve, reject) => {
      this.statusQueue = [];
      resolve();
    }).then(()=>{
      return this.generateViewWithPromise(object);
    }).then(()=>{
      return this.generateService(object);
    }).then(()=>{
      return this.generateScene(object);
    });
  }

  getCurrentStatus() {
    return this.statusQueue.length === 0 ? BaseStatus.STATUS_NONE : this.statusQueue[this.statusQueue.length-1];
  }

  popStatus() {
    return this.statusQueue.length === 0 ? BaseStatus.STATUS_NONE : this.statusQueue.pop();
  }

  pushStatus(status) {
    if (status === BaseStatus.STATUS_NONE) {
      return;
    }
    this.statusQueue.push(status);
  }

  pushStatuses(statuses) {
    statuses.forEach(status => {
      this.pushStatus(status);
    });
  }

  getScene() {
    return this.scene;
  }

  generateService(object = {}) {
    return new BaseService();
    return Promise.resolve(new BaseService()).then(service => {
      this.service = service;
      return Promise.resolve();
    });
  }

  generateViewWithPromise(object = {}) {
    return Promise.resolve(new BaseView()).then(view => {
      this.view = view;
      return this.view.initialize();
    });
  }

  generateScene(object = {}) {
    return new Promise((resolve, reject)=>{
      const scene = new Scene();
      // シーン開始時の処理
      scene.addEventListener('enter', () => {
        this.start();
      });
      // 毎フレーム行われる処理
      scene.addEventListener('enterframe', () => {
        this.run(this.getCurrentStatus());
      });
      // シーン終了時の処理
      scene.addEventListener('exit', () => {
        this.end();
      });
      // 以下、タップ時の処理
      scene.addEventListener('touchstart', (event) => {
        this.touchStartEvent(this.view.getAction(event));
      });
      scene.addEventListener('touchmove', (event) => {
        this.touchMoveEvent(this.view.getAction(event));
      });
      scene.addEventListener('touchend', (event) => {
        this.touchEndEvent(this.view.getAction(event));
      });
      resolve(scene);
    }).then(scene =>{
      this.scene = scene;
      return Promise.resolve();
    })
  }

  start() {}
  run(status) {}
  end() {}
  touchStartEvent(action) {}
  touchMoveEvent(action) {}
  touchEndEvent(action) {}

  addSprites(sprites) {
    sprites.forEach(sprite => {
      SceneRepository.addSpriteToCurrentScene(sprite);
    });
  }

  removeSprites(sprites) {
    sprites.forEach(sprite => {
      SceneRepository.removeSpriteFromCurrentScene(sprite);
    });
  }
}
