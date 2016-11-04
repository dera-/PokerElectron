import Player from '../model/game/PlayerModel';
import MachineLearnPlayerModel from '../model/game/MachineLearnPlayerModel';
import PlayerModelRepository from '../repository/game/PlayerModelRepository';
import TexasHoldemService from '../service/game/TexasHoldemService';
import * as TexasHoldemStatus from '../const/game/TexasHoldemStatus';

export default class TexasHoldemSimulationScene {
  constructor(enemyName, times, bigBlind, initialStack) {
    this.similationTimes = times;
    this.bigBlind = bigBlind;
    this.initialStack = initialStack;
    this.testman = PlayerModelRepository.get('testman', this.initialStack, 1);
    this.enemy = PlayerModelRepository.get(enemyName, this.initialStack, 2);
  }

  run() {
    for (let num = 0; num < this.similationTimes; num++) {
      this.testman.resetAll();
      this.enemy.resetAll();
      const service = new TexasHoldemService();
      service.initializeTexasHoldemService([this.testman, this.enemy], this.bigBlind);
      this.oneGame(service);
    }
    this.testman.save();
  }

  oneGame(gameService) {
    let num = 0;
    this.status = TexasHoldemStatus.STATUS_GAME_START;
    while (this.status !== TexasHoldemStatus.STATUS_GAME_END) {
      if (this.status === TexasHoldemStatus.STATUS_GAME_START || this.status === TexasHoldemStatus.STATUS_GAME_CONTINUE) {
        // ゲーム開始時
        num++;
        gameService.initializeGame(this.status === TexasHoldemStatus.STATUS_GAME_CONTINUE);
        gameService.dealCards();
        this.pushStatus(TexasHoldemStatus.STATUS_START_PHASE);
      } else if (this.status === TexasHoldemStatus.STATUS_START_PHASE) {
        // フェーズ開始
        gameService.startPhase();
        this.pushStatus(TexasHoldemStatus.STATUS_NEXT_PLAYER);
      } else if (this.status === TexasHoldemStatus.STATUS_AI_THINKING) {
        gameService.decideCurrentPlayerAction();
        gameService.nextActionPlayer();
        this.pushStatus(TexasHoldemStatus.STATUS_NEXT_PLAYER);
      } else if (this.status === TexasHoldemStatus.STATUS_NEXT_PLAYER) {
        gameService.decideCurrentPlayer();
        // 次のフェーズに移るもしくは1プレイ完了
        if (gameService.isEndCurrentPhase()) {
          this.pushStatus(TexasHoldemStatus.STATUS_NEXT_PHASE);
        } else {
          this.pushStatus(TexasHoldemStatus.STATUS_AI_THINKING);
        }
      } else if (this.status === TexasHoldemStatus.STATUS_NEXT_PHASE) {
        // 次のフェーズへ移行
        gameService.collectChipsToPod();
        if (gameService.existOnlyOneSurvivor()) {
          this.pushStatus(TexasHoldemStatus.STATUS_FOLD_END);
        } else if (false === gameService.isContinueGame()) {
          this.pushStatus(TexasHoldemStatus.STATUS_SHOWDOWN);
        } else {
          gameService.moveNextPhase();
          gameService.resetPlayersAction();
          this.pushStatus(TexasHoldemStatus.STATUS_START_PHASE);
        }
      } else if (this.status === TexasHoldemStatus.STATUS_SHOWDOWN) {
        // リバーまで行ってショーダウンする場合
        gameService.sharePodToWinners(gameService.getWinners());
        this.pushStatus(TexasHoldemStatus.STATUS_JUDGE_CONTINUE_GAME);
      } else if (this.status === TexasHoldemStatus.STATUS_FOLD_END) {
        // ショーダウンせずに勝負が決まる場合
        gameService.sharePodToWinners(gameService.getWinners());
        this.pushStatus(TexasHoldemStatus.STATUS_JUDGE_CONTINUE_GAME);
      } else if (this.status === TexasHoldemStatus.STATUS_JUDGE_CONTINUE_GAME) {
        gameService.learnForLearnAi();
        gameService.resetPlayersAction();
        gameService.deleteDeadPlayer();
        if (gameService.isFinished()) {
          this.pushStatus(TexasHoldemStatus.STATUS_GAME_END);
        } else {
          gameService.reset();
          this.pushStatus(TexasHoldemStatus.STATUS_GAME_CONTINUE);
        }
      }
    }
    const winLooseString = gameService.isSurvive(this.testman.id) ? '○' : '×';
    console.log(winLooseString + ',' + num);
  }

  pushStatus(status) {
    this.status = status;
  }
}
