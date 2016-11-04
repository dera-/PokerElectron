import * as TexasHoldemAction from '../../const/game/TexasHoldemAction';
import * as TexasHoldemPhase from '../../const/game/TexasHoldemPhase';
import * as BoardType from '../../const/game/learn/BoardType';
import * as RankStrength from '../../const/game/RankStrength';
import AiPlayerModel from './AiPlayerModel';
import ActionModel from './ActionModel';
import RankUtil from '../../util/game/RankUtil';
import BoardUtil from '../../util/game/learn/BoardUtil';

export default class DocilePlayerModel extends AiPlayerModel {
  // override
  decideAction(actionPhase, enemyPlayerModel, board, callValue) {
    const random = Math.round();
    const payValue = this.action === null ? 0 : this.action.value;
    if (actionPhase === TexasHoldemPhase.PHASE_PRE_FLOP) {
      const rinpIn = 50;
      // ちょっとハンドレンジが広すぎな気もするけど
      if ((this.hand[0].number === this.hand[1].number && this.hand[0].number + this.hand[1].number >= 16) || (this.hand.some(hand => hand.number===14) && this.hand[0].number + this.hand[1].number >= 23)) {
        if (6 * callValue >= this.stack) {
          this.action = new ActionModel(TexasHoldemAction.ACTION_ALLIN, this.stack);
        } else if (callValue <= Math.round(0.15 * this.stack) || this.hand[0].number + this.hand[1].number >= 26) {
          this.action = new ActionModel(TexasHoldemAction.ACTION_RAISE, 3 * callValue);
        } else {
          this.action = new ActionModel(TexasHoldemAction.ACTION_CALL, callValue);
        }
      } else if (this.hand[0].number === this.hand[1].number || this.hand[0].number + this.hand[1].number >= 20 || this.hand.some(hand => hand.number >= 12)) {
        if (6 * callValue >= this.stack) {
          this.action = new ActionModel(TexasHoldemAction.ACTION_ALLIN, this.stack);
        } else if (callValue <= Math.round(0.05 * this.stack)) {
          this.action = new ActionModel(TexasHoldemAction.ACTION_RAISE, 3 * callValue);
        } else {
          this.action = new ActionModel(TexasHoldemAction.ACTION_CALL, callValue);
        }
      } else if (this.hand[0].suit === this.hand[1].suit || Math.abs(this.hand[0].number - this.hand[1].number) <= 2) {
        if (callValue === payValue) {
          this.action = new ActionModel(TexasHoldemAction.ACTION_CHECK, callValue);
        } else {
          this.action = new ActionModel(TexasHoldemAction.ACTION_CALL, callValue);
        }
      } else {
        if (callValue === payValue) {
          this.action = new ActionModel(TexasHoldemAction.ACTION_CHECK, callValue);
        } else if (random <= 0.5) {
          this.action = new ActionModel(TexasHoldemAction.ACTION_CALL, callValue);
        } else {
          this.action = new ActionModel(TexasHoldemAction.ACTION_FOLD, payValue);
        }
      }
    } else {
      const boardCards = board.getOpenedCards();
      const pod = board.getPotValue();
      const rank = RankUtil.getRealRank(this.hand, boardCards);
      const boardType = BoardUtil.getBoardType(boardCards);
      // ほとんどボード見てないので、後で直す感じで
      if (rank.strength >= RankStrength.Straight) {
        if (5 * callValue >= this.stack) {
          this.action = new ActionModel(TexasHoldemAction.ACTION_ALLIN, this.stack);
        } else if (callValue === 0) {
          this.action = new ActionModel(TexasHoldemAction.ACTION_RAISE, Math.round(pod / 2));
        } else {
          this.action = new ActionModel(TexasHoldemAction.ACTION_RAISE, 2 * callValue);
        }
      } else if (rank.strength >= RankStrength.TWO_PAIR) {
        if (BoardUtil.isMatch(boardType, BoardType.TWO_SAME_CARDS)) {
          if (callValue === payValue) {
            this.action = new ActionModel(TexasHoldemAction.ACTION_CHECK, callValue);
          } else {
            this.action = new ActionModel(TexasHoldemAction.ACTION_CALL, callValue);
          }
        } else if (5 * callValue >= this.stack) {
          this.action = new ActionModel(TexasHoldemAction.ACTION_ALLIN, this.stack);
        } else if (callValue === 0) {
          this.action = new ActionModel(TexasHoldemAction.ACTION_RAISE, Math.round(pod / 2));
        } else {
          this.action = new ActionModel(TexasHoldemAction.ACTION_RAISE, 2.5 * callValue);
        }
      } else if (rank.strength >= RankStrength.ONE_PAIR_Q) {
        if (BoardUtil.isMatch(boardType, BoardType.TWO_SAME_CARDS)) {
          if (random <= 0.5) {
            this.action = new ActionModel(TexasHoldemAction.ACTION_CALL, callValue);
          } else {
            this.action = new ActionModel(TexasHoldemAction.ACTION_FOLD, payValue);
          }
        } else {
          if (callValue === 0) {
            this.action = new ActionModel(TexasHoldemAction.ACTION_RAISE, Math.round(pod / 2));
          } else {
            this.action = new ActionModel(TexasHoldemAction.ACTION_CALL, callValue);
          }
        }
      } else {
        if (callValue === 0) {
         this.action = new ActionModel(TexasHoldemAction.ACTION_CHECK, callValue);
        // 適当かよ
        } else if (random <= 0.4) {
          this.action = new ActionModel(TexasHoldemAction.ACTION_CALL, callValue);
        } else {
          this.action = new ActionModel(TexasHoldemAction.ACTION_FOLD, payValue);
        }
      }
    }
  }
}