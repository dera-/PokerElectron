import BaseScene from '../BaseScene';
import * as BaseStatus from '../../const/BaseStatus';
import * as TexasHoldemStatus from '../../const/game/TexasHoldemStatus';
import * as TexasHoldemAction from '../../const/game/TexasHoldemAction';
import * as BaseAction from '../../const/BaseAction';
import TexasHoldemService from '../../service/game/TexasHoldemService';
import TexasHoldemView from '../../view/game/TexasHoldemView';

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
    this.addSprites(this.view.getVisibleSprites());
    this.addSprites(this.view.getLabels());
    this.pushStatus(TexasHoldemStatus.STATUS_GAME_START);
  }

  run(status) {
    if (status === BaseStatus.STATUS_DRAWING) {
      return;
    }
    // シーン毎の行動+遷移
    this.popStatus();
    if (status === TexasHoldemStatus.STATUS_GAME_START || status === TexasHoldemStatus.STATUS_GAME_CONTINUE) {
      // ゲーム開始時
      this.service.initializeGame(status === TexasHoldemStatus.STATUS_GAME_START);
      this.service.dealCards();
      this.addSprites(this.view.decidePositionDraw(this.service.getBigBlindIndex(), this.service.getBigBlindValue()));
      this.addSprites(this.view.dealCardsDraw());
      this.pushStatuses([TexasHoldemStatus.STATUS_START_PHASE/*, BaseStatus.STATUS_DRAWING*/]);
    } else if (status === TexasHoldemStatus.STATUS_START_PHASE) {
      // フェーズ開始
      const openedCards = this.service.startPhase();
      this.addSprites(this.view.setCardsDraw(openedCards));
      this.pushStatuses([TexasHoldemStatus.STATUS_NEXT_PLAYER/*, BaseStatus.STATUS_DRAWING*/]);
    } else if (status === TexasHoldemStatus.STATUS_PLAYER_DESIDE) {
      // プレイヤーアクション決定時
      const player = this.service.getCurrentPlayer()
      const action = this.service.getCurrentPlayerAction();
      this.addSprites(this.view.actionDraw(player.id, action));
      if (action.name === TexasHoldemAction.FOLD) {
        this.removeSprites(this.view.foldDraw(player.id));
      }
      this.service.nextActionPlayer();
      this.pushStatuses([TexasHoldemStatus.STATUS_NEXT_PLAYER/*, BaseStatus.STATUS_DRAWING*/]);
    } else if (status === TexasHoldemStatus.STATUS_AI_THINKING) {
      // AIアクション時
      setTimeout(() => {
        this.service.decideCurrentPlayerAction();
        const player = this.service.getCurrentPlayer()
        const action = this.service.getCurrentPlayerAction();
        this.addSprites(this.view.actionDraw(player.id, action));
        if (action.name === TexasHoldemAction.FOLD) {
          this.removeSprites(this.view.foldDraw(player.id));
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
        this.pushStatus(TexasHoldemStatus.STATUS_PLAYER_THINKING);
      }
    } else if (status === TexasHoldemStatus.STATUS_NEXT_PHASE) {
      // 次のフェーズへ移行
      this.service.moveNextPhase();
      this.removeSprites(this.view.actionDrawErase());
      this.view.potDraw(this.service.board.getPotValue());
      this.view.resetOnePhase();
      if (this.service.existOnlyOneSurvivor()) {
        this.pushStatuses([TexasHoldemStatus.STATUS_FOLD_END]);
      } else if (false === this.service.isContinueGame()) {
        this.pushStatuses([TexasHoldemStatus.STATUS_SHOWDOWN]);
      } else {
        this.pushStatuses([TexasHoldemStatus.STATUS_START_PHASE/*, BaseStatus.STATUS_DRAWING*/]);
      }
    } else if (status === TexasHoldemStatus.STATUS_SHOWDOWN) {
      // リバーまで行ってショーダウンする場合
      this.service.showdown();
      this.service.sharePodToWinners(this.service.getWinners());
      this.view.showDown();
      this.view.shareChips();
      this.view.resetOneGame();
      this.pushStatuses([TexasHoldemStatus.STATUS_JUDGE_CONTINUE_GAME/*, BaseStatus.STATUS_DRAWING*/]);
    } else if (status === TexasHoldemStatus.STATUS_FOLD_END) {
      // ショーダウンせずに勝負が決まる場合
      this.service.sharePodToWinners(this.service.getWinners());
      this.view.shareChips();
      this.view.resetOneGame();
      this.pushStatuses([TexasHoldemStatus.STATUS_JUDGE_CONTINUE_GAME/*, BaseStatus.STATUS_DRAWING*/]);
    } else if (status === TexasHoldemStatus.STATUS_JUDGE_CONTINUE_GAME) {
      this.service.deleteDeadPlayer();
      if (this.service.isFinished()) {
        this.pushStatus(TexasHoldemStatus.STATUS_GAME_END);
      } else {
        this.pushStatus(TexasHoldemStatus.STATUS_GAME_CONTINUE);
      }
    } else if (status === TexasHoldemStatus.STATUS_GAME_END) {
      // 勝負が決まった時
      // TODO: 後で実装する
      console.log('game_end');
    }
  }

  touchEndEvent(action) {
    const status = this.getCurrentStatus();
    if (status === TexasHoldemStatus.STATUS_PLAYER_THINKING && action !== BaseAction.ACTION_NONE) {
      this.service.setCurrentPlayerAction(this.view.getCurrentAction(), this.view.getCurrentBetValue());
      this.pushStatus(TexasHoldemStatus.STATUS_PLAYER_DESIDE);
    }
  }
}
