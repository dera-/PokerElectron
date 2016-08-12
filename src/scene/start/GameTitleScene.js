import Conf from '../../config/conf.json';
import BaseScene from '../BaseScene';
import GameTitleView from '../../view/start/GameTitleView';
import Mode from '../../const/start/Mode';
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
      return this.view.initializeTitleView();
    });
  }

  start(status) {
    this.view.resetDicidedMode();
    this.view.show();
  }

  touchEndEvent() {
    switch (this.view.getCurrentAction()) {
      case MODE.STUDY:
        TexasHoldemSceneFactory.generateWithPromise('study')
          .then(sceneObject => {
            SceneRepository.pushScene(sceneObject.getScene());
          });
        break;
      case MODE_BATTLE:
        TexasHoldemSceneFactory.generateWithPromise('battle')
          .then(sceneObject => {
            SceneRepository.pushScene(sceneObject.getScene());
          });
        break;
      case MODE_EXIT:
        window.open('about:blank', '_self').close();
        break;
      default:
        return;
    }
  }
}
