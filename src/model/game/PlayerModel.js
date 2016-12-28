import CardModel from './CardModel';
import ActionModel from './ActionModel';
import RankUtil from '../../util/game/RankUtil';
import * as Position from '../../const/game/Position';
import CharacterData from '../data/CharacterData';

export default class PlayerModel {
  constructor(id, money, seatNumber, characterData) {
    this.id = id;
    this.initialStack = money;
    this.seatNumber = seatNumber;
    this.stack = money;
    this.hand = [];
    this.action = null;
    this.position = Position.OTHER;
    this.characterData = new CharacterData(characterData);
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

  getBetValue() {
    return this.action !== null ? this.action.value : 0;
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

  setSeatNumber(index) {
    this.seatNumber = index;
  }

  getInitialStack() {
    return this.initialStack;
  }

  changeInitialiStack(stack) {
    this.initialStack = stack;
  }

  setDisplayName(name) {
    this.characterData.displayName = name;
  }

  resetAll() {
    this.stack = this.initialStack;
    this.hand = [];
    this.action = null;
    this.position = Position.OTHER;
  }
}
