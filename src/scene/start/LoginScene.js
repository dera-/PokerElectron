import BaseScene from '../BaseScene';
import LoginService from '../../service/start/LoginService';
import LoginView from '../../view/start/LoginView';
import * as Mode from '../../const/start/Mode';
import GameTitleSceneFactory from '../../factory/start/GameTitleSceneFactory';
import SceneRepository from '../../repository/SceneRepository';

export default class LoginScene extends BaseScene {
  initializeLoginScene(loginData) {
    return this.initialize(loginData, loginData).then(() => {
      return this;
    });
  }

  generateService(object) {
    return Promise.resolve(new LoginService()).then(service => {
      this.service = new LoginService();
      return this.service.initializeLoginService(object.name, object.serial_code);
    });
  }

  generateViewWithPromise(object) {
    return Promise.resolve(new LoginView()).then(view => {
      this.view = view;
      return this.view.initializeLoginView(object.name);
    });
  }

  start() {
    this.view.show();
  }

  touchEndEvent() {
    switch (this.view.getCurrentAction()) {
      case Mode.LOGIN:
        this.view.resetCurrentAction();
        this.login();
        break;
      case Mode.REGISTER:
        this.view.resetCurrentAction();
        this.register();
        break;
      case Mode.TITLE:
        GameTitleSceneFactory.generateWithPromise().then(sceneObject => {
          SceneRepository.popScene();
          SceneRepository.pushScene(sceneObject.getScene());
        });
        break;
      default:
        return;
    }
  }

  login() {
    new Promise((resolve) => {
      resolve(this.service.login());
    }).then((isOk)=>{
      this.view.drawResult(isOk);
      this.view.finishAction();
    });
  }

  register() {
    new Promise((resolve) => {
      const name = this.view.getLoginName();
      const code = this.view.getLoginCode();
      resolve(this.service.register(name, code));
    }).then((isOk)=>{
      this.view.drawResult(isOk);
      this.view.finishAction();
    });
  }
}
