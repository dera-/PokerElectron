import Conf from '../../config/conf.json';
import BaseScene from '../BaseScene';
import * as BaseStatus from '../../const/BaseStatus';
import * as TexasHoldemStatus from '../../const/game/TexasHoldemStatus';
import * as TexasHoldemAction from '../../const/game/TexasHoldemAction';
import * as BaseAction from '../../const/BaseAction';
import TexasHoldemService from '../../service/game/TexasHoldemService';
import TexasHoldemView from '../../view/game/TexasHoldemView';
import FileModel from '../../model/FileModel';
import * as PlayerDicision from '../../const/game/PlayerDicision';

export default class TexasHoldemScene extends BaseScene {
  initializeTexasHoldemScene(players, initialBlind, stageData) {
    return this.initialize(
      {players: players, initialBlind: initialBlind, stageData: stageData},
      {players: players, initialBlind: initialBlind}
    ).then(() => {
      return this;
    });
  }

  generateService(object = {}) {
    return Promise.resolve(new TexasHoldemService()).then(service => {
      this.service = service;
      return this.service.initializeTexasHoldemService(object.players, object.initialBlind);
    });
  }

  generateViewWithPromise(object = {}) {
    return Promise.resolve(new TexasHoldemView()).then(view => {
      this.view = view;
      return this.view.initializeTexasHoldemView(object.players, object.initialBlind, object.stageData);
    });
  }

  start(status) {
    this.view.showFirst();
    this.pushStatus(TexasHoldemStatus.STATUS_GAME_START);
  }

  run(status) {
    if (this.isStopStateTransition(status)) {
      return;
    }
    console.log('status:' + status);
    // シーン毎の行動+遷移
    this.popStatus();
    if (status === TexasHoldemStatus.STATUS_GAME_START || status === TexasHoldemStatus.STATUS_GAME_CONTINUE) {
      // ゲーム開始時
      this.service.initializeGame(status === TexasHoldemStatus.STATUS_GAME_CONTINUE);
      this.service.dealCards();
      this.view.setPlayerBetValue();
      this.view.setCallValue(this.service.getBigBlindValue());
      this.view.decidePositionDraw();
      this.view.dealCardsDraw();
      this.pushStatuses([TexasHoldemStatus.STATUS_START_PHASE/*, BaseStatus.STATUS_DRAWING*/]);
    } else if (status === TexasHoldemStatus.STATUS_START_PHASE) {
      // フェーズ開始
      const openedCards = this.service.startPhase();
      this.view.setCardsDraw(openedCards);
      this.view.setPhaseInformation(this.service.getPhaseString());
      this.view.setSubInformation('');
      this.changeStatusByAutomaticTiming(TexasHoldemStatus.STATUS_NEXT_PLAYER);
    } else if (status === TexasHoldemStatus.STATUS_PLAYER_DESIDE) {
      // プレイヤーアクション決定時
      const player = this.service.getCurrentPlayer()
      const action = this.service.getCurrentPlayerAction();
      this.view.actionDraw(player.id, action);
      if (action.name === TexasHoldemAction.FOLD) {
        this.view.foldDraw(player.id);
      }
      this.service.nextActionPlayer();
      this.view.resetOneAction();
      this.changeStatusByAutomaticTiming(TexasHoldemStatus.STATUS_NEXT_PLAYER, 1000);
    } else if (status === TexasHoldemStatus.STATUS_AI_THINKING) {
      this.service.decideCurrentPlayerAction();
      const player = this.service.getCurrentPlayer()
      const action = this.service.getCurrentPlayerAction();
      this.view.actionDraw(player.id, action);
      if (action.name === TexasHoldemAction.FOLD) {
        this.view.foldDraw(player.id);
      } else {
        this.view.setCallValue(action.value);
      }
      this.service.nextActionPlayer();
      this.changeStatusByAutomaticTiming(TexasHoldemStatus.STATUS_NEXT_PLAYER, 1000);
    } else if (status === TexasHoldemStatus.STATUS_NEXT_PLAYER) {
      this.service.decideCurrentPlayer();
      // 次のフェーズに移るもしくは1プレイ完了
      if (this.service.isEndCurrentPhase()) {
          this.pushStatus(TexasHoldemStatus.STATUS_NEXT_PHASE);
      } else if (this.service.isAiAction()) {
        this.view.setSubInformation('AIのアクションです');
        this.pushStatus(TexasHoldemStatus.STATUS_AI_THINKING);
      } else {
        this.view.setSubInformation('あなたのアクションです');
        this.view.resetOneAction();
        this.pushStatus(TexasHoldemStatus.STATUS_PLAYER_THINKING);
      }
    } else if (status === TexasHoldemStatus.STATUS_NEXT_PHASE) {
      // 次のフェーズへ移行
      this.service.collectChipsToPod();
      this.view.setSubInformation('');
      this.view.actionDrawErase();
      this.view.potDraw(this.service.board.getPotValue());
      this.view.resetOnePhase();
      if (this.service.existOnlyOneSurvivor()) {
        this.pushStatuses([TexasHoldemStatus.STATUS_FOLD_END]);
      } else if (false === this.service.isContinueGame()) {
        this.pushStatuses([TexasHoldemStatus.STATUS_SHOWDOWN]);
      } else {
        this.service.moveNextPhase();
        this.service.resetPlayersAction();
        this.pushStatuses([TexasHoldemStatus.STATUS_START_PHASE/*, BaseStatus.STATUS_DRAWING*/]);
      }
    } else if (status === TexasHoldemStatus.STATUS_SHOWDOWN) {
      // リバーまで行ってショーダウンする場合
      const openedCards = this.service.showdown();
      this.service.sharePodToWinners(this.service.getWinners());
      this.view.setPhaseInformation('ショーダウン');
      this.view.ranksDraw(this.service.getPlayerRanks());
      this.view.showDownDraw();
      this.view.setCardsDraw(openedCards);
      this.view.shareChips();
      this.pushStatuses([TexasHoldemStatus.STATUS_JUDGE_CONTINUE_GAME/*, BaseStatus.STATUS_DRAWING*/]);
    } else if (status === TexasHoldemStatus.STATUS_FOLD_END) {
      // ショーダウンせずに勝負が決まる場合
      this.view.setPhaseInformation('フォールドエンド');
      this.service.sharePodToWinners(this.service.getWinners());
      this.view.shareChips();
      this.pushStatuses([TexasHoldemStatus.STATUS_JUDGE_CONTINUE_GAME/*, BaseStatus.STATUS_DRAWING*/]);
    } else if (status === TexasHoldemStatus.STATUS_JUDGE_CONTINUE_GAME) {
      this.service.learnForLearnAi();
      this.service.resetPlayersAction();
      this.view.resultDraw(this.service.getChipPots());
      this.service.deleteDeadPlayer();
      if (this.service.isFinished()) {
        this.view.setPhaseInformation('ゲーム終了');
        this.view.gameResultDraw(this.service.isSurvive(Conf.data.player.id))
        this.pushStatus(TexasHoldemStatus.STATUS_GAME_END);
      } else {
        this.view.setPhaseInformation('次ゲーム移行中...');
        this.changeStatusByAutomaticTiming(TexasHoldemStatus.STATUS_WAIT_NEXT_GAME, 2000);
      }
    } else if (status === TexasHoldemStatus.STATUS_WAIT_NEXT_GAME) {
      this.service.reset();
      this.view.oneGameDrawErase();
      this.view.resetBoard();
      this.pushStatus(TexasHoldemStatus.STATUS_GAME_CONTINUE);
    }
  }

  isStopStateTransition(status) {
    const targetStatuses = [BaseStatus.STATUS_DRAWING, BaseStatus.STATUS_NONE, BaseStatus.STATUS_WAITING, TexasHoldemStatus.STATUS_PLAYER_THINKING, TexasHoldemStatus.STATUS_GAME_END];
    return targetStatuses.some(target => status === target);
  }

  changeStatusByAutomaticTiming(nextStatus, time = 500) {
    this.pushStatuses([nextStatus, BaseStatus.STATUS_WAITING]);
    setTimeout(() => {
      if (this.getCurrentStatus() === BaseStatus.STATUS_WAITING) {
        this.popStatus();
      }
    }, time);
  }

  touchEndEvent() {
    const action = this.view.getCurrentAction();
    const status = this.getCurrentStatus();
    if (status === BaseStatus.STATUS_WAITING) {
      this.popStatus();
    } else if (status === TexasHoldemStatus.STATUS_PLAYER_THINKING && action !== BaseAction.ACTION_NONE) {
      this.service.setCurrentPlayerAction(action, this.view.getCurrentBetValue());
      this.popStatus();
      this.pushStatus(TexasHoldemStatus.STATUS_PLAYER_DESIDE);
    } else if (status === TexasHoldemStatus.STATUS_GAME_END && this.view.getPlayerDicision() === PlayerDicision.REPLAY) {
      this.service.reStart();
      this.view.hideSelectWindow();
      this.view.oneGameDrawErase();
      this.view.resetBoard();
      this.popStatus();
      this.pushStatus(TexasHoldemStatus.STATUS_GAME_START);
    }
  }
}
