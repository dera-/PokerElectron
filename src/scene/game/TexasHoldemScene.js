import BaseScene from '../BaseScene';
import * as BaseStatus from '../../const/BaseStatus';
import * as TexasHoldemStatus from '../../const/game/TexasHoldemStatus';
import * as TexasHoldemAction from '../../const/game/TexasHoldemAction';
import * as BaseAction from '../../const/BaseAction';
import TexasHoldemService from '../../service/game/TexasHoldemService';
import TexasHoldemView from '../../view/game/TexasHoldemView';
import FileModel from '../../model/FileModel';

export default class TexasHoldemScene extends BaseScene {
  initializeTexasHoldemScene(players, initialBlind) {
    return this.initialize({players: players, initialBlind: initialBlind}).then(() => {
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
      return this.view.initializeTexasHoldemView(object.players, object.initialBlind);
    });
  }

  start(status) {
    this.view.visibleSpritesDraw();
    this.view.labelsDraw();
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
      this.view.decidePositionDraw(this.service.getBigBlindIndex(), this.service.getBigBlindValue());
      this.view.dealCardsDraw();
      this.pushStatuses([TexasHoldemStatus.STATUS_START_PHASE/*, BaseStatus.STATUS_DRAWING*/]);
    } else if (status === TexasHoldemStatus.STATUS_START_PHASE) {
      // フェーズ開始
      const openedCards = this.service.startPhase();
      this.view.setCardsDraw(openedCards);
      this.pushStatuses([TexasHoldemStatus.STATUS_NEXT_PLAYER/*, BaseStatus.STATUS_DRAWING*/]);
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
      this.pushStatuses([TexasHoldemStatus.STATUS_NEXT_PLAYER/*, BaseStatus.STATUS_DRAWING*/]);
    } else if (status === TexasHoldemStatus.STATUS_AI_THINKING) {
      // AIアクション時
      setTimeout(() => {
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
      }, 0);
      this.pushStatuses([TexasHoldemStatus.STATUS_NEXT_PLAYER/*, BaseStatus.STATUS_DRAWING*/]);
    } else if (status === TexasHoldemStatus.STATUS_NEXT_PLAYER) {
      this.service.decideCurrentPlayer();
      // 次のフェーズに移るもしくは1プレイ完了
      if (this.service.isEndCurrentPhase()) {
          this.pushStatus(TexasHoldemStatus.STATUS_NEXT_PHASE);
      } else if (this.service.isAiAction()) {
        this.pushStatus(TexasHoldemStatus.STATUS_AI_THINKING);
      } else {
        this.view.resetAction();
        this.pushStatus(TexasHoldemStatus.STATUS_PLAYER_THINKING);
      }
    } else if (status === TexasHoldemStatus.STATUS_NEXT_PHASE) {
      // 次のフェーズへ移行
      this.service.collectChipsToPod()
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
      this.service.resetPlayersAction();
      this.view.ranksDraw(this.service.getPlayerRanks());
      this.view.showDownDraw();
      this.view.setCardsDraw(openedCards);
      this.view.shareChips();
      this.pushStatuses([TexasHoldemStatus.STATUS_JUDGE_CONTINUE_GAME/*, BaseStatus.STATUS_DRAWING*/]);
    } else if (status === TexasHoldemStatus.STATUS_FOLD_END) {
      // ショーダウンせずに勝負が決まる場合
      this.service.sharePodToWinners(this.service.getWinners());
      this.service.resetPlayersAction();
      this.view.shareChips();
      this.pushStatuses([TexasHoldemStatus.STATUS_JUDGE_CONTINUE_GAME/*, BaseStatus.STATUS_DRAWING*/]);
    } else if (status === TexasHoldemStatus.STATUS_JUDGE_CONTINUE_GAME) {
      this.view.resultDraw(this.service.getChipPots());
      this.service.deleteDeadPlayer();
      if (this.service.isFinished()) {
        this.pushStatus(TexasHoldemStatus.STATUS_GAME_END);
      } else {
        this.pushStatus(TexasHoldemStatus.STATUS_WAIT_NEXT_GAME);
      }
    } else if (status === TexasHoldemStatus.STATUS_GAME_END) {
      // 勝負が決まった時
      // TODO: 後で実装する
      //const fileModel = new FileModel('sample.txt');
      //fileModel.open();
      //fileModel.writeOneLine("test_desu");
      //fileModel.close();
      console.log('game_end');
    }
  }

  isStopStateTransition(status) {
    const targetStatuses = [BaseStatus.STATUS_DRAWING, BaseStatus.STATUS_NONE, TexasHoldemStatus.STATUS_PLAYER_THINKING, TexasHoldemStatus.STATUS_WAIT_NEXT_GAME];
    return targetStatuses.some(target => status === target);
  }

  touchEndEvent(action) {
    console.log('action:' + action);
    const status = this.getCurrentStatus();
    if (status === TexasHoldemStatus.STATUS_PLAYER_THINKING && action !== BaseAction.ACTION_NONE) {
      this.service.setCurrentPlayerAction(action, this.view.getCurrentBetValue());
      this.popStatus();
      this.pushStatus(TexasHoldemStatus.STATUS_PLAYER_DESIDE);
    } else if (status === TexasHoldemStatus.STATUS_WAIT_NEXT_GAME) {
      console.log('wait wait wait');
      this.service.reset();
      this.view.oneGameDrawErase();
      this.view.resetOneGame();
      this.popStatus();
      this.pushStatus(TexasHoldemStatus.STATUS_GAME_CONTINUE);
    }
  }
}
