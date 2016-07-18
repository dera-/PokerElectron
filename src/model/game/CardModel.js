import {SPADE, HEART, DIAMOND, CLOVER} from '../../const/game/CardSuit';

export default class CardModel {
  constructor(number, suit) {
    this.number = number;
    this.suit = suit;
  }

  getCardImageName() {
    let suitName, numberName;
    switch(this.suit) {
      case SPADE:
        suitName = 's';
        break;
      case HEART:
        suitName = 'h';
        break;
      case DIAMOND:
        suitName = 'd';
        break;
      case CLOVER:
        suitName = 'c';
        break;
    }
    if (this.number === 14) {
      numberName = '01'
    } else if (this.number < 10) {
      numberName = '0' + this.number;
    } else {
      numberName = '' + this.number
    }
    return suitName + numberName + '.png';
  }
}
