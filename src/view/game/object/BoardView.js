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
        elements.center_x - 0.2 * elements.long_radius,
        elements.center_y - 0.43 * elements.short_radius
      );
      this.labels['pot_value'].color = 'white';
      this.labels['pot_value'].font = '40px sans-serif';
      this.labels['pot_value'].width = 0.3 * Conf.main.width;
      resolve();
    });
  }

  showFirst() {
    this.showAll();
  }

  // ボードにカードをオープンする描画
  setCardsDraw(cardSprites) {
    const startX = this.sprites['poker_table'].x + 0.175 * Conf.main.width;
    const startY = this.sprites['poker_table'].y + 0.3 * Conf.main.height;
    const interval = 0.03 * Conf.main.width;
    cardSprites.forEach(cardSprite => {
      cardSprite.x = startX + this.boardCardNums * (cardSprite.width + interval);
      cardSprite.y = startY;
      this.addSprite('board_cards_' + this.boardCardNums, cardSprite);
      this.showSprite('board_cards_' + this.boardCardNums);
      this.boardCardNums++;
    });
  }

  decidePositionDraw(x, y) {
    this.sprites['deeler_button'].x = x;
    this.sprites['deeler_button'].y = y;
  }

  potDraw(potValue) {
    this.labels['pot_value'].text = '合計賭けチップ：' + potValue;
  }

  cardsDrawErace() {
    for (let i = 0; i < this.boardCardNums; i++) {
      this.hideSprite('board_cards_' + i);
    }
  }

  reset() {
    this.boardCardNums = 0;
  }
}
