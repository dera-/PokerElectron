import TexasHoldemScene from '../../scene/game/TexasHoldemScene';
import StageConfig from '../../config/data/stage.json';
import * as GameMode from '../../const/game/GameMode';
import PlayerModelRepository from '../../repository/game/PlayerModelRepository';

export default class TexasHoldemSceneFactory {
  static generateWithPromise(stageKey) {
    return Promise.resolve(new TexasHoldemScene()).then(scene => {
      const stageData = StageConfig.data[stageKey];
      const playerKeys = stageData.players;
      let playerModels = [];
      for (let index = 0; index < playerKeys.length; index++) {
        playerModels.push(PlayerModelRepository.get(playerKeys[index], stageData.initial_stack, index));
      }
      return scene.initializeTexasHoldemScene(playerModels, stageData.big_blind, stageData, TexasHoldemSceneFactory.getGameMode(stageKey));
    });
  }

  static getGameMode(stageKey) {
    const stageData = StageConfig.data[stageKey];
    switch (stageData.game_mode) {
      case 'study':
        return GameMode.MODE_STUDY;
      case 'ai_battle':
        return GameMode.MODE_AI_BATTLE;
      default:
        return GameMode.MODE_BATTLE;
    }
  }
}
