import BaseService from '../service/BaseService';
import BaseView from '../view/BaseView';
import * as BaseStatus from '../const/BaseStatus';

export default class BaseScene {
  initialize(objectForView = {}, objectForService = {}) {
    return new Promise((resolve, reject) => {
      this.statusQueue = [];
      resolve();
    }).then(()=>{
      return this.generateViewWithPromise(objectForView);
    }).then(()=>{
      return this.generateService(objectForService);
    }).then(()=>{
      return this.generateScene();
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
        //console.log(this.getCurrentStatus());
        this.view.playBgm();
        this.run(this.getCurrentStatus());
      });
      // シーン終了時の処理
      scene.addEventListener('exit', () => {
        this.end();
      });
      // 以下、タップ時の処理
      scene.addEventListener('touchstart', () => {
        this.touchStartEvent();
      });
      scene.addEventListener('touchmove', () => {
        this.touchMoveEvent();
      });
      scene.addEventListener('touchend', () => {
        this.touchEndEvent();
      });
      resolve(scene);
    }).then(scene =>{
      this.scene = scene;
      return Promise.resolve();
    })
  }

  start() {}
  run(status) {}
  end() {
    this.view.stopBgm();
  }
  touchStartEvent() {}
  touchMoveEvent() {}
  touchEndEvent() {}
}
