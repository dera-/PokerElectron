import GameRepository from './GameRepository';

let gameObject = null;
const drawedEntities = {};

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

  static addEntityToCurrentScene(key, entity) {
    if (gameObject === null || drawedEntities.hasOwnProperty(key)) {
      return;
    }
    drawedEntities[key] = entity;
    gameObject.currentScene.addChild(entity);
  }

  static removeEntityFromCurrentScene(key) {
    if (gameObject === null || false === drawedEntities.hasOwnProperty(key)) {
      return;
    }
    gameObject.currentScene.removeChild(drawedEntities[key]);
    delete drawedEntities[key];
  }
}
