import GameRepository from './GameRepository';

let gameObject = null;

export default class SceneRepository {
  static setGameObject(game) {
    gameObject = game;
  }

  static popScene(scene) {
    if (gameObject === null) return;
    gameObject.popScene(scene);
  }
  static pushScene(scene) {
    if (gameObject === null) return;
    gameObject.pushScene(scene);
  }

  static addSpriteToCurrentScene(sprite) {
    if (gameObject === null) return;
    gameObject.currentScene.addChild(sprite);
  }

  static removeSpriteFromCurrentScene(sprite) {
    if (gameObject === null) return;
    gameObject.currentScene.removeChild(sprite);
  }
}
