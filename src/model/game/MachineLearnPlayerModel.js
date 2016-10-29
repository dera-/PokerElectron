import AiPlayerModel from './AiPlayerModel';
import PokerLearnModel from './learn/PokerLearnModel';

export default class MachineLearnPlayerModel extends AiPlayerModel {
  constructor(id, money, seatNumber, characterData, dataFilePrefix = '') {
    super(id, money, seatNumber, characterData);
    this.pokerLearnModel = new PokerLearnModel(money, dataFilePrefix);
    this.foldHand = [];
    this.teachedCount = 0;
    this.playCount = 0;
    this.winningCount = 0;
    this.rightFoldCount = 0;
  }

  // override
  decideAction(actionPhase, enemy, board, callValue) {
    this.action = this.pokerLearnModel.getAction(actionPhase, this, enemy, board, callValue);
  }

  learnDirect(reward) {
    //this.pokerLearnModel.updateCurrentSimilarQValues(reward);
    this.teachedCount++;
    console.log('direct_learn:' + this.teachedCount);
  }

  learn(chip, isLoose) {
    this.pokerLearnModel.updateQValues(chip, isLoose);
    this.pokerLearnModel.deleteHistories();
    this.playCount++;
    if (false === isLoose) {
      this.winningCount++;
    }
  }

  learnWhenFold(actionPhase, chip, isLoose) {
    this.pokerLearnModel.updateQValue(actionPhase, chip, isLoose);
    this.pokerLearnModel.deleteHistories();
    this.playCount++;
    if (false === isLoose) {
      this.rightFoldCount++;
    }
  }

  setFoldHand() {
    this.foldHand = [];
    this.hand.forEach(card=>{
      this.foldHand.push(card);
    })
  }

  getFoldHand() {
    return this.foldHand;
  }

  getWinningRate() {
    if (this.playCount === 0) {
      return 0;
    }
    return this.winningCount / this.playCount;
  }

  getRightFoldRate() {
    if (this.playCount === 0) {
      return 0;
    }
    return this.rightFoldCount / this.playCount;
  }

  getFavoriteHand() {
    this.pokerLearnModel.setBestPreFlopStateId();
    return this.pokerLearnModel.getFavoriteHand();
  }

  getActionRates() {
    this.pokerLearnModel.setActionValues();
    return  this.pokerLearnModel.getActionRates();
  }

  save() {
    this.pokerLearnModel.saveQvaluesData();
  }

  changeInitialiStack(money) {
    super.changeInitialiStack(money);
    this.pokerLearnModel.setInitialStack(money);
  }
}
