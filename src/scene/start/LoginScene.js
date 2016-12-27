import BaseScene from '../BaseScene';
import LoginService from '../../service/start/LoginService';
import LoginView from '../../view/LoginView';
import * as Mode from '../../const/start/Mode';
import GameTitleSceneFactory from '../../factory/start/GameTitleSceneFactory';
import SceneRepository from '../../repository/SceneRepository';

class LoginScene extends BaseScene {
  initializeAiLoginScene(loginData) {
    return this.initialize(loginData, loginData).then(() => {
      return this;
    });
  }

  generateLoginService(object) {
    return Promise.resolve(new LoginService()).then(service => {
      this.service = service;
      return this.service.initializeLoginService(object.name, object.access_token);
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
      case MODE.LOGIN:
        this.view.resetCurrentAction();
        this.login();
        break;
      case MODE.REGISTER:
        this.view.resetCurrentAction();
        this.register();
        break;
      case MODE.TITLE:
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
    });
  }

  register() {
    new Promise((resolve) => {
      const name = this.view.getLoginName();
      const code = this.view.getLoginCode();
      resolve(this.service.register(name, code));
    }).then((isOk)=>{
      this.view.drawResult(isOk);
    });
  }
}
