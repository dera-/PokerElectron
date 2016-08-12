import Conf from '../../config/conf.json';
import BaseScene from '../BaseScene';
import GameTitleView from '../../view/start/GameTitleView';
import * as MODE from '../../const/start/Mode';
import TexasHoldemSceneFactory from '../../factory/game/TexasHoldemSceneFactory';
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
    console.log('titletitletitltetitle');
    this.view.resetDicidedMode();
    this.view.show();
  }

  touchEndEvent() {
    console.log('click on title');
    switch (this.view.getCurrentAction()) {
      case MODE.STUDY:
        new Promise((resolve,reject) => {
          SceneRepository.popScene();
          resolve(TexasHoldemSceneFactory.generateWithPromise('study'));
        }).then(sceneObject => {
          SceneRepository.pushScene(sceneObject.getScene());
        });
        break;
      case MODE.BATTLE:
        TexasHoldemSceneFactory.generateWithPromise('battle')
          .then(sceneObject => {
            SceneRepository.popScene();
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
}
