import BaseService from '../BaseService';

const AgressiveThreshold = 0.7;
const PassiveThreshold = 0.3;
const TightThreshold = 0.7;
const LooseThreshold = 0.3;

export default class AiStatusDisplayService extends BaseService {
  initializeAiStatusDisplayService(player) {
    return new Promise((resolve, reject) => {
      this.player = player;
      resolve();
    });
  }

  getTeachedCount() {
    return this.player.teachedCount;
  }

  getWinningRate() {
    return Math.round(100 * this.player.getWinningRate());
  }

  getRightFoldRate() {
    return Math.round(100 * this.player.getRightFoldRate());
  }

  getBestHand() {
    return this.player.getFavoriteHand();
  }

  getPlayStyle() {
    let style = '';
    const rates = this.player.getActionRates();
    console.log(rates);
    const foldRate = 0.4 * rates.preflop.fold + 0.3 * rates.flop.fold + 0.2 * rates.turn.fold + 0.1 * rates.river.fold;
    const raiseRate =
      (this.getRaiseRate(rates.preflop) + this.getRaiseRate(rates.flop) + this.getRaiseRate(rates.turn) + this.getRaiseRate(rates.river)) / 4;
    console.log("foldRate:" + foldRate);
    console.log("raiseRate:" + raiseRate);
    if (foldRate > TightThreshold) {
      style += 'Tight';
    } else if (foldRate < LooseThreshold) {
      style += 'Loose';
    }
    if (raiseRate > AgressiveThreshold) {
      style += 'Aggresive';
    } else if (raiseRate < PassiveThreshold) {
      style += 'Passive';
    }
    return style;
  }

  getRaiseRate(rateData) {
    return rateData.raise / (rateData.raise + rateData.call + rateData.check);
  }
}
