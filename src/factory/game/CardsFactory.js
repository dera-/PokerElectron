import {SPADE, HEART, DIAMOND, CLOVER} from '../../const/game/CardSuit';
import CardModel from '../../model/game/CardModel';

export default class CardsFactory {
  static generate() {
    let minNum = 2,
      maxNum = 14,
      suits = [SPADE, HEART, DIAMOND, CLOVER],
      cards = [];
    for (let index = minNum; index < maxNum; index++) {
      suits.forEach((suit) => {
        cards.push(new CardModel(index, suit));
      });
    }
    return cards;
  }
}
