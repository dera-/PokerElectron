import AiPlayerModel from './AiPlayerModel';
import PokerLearnModel from './learn/PokerLearnModel';

export default class MachineLearnPlayerModel extends AiPlayerModel {
  constructor(id, money, seatNumber, characterData) {
    super(id, money, seatNumber, characterData);
    this.pokerLearnModel = new PokerLearnModel(money);
    this.foldHand = [];
  }

  // override
  decideAction(actionPhase, enemy, board, callValue) {
    this.action = this.pokerLearnModel.getAction(actionPhase, this, enemy, board, callValue);
  }

  learn(chip, isLoose) {
    console.log('普通に学習');
    this.pokerLearnModel.updateQValues(chip, isLoose);
    this.pokerLearnModel.deleteHistories();
  }

  learnWhenFold(actionPhase, chip, isLoose) {
    console.log('fold時学習');
    this.pokerLearnModel.updateQValue(actionPhase, chip, isLoose);
    this.pokerLearnModel.deleteHistories();
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

  save() {
    this.pokerLearnModel.saveQvaluesData();
  }
}
