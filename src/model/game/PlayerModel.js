import CardModel from './CardModel';
import ActionModel from './ActionModel';
import RankUtil from '../../util/game/RankUtil';
import * as Position from '../../const/game/Position';

export default class PlayerModel {
  constructor(id, money, seatNumber) {
    this.id = id;
    this.initialStack = money;
    this.seatNumber = seatNumber;
    this.stack = money;
    this.hand = [];
    this.action = null;
    this.position = Position.OTHER;
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

  getPosition() {
    return this.position;
  }

  setPosition(position) {
    this.position = position;
  }

  getSeatNumber() {
    return this.seatNumber;
  }

  changeInitialiStack(stack) {
    this.initialStack = stack;
  }

  resetAll() {
    this.stack = this.initialStack;
    this.hand = [];
    this.action = null;
    this.position = Position.OTHER;
  }
}
