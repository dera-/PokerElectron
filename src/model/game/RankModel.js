import * as RankStrength from '../../const/game/RankStrength';

export default class RankModel {
  constructor(strength, top, bottom = 0, kickers = [0, 0, 0, 0, 0]) {
    this.strength = strength;
    this.top   = top;
    this.bottom = bottom;
    this.kickers = kickers;
  }

  getRankName() {
    const rank = Math.floor(this.strength);
    switch(rank) {
      case RankStrength.ROYAL_STRAIGHT_FLUSH:
        return 'ROYAL STRAIGHT FLUSH';
      case RankStrength.STRAIGHT_FLUSH:
        return 'STRAIGHT FLUSH';
      case RankStrength.FOUR_CARD:
        return 'FOUR CARD';
      case RankStrength.FULL_HOUSE:
        return 'FULL_HOUSE';
      case RankStrength.FLUSH:
        return 'FLUSH';
      case RankStrength.STRAIGHT:
        return 'STRAIGHT';
      case RankStrength.THREE_CARD:
        return 'THREE_CARD';
      case RankStrength.TWO_PAIR:
        return 'TWO_PAIR';
      case RankStrength.ONE_PAIR:
        return 'ONE_PAIR';
      default:
        return 'NO_PAIR';
    }
  }
}
