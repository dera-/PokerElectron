import BaseScene from '../BaseScene';
import GameTitleSceneFactory from '../../factory/start/GameTitleSceneFactory';
import SceneRepository from '../../repository/SceneRepository';
import AiStatusDisplayService from '../../service/display/AiStatusDisplayService';
import AiStatusDisplayView from '../../view/display/AiStatusDisplayView';

export default class AiStatusDisplayScene extends BaseScene {
  initializeAiStatusDisplayScene(aiPlayer) {
    return this.initialize({player: aiPlayer}, {player: aiPlayer}).then(() => {
      return this;
    });
  }

  generateService(object) {
    return Promise.resolve(new AiStatusDisplayService()).then(service => {
      this.service = service;
      return this.service.initializeAiStatusDisplayService(object.player);
    });
  }

  generateViewWithPromise(object) {
    return Promise.resolve(new AiStatusDisplayView()).then(view => {
      this.view = view;
      return this.view.initializeAiStatusDisplayView(object.player);
    });
  }

  start() {
    super.start();
    this.view.setPlayerType(this.service.getPlayStyle());
    this.view.setTeachedCount(this.service.getTeachedCount());
    this.view.setWinningRate(this.service.getWinningRate());
    this.view.setRightFoldRate(this.service.getRightFoldRate());
    this.view.show();
    this.view.cardSpriteDraw(this.service.getBestHand());
  }

  touchEndEvent() {
    if (this.view.isReturnToTitle()) {
      this.view.playSound('exit');
      GameTitleSceneFactory.generateWithPromise().then(sceneObject => {
        SceneRepository.popScene();
        SceneRepository.pushScene(sceneObject.getScene());
      });
    }
  }
}
