import BaseService from '../service/BaseService';

export default class BaseScene {
  constructor(object = {}) {
    this.status = 'none';
    this.service = this.generateService(object);
    this.view = this.generateView(object);
    this.scene = this.generateScene(object);
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
    // シーン開始時の処理
    scene.addEventListener('enter', () => {
      this.status = this.start(this.status);
    });
    // 毎フレーム行われる処理
    scene.addEventListener('enterframe', () => {
      this.run(this.status);
    });
    // シーン終了時の処理
    scene.addEventListener('exit', () => {
      this.end(this.status);
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

  start(status) {
    return this.status;
  }
  run(status) {
    return this.status;
  }
  end(status) {
    return this.status;
  }
  touchStartEvent(action) {
    return this.status;
  }
  touchMoveEvent(action) {
    return this.status;
  }
  touchEndEvent(action) {
    return this.status;
  }
}
