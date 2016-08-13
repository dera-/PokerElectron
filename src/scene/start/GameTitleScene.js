import Conf from '../../config/conf.json';
import BaseScene from '../BaseScene';
import GameTitleView from '../../view/start/GameTitleView';
import * as MODE from '../../const/start/Mode';
import TexasHoldemSceneFactory from '../../factory/game/TexasHoldemSceneFactory';
import AiStatusDisplaySceneFactory from '../../factory/display/AiStatusDisplaySceneFactory';
import SceneRepository from '../../repository/SceneRepository';

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

  start(status) {
    this.view.resetDicidedMode();
    this.view.show();
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
        this.moveTexasHoldemScene('ai_battle_1');
        break;
      case MODE.AI_STATUS:
        new Promise((resolve,reject) => {
          SceneRepository.popScene();
          resolve(AiStatusDisplaySceneFactory.generateWithPromise());
        }).then(sceneObject => {
          SceneRepository.pushScene(sceneObject.getScene());
        });
        break;
      case MODE.EXIT:
        window.open('about:blank', '_self').close();
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
