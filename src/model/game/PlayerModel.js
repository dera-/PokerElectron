import CardModel from './CardModel';
import ActionModel from './ActionModel';
import RankUtil from '../../util/game/RankUtil';

export default class PlayerModel {
  constructor(id, money) {
    this.id = id;
    this.stack = money;
    this.hand = [];
    this.action = null;
  }

  setAction(name, value) {
    this.action = new ActionModel(name, value);
  }

  getAction() {
    return this.action;
  }

  resetAction() {
    this.action = null;
  }

  pay(value) {
    this.stack -= value;
  }

  addStack(value) {
    this.stack += value;
  }

  getStack() {
    return this.stack;
  }

  setStack(money) {
    this.stack = money;
  }

  hasHand() {
    return this.hand.length > 0
  }

  hasChip() {
    return this.stack > 0;
  }

  isActive() {
    return this.hasHand() && this.hasChip();
  }

  getCards() {
    return this.hand;
  }

  setCards(cards) {
    this.hand = cards;
  }

  dumpCards() {
    this.hand = [];
  }

  getRank(openedCards) {
    return RankUtil.getRank(this.hand, openedCards);
  }
}
