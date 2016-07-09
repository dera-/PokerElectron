export default class Board {
  constructor() {
    this.openedCards = [];
    this.chipPots = [];
  }

  getOpenedCards() {
    return this.openedCards;
  }

  setCard(card) {
    this.openedCards.push(card);
  }

  addChip(id, chip) {
    let index;
    for (index = 0; index < this.chipPots.length; index++) {
      if (id === this.chipPots[index].id) {
        break;
      }
    }
    if (index === this.chipPots.length) {
      this.chipPots.push({id: id, chip: chip});
    } else {
      this.chipPots[index].chip += chip;
    }
  }

  getPotForOne(id) {
    let targetPot = this.getPotById(id),
      chip = targetPot.chip,
      totalValue = 0;
    this.chipPots.forEach((pot) => {
      if (id !== pot.id) {
        if (pot.chip <= chip) {
          totalValue += pot.chip;
          pot.chip = 0;
        } else {
          totalValue += chip;
          pot.chip -= chip;
        }
      }
    });
    targetPot.chip += totalValue;
    return this.chipPots;
  }

  getPotForMulti(ids) {
    let totalValue = 0;
    this.chipPots.forEach((pot) => {
      totalValue += pot.chip;
      pot.chip = 0;
    });
    this.chipPots.forEach((pot) => {
      if (ids.indexOf(pot.id) !== -1) {
        pot.chip = Math.round(totalValue / ids.length);
      }
    });
    return this.chipPots;
  }

  getPotById(id) {
    let pots = this.chipPots.filter(pot => id === pot.id);
    return pots[0];
  }

  getPotValue() {
    let totalValue = 0;
    this.chipPots.forEach((pot) => {
      totalValue += pot.chip;
    });
    return totalValue;
  }

  clear() {
    this.openedCards = [];
    this.chipPots = [];
  }
}
