import AiPlayerModel from './AiPlayerModel';
import PokerLearnModel from './learn/PokerLearnModel';
import FileAccess from '../../process/FileAccess';

export default class MachineLearnPlayerModel extends AiPlayerModel {
  constructor(id, money, seatNumber, characterData, dataFilePrefix = '') {
    super(id, money, seatNumber, characterData);
    this.pokerLearnModel = new PokerLearnModel(money, dataFilePrefix);
    this.foldHand = [];
    this.dataFilePrefix = dataFilePrefix;
    const fileContent = FileAccess.readData(this.dataFilePrefix + 'count_data.csv');
    if (fileContent === '') {
      this.teachedCount = 0;
      this.playCount = 0;
      this.winningCount = 0;
      this.foldCount = 0;
      this.rightFoldCount = 0;
    } else {
      const data = fileContent.split(',');
      this.teachedCount = parseInt(data[0], 10);
      this.playCount = parseInt(data[1], 10);
      this.winningCount = parseInt(data[2], 10);
      this.foldCount = parseInt(data[3], 10);
      this.rightFoldCount = parseInt(data[4], 10);
    }
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
    this.foldCount++;
    if (false === isLoose) {
      this.rightFoldCount++;
    }
  }

  setFoldHand() {
    this.foldHand = [];
    this.hand.forEach(card => {
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
    if (this.foldCount === 0) {
      return 0;
    }
    return this.rightFoldCount / this.foldCount;
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
    const data = this.teachedCount + ',' + this.playCount + ',' + this.winningCount + ',' + this.foldCount + ',' + this.rightFoldCount;
    FileAccess.writeDataAsync(data, this.dataFilePrefix + 'count_data.csv');
  }

  saveActionRate() {
    this.pokerLearnModel.setActionValues();
    const rates = this.pokerLearnModel.getActionRates();
    let data = "phase,big_raise,middle_raise,small_raise,call,check,fold\n";
    Object.keys(rates).forEach(function (key) {
      data += key + ',' + rates[key].big_raise + ',' + rates[key].middle_raise + ',' + rates[key].small_raise + ',' + rates[key].call + ',' + rates[key].check + ','+ rates[key].fold + "\n";
    });
    FileAccess.writeDataAsync(data, this.dataFilePrefix + 'action_rate.csv');
  }

  changeInitialiStack(money) {
    super.changeInitialiStack(money);
    this.pokerLearnModel.setInitialStack(money);
  }

  setLearningData(data) {
    this.pokerLearnModel.setQValueMaps(data);
  }
}
