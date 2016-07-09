import GameRepository from './GameRepository';

const gameObject = GameRepository.get();

export default class SceneRepository {
  static popScene(scene) {
    gameObject.popScene(scene);
  }
  static pushScene(scene) {
    gameObject.pushScene(scene);
  }

  static addSpriteToCurrentScene(sprite) {
      gameObject.currentScene.addChild(sprite);
  }

  static removeSpriteFromCurrentScene(sprite) {
      gameObject.currentScene.removeChild(sprite);
  }
}
