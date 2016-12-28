import Conf from '../../config/conf.json';
import BaseScene from '../BaseScene';
import GameTitleView from '../../view/start/GameTitleView';
import * as MODE from '../../const/start/Mode';
import TexasHoldemSceneFactory from '../../factory/game/TexasHoldemSceneFactory';
import AiStatusDisplaySceneFactory from '../../factory/display/AiStatusDisplaySceneFactory';
import LoginSceneFactory from '../../factory/start/LoginSceneFactory';
import SceneRepository from '../../repository/SceneRepository';
import UserRepository from '../../repository/UserRepository';

export default class GameTitleScene extends BaseScene {
  initializeGameTitleScene() {
    return this.initialize({}, {}).then(() => {
      return this;
    });
  }

  generateViewWithPromise(object = {}) {
    return Promise.resolve(new GameTitleView()).then(view => {
      this.view = view;
      return this.view.initializeGameTitleView();
    });
  }

  start() {
    super.start();
    this.view.resetDicidedMode();
    this.view.show();
    if (UserRepository.isLogin()) {
      this.view.showLoginInfo(true);
    }
  }

  touchEndEvent() {
    switch (this.view.getCurrentAction()) {
      case MODE.STUDY:
        this.moveTexasHoldemScene('study');
        break;
      case MODE.BATTLE:
        this.moveTexasHoldemScene('battle');
        break;
      case MODE.AI_BATTLE:
        this.moveTexasHoldemScene('ai_battle_0');
        break;
      case MODE.AI_STATUS:
        new Promise((resolve,reject) => {
          SceneRepository.popScene();
          resolve(AiStatusDisplaySceneFactory.generateWithPromise());
        }).then(sceneObject => {
          SceneRepository.pushScene(sceneObject.getScene());
        });
        break;
      case MODE.LOGIN:
        new Promise((resolve,reject) => {
          SceneRepository.popScene();
          resolve(LoginSceneFactory.generateWithPromise());
        }).then(sceneObject => {
          SceneRepository.pushScene(sceneObject.getScene());
        });
        break;
      case MODE.RANDOM_AI_BATTLE:
        let beforeScene = null;
        new Promise((resolve,reject) => {
          beforeScene = SceneRepository.popScene();
          resolve(TexasHoldemSceneFactory.generateFromApi());
        }).then(sceneObject => {
          SceneRepository.pushScene(sceneObject.getScene());
        }).catch((err)=>{
          if (beforeScene !== null) {
            SceneRepository.pushScene(beforeScene);
          }
          this.view.resetDicidedMode();
          if (err.hasOwnProperty('status') && err.status === 401) {
            UserRepository.setUserAccessToken('');
            this.view.showLoginInfo(false);
            this.view.showError('session');
          } else {
            this.view.showError('other');
          }
        });
        break;
      case MODE.EXIT:
        window.close();
        break;
      default:
        return;
    }
  }

  moveTexasHoldemScene(stageKey) {
    new Promise((resolve,reject) => {
      SceneRepository.popScene();
      resolve(TexasHoldemSceneFactory.generateWithPromise(stageKey));
    }).then(sceneObject => {
      SceneRepository.pushScene(sceneObject.getScene());
    });
  }
}
