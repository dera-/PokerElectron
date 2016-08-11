import ObjectView from '../../ObjectView';

export default class PlayerCardView extends ObjectView {
  initializeElements(elements) {
    return new Promise((resolve, reject) => {
      this.playerId = elements.player.id;
      this.initializeSprite('player_card_' + this.playerId, elements.x_place, elements.y_place);
      this.initializeLabel(
        'player_name_' + this.playerId,
        elements.x_place + 0.05 * this.sprites['player_card_' + this.playerId].width,
        elements.y_place + 0.1 * this.sprites['player_card_' + this.playerId].height,
        '20px sans-serif'
      );
      this.initializeLabel(
        'player_stack_' + this.playerId,
        elements.x_place + 0.05 * this.sprites['player_card_' + this.playerId].width,
        elements.y_place + 0.6 * this.sprites['player_card_' + this.playerId].height,
        '20px sans-serif'
      );
      resolve();
    });
  }

  showFirst() {
    this.showAll();
  }

  changeStackText(stackValue) {
    this.labels['player_stack_' + this.playerId].text = '残り：' + stackValue;
  }

  getX() {
    return this.sprites['player_card_' + this.playerId].x;
  }

  getY() {
    return this.sprites['player_card_' + this.playerId].y;
  }

  getWidth() {
    return this.sprites['player_card_' + this.playerId].width;
  }

  getHeight() {
    return this.sprites['player_card_' + this.playerId].height;
  }
}
