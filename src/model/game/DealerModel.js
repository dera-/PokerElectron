export default class DealerModel {
  constructor(cards) {
    this.cards = cards;
    this.index = 0;
    this.shuffleCards();
  }

  shuffleCards() {
    this.index = 0;
    let shuffledCards = [],
      cloneCards = [].concat(this.cards);
    while (cloneCards.length > 0) {
      let index = Math.floor(Math.random() * cloneCards.length);
      shuffledCards.push(cloneCards[index]);
      cloneCards.splice(index, 1);
    }
    this.cards = shuffledCards;
  }

  getNextCard() {
    this.index++;
    return this.cards[this.index-1];
  }
}
