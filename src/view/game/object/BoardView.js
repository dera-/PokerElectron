import ObjectView from '../../ObjectView';
import Conf from '../../../config/conf.json';

export default class BoardView extends ObjectView {
  initializeElements(elements) {
    return new Promise((resolve, reject) => {
      this.boardCardNums = 0;
      this.centerX = elements.center_x;
      this.centerY = elements.center_y;
      this.longRadius = elements.long_radius;
      this.shortRadius = elements.short_radius;
      this.angleInterval = elements.angle_interval;
      this.labels['pot_value'].moveTo(
        elements.center_x - 0.5 * elements.long_radius,
        elements.center_y - 0.5 * elements.short_radius
      );
      this.labels['pot_value'].color = 'white';
      this.labels['pot_value'].font = '24px sans-serif';
      resolve();
    });
  }

  showFirst() {
    this.showAll();
  }

  // ボードにカードをオープンする描画
  setCardsDraw(cardSprites) {
    const startX = this.sprites['poker_table'].x + 0.25 * Conf.main.width;
    const startY = this.sprites['poker_table'].y + 0.14 * Conf.main.height;
    const interval = 0.03 * Conf.main.width;
    cards.forEach(cardSprite => {
      cardSprite.x = startX + this.boardCardNums * (cardSprite.width + interval);
      cardSprite.y = startY;
      this.addSprite('board_cards_' + this.boardCardNums, cardSprite);
      this.showSprite('board_cards_' + this.boardCardNums);
      this.boardCardNums++;
    });
  }

  decidePositionDraw(dealerIndex) {
    const angle = (90 + this.angleInterval * deelerIndex) % 360;
    this.sprites['deeler_button'].x = this.centerX + 0.9 * this.longRadius * Math.cos((angle + this.angleInterval / 10)  * Math.PI / 180);
    this.sprites['deeler_button'].y = this.centerY + 0.9 * this.shortRadius * Math.sin((angle + this.angleInterval / 10) * Math.PI / 180);
  }

  potDraw(potValue) {
    this.labels['pot_value'].text = '合計賭けチップ：' + potValue;
  }

  cardsDrawErace() {
    for (let i = 0; i < this.boardCardNums; i++) {
      this.hideSprite('board_cards_' + this.boardCardNums);
    }
  }

  reset() {
    this.boardCardNums = 0;
  }
}
