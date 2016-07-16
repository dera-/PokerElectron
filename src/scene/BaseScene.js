import BaseService from '../service/BaseService';
import BaseView from '../view/BaseView';
import * as BaseStatus from '../const/BaseStatus';

export default class BaseScene {
  constructor(object = {}) {
    this.statusQueue = [];
    this.service = this.generateService(object);
    this.view = this.generateView(object);
    this.scene = this.generateScene(object);
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
  }

  generateView(object = {}) {
    return new BaseView();
  }

  generateScene(object = {}) {
    const scene = new Scene();
    const status
    // シーン開始時の処理
    scene.addEventListener('enter', () => {
      this.start();
    });
    // 毎フレーム行われる処理
    scene.addEventListener('enterframe', () => {
      this.run(this.getScene());
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
    return scene;
  }

  start() {}
  run(status) {}
  end() {}
  touchStartEvent(action) {}
  touchMoveEvent(action) {}
  touchEndEvent(action) {}
}
