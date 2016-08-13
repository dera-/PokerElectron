import AiStatusDisplayScene from '../../scene/display/AiStatusDisplayScene';
import PlayerModelRepository from '../../repository/game/PlayerModelRepository';

export default class AiStatusDisplaySceneFactory {
  static generateWithPromise(stageKey) {
    return Promise.resolve(new AiStatusDisplayScene()).then(scene => {
      return scene.initializeAiStatusDisplayScene(PlayerModelRepository.get('ai', 0, 0));
    });
  }
}
