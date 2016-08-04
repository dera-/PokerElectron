import {THREE_SAME_SUITES, TWO_SAME_SUITES, THREE_CONNECTOR, TWO_CONNECTOR, THREE_SAME_CARDS, TWO_SAME_CARDS, ONLY_HIGH_CARDS, LOW_AND_MIDDLE_CARDS, EXIST_ACE} from '../../../const/game/learn/BoardType';
import RankUtil from '../RankUtil';

export default class BoardUtil {
  static getBoardType(board) {
    return BoardUtil.getExistsType(board) + BoardUtil.getCardsType(board) + BoardUtil.getSameCardsType(board) + BoardUtil.getConnectorType(board) + BoardUtil.getSuitesType(board);
  }

  static getSuitesType(board) {
    let threeSameSuites = RankUtil.getFlushRanks(board, 3),
      twoSameSuites = RankUtil.getFlushRanks(board, 2);
    if (threeSameSuites.length > 0) {
      return THREE_SAME_SUITES;
    } else if (twoSameSuites.length > 0) {
      return TWO_SAME_SUITES;
    }
    return 0;
  }

  static getConnectorType(board) {
    if (RankUtil.getStraightRank(board, 3) !== null) {
      return THREE_CONNECTOR;
    } else if (RankUtil.getStraightRank(board, 2) !== null) {
      return TWO_CONNECTOR;
    }
    return 0;
  }

  static getSameCardsType(board) {
    if (RankUtil.getThreeCardRank(board) !== null) {
      return THREE_SAME_CARDS;
    } else if (RankUtil.getPairRank(board) !== null) {
      return TWO_SAME_CARDS;
    }
    return 0;
  }

  static getCardsType(board) {
    if (false === board.some(card => card.number <= 10)) {
      return ONLY_HIGH_CARDS;
    } else if (false === board.some(card => card.number > 10)) {
      return LOW_AND_MIDDLE_CARDS;
    }
    return 0;
  }

  static getExistsType(board) {
    return board.some(card => card.number === 14) ? EXIST_ACE : 0;
  }

  // 現在のボード状態を判定するための即席的なやつ
  static isMatch(boardType, targetType) {
    const digit = String(targetType).length;
    const board = boardType % (10*(digit+1));
    return board - targetType >= 0;
  }
}