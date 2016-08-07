import ObjectView from '../../ObjectView';

export default class PlayerCardView extends ObjectView {
  initializeElements(elements) {
    return new Promise((resolve, reject) => {
      this.playerId = elements.player.id;
      this.sprites['player_card_' + this.playerId].x = elements.x_place;
      this.sprites['player_card_' + this.playerId].y = elements.y_place;
      this.labels['player_name_' + this.playerId].moveTo(
        elements.x_place + 0.05 * this.sprites['player_card_' + this.playerId].width,
        elements.y_place + 0.1 * this.sprites['player_card_' + this.playerId].height
      );
      this.labels['player_name_' + this.playerId].font = '16px sans-serif';
      this.labels['player_stack_' + this.playerId].moveTo(
        elements.x_place + 0.05 * this.sprites['player_card_' + this.playerId].width,
        elements.y_place + 0.6 * this.sprites['player_card_' + this.playerId].height
      );
      this.labels['player_stack_' + this.playerId].font = '16px sans-serif';
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
