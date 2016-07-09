import Card from './Card';
import RankUtil from '../util/RankUtil';

export default class Player {
  constructor(id, money) {
    this.id = id;
    this.stack = money;
    this.hand = [];
  }

  setStack(money) {
      this.stack = money;
  }

  hasHand() {
    return this.hand.length > 0
  }

  isAlive() {
    return this.stack > 0;
  }

  isActive() {
    return this.hand.length > 0 && this.stack > 0;
  }

  setCards(cards) {
    this.hand = cards;
  }

  clear() {
    this.hand = [];
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

  getRank(openedCards) {
    return RankUtil.getRank(this.hand, openedCards);
  }

  getHand() {
    return this.hand;
  }

  printHand() {
    console.log('id'+this.id+'のハンド：'+this.hand[0].number+this.hand[0].suit+','+this.hand[1].number+this.hand[1].suit);
  }

  printStack() {
    console.log('id'+this.id+'の残りスタック：'+this.stack);
  }

  printRank(openedCards) {
    let rank = this.getRank(openedCards);
    console.log('id'+this.id+'の役：'+ rank.strength);
  }
}
