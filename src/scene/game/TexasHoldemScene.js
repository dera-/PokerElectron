import BaseScene from './BaseScene';
import BaseStatus from '../../const/BaseStatus';
import TexasHoldemStatus from '../../const/game/TexasHoldemStatus';
import TexasHoldemService from '../../service/game/TexasHoldemService';
import TexasHoldemView from '../../view/game/TexasHoldemView';

export default class TexasHoldemScene extends BaseScene {
  constructor(players, initialBlind) {
    super({players: players, initialBlind: initialBlind});
  }

  generateService(object = {}) {
    return new TexasHoldemService(object.players, object.initialBlind);
  }

  generateView(object = {}) {
    return new BaseView(object.players, object.initialBlind);
  }

  start(status) {
    this.service.initialize(true);
    this.addSprites(this.view.getVisibleSprites());
  }

  run(status) {
    if (status === BaseStatus.STATUS_DRAWING) {
      return;
    }
    // シーン毎の行動+遷移
    this.popStatus();
    if (status === TexasHoldemStatus.STATUS_GAME_START) {
      // ゲーム開始時
      this.service.dealCards();
      this.service.startPhase();
      this.pushStatuses([TexasHoldemStatus.STATUS_START_PHASE, BaseStatus.STATUS_DRAWING]);
    } else if (status === TexasHoldemStatus.STATUS_START_PHASE) {
      // フェーズ開始
      this.startPhase();
      this.pushStatuses([TexasHoldemStatus.STATUS_NEXT_PLAYER, BaseStatus.STATUS_DRAWING]);
    } else if (status === TexasHoldemStatus.STATUS_PLAYER_DESIDE) {
      // プレイヤーアクション決定時
      this.service.nextActionPlayer();
      this.pushStatuses([TexasHoldemStatus.STATUS_NEXT_PLAYER, BaseStatus.STATUS_DRAWING]);
    } else if (status === TexasHoldemStatus.STATUS_AI_THINKING) {
      // AIアクション時
      setTimeout(() => {
        this.service.decideCurrentPlayerAction();
        this.service.nextActionPlayer();
      }, 0);
      this.pushStatuses([TexasHoldemStatus.STATUS_NEXT_PLAYER, BaseStatus.STATUS_DRAWING]);
    } else if (status === TexasHoldemStatus.STATUS_NEXT_PLAYER) {
      this.service.decideCurrentPlayer();
      // 次のフェーズに移るもしくは1プレイ完了
      if (this.service.isEndCurrentPhase()) {
        if (this.service.existOnlyOneSurvivor()) {
          this.pushStatus(TexasHoldemStatus.STATUS_FOLD_END);
        } else if (false === this.service.isContinueGame()) {
          this.pushStatus(TexasHoldemStatus.STATUS_SHOWDOWN);
        } else {
          this.pushStatus(TexasHoldemStatus.STATUS_NEXT_PHASE);
        }
      }
      if (this.service.isAiAction()) {
        this.pushStatus(TexasHoldemStatus.STATUS_AI_THINKING);
      } else {
        this.pushStatus(TexasHoldemStatus.STATUS_PLAYER_THINKING);
      }
    } else if (status === TexasHoldemStatus.STATUS_NEXT_PHASE) {
      // 次のフェーズへ移行
      this.service.moveNextPhase();
      this.pushStatuses([TexasHoldemStatus.STATUS_START_PHASE, BaseStatus.STATUS_DRAWING]);
    } else if (status === TexasHoldemStatus.STATUS_SHOWDOWN) {
      // リバーまで行ってショーダウンする場合
      this.service.showdown();
      this.service.sharePodToWinners(this.service.getWinners());
      this.pushStatuses([TexasHoldemStatus.STATUS_JUDGE_CONTINUE_GAME, BaseStatus.STATUS_DRAWING]);
    } else if (status === TexasHoldemStatus.STATUS_FOLD_END) {
      // ショーダウンせずに勝負が決まる場合
      this.service.sharePodToWinners(this.service.getWinners());
      this.pushStatuses([TexasHoldemStatus.STATUS_JUDGE_CONTINUE_GAME, BaseStatus.STATUS_DRAWING]);
    } else if (status === TexasHoldemStatus.STATUS_JUDGE_CONTINUE_GAME) {
      this.service.deleteDeadPlayer();
      if (this.service.isFinished()) {
        this.pushStatus(TexasHoldemStatus.STATUS_GAME_END);
      } else {
        this.pushStatus(TexasHoldemStatus.STATUS_GAME_START);
      }
    } else if (status === TexasHoldemStatus.STATUS_GAME_END) {
      // 勝負が決まった時
      // TODO: 後で実装する
      console.log('game_end');
    }
  }

  end(status) {

  }

  touchStartEvent(action) {

  }

  touchMoveEvent(action) {

  }

  touchEndEvent(action) {

  }
}
