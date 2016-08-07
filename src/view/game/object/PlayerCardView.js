import ObjectView from '../../ObjectView';

export default class PlayerCardView extends ObjectView {
  initializeElements(elements) {
    return new Promise((resolve, reject) => {
      const playerId = elements.player.id;
      this.sprites['player_card_' + playerId].x = elements.x_place;
      this.sprites['player_card_' + playerId].y = elements.y_place;
      this.labels['player_name_' + playerId].moveTo(
        elements.x_place + 0.05 * this.sprites['player_card_' + playerId].width,
        elements.y_place + 0.1 * this.sprites['player_card_' + playerId].height
      );
      this.labels['player_name_' + playerId].font = '16px sans-serif';
      this.labels['player_stack_' + playerId].moveTo(
        elements.x_place + 0.05 * this.sprites['player_card_' + playerId].width,
        elements.y_place + 0.6 * this.sprites['player_card_' + playerId].height
      );
      this.labels['player_stack_' + playerId].font = '16px sans-serif';
      resolve();
    });
  }

  showFirst() {
    this.showAll();
  }

  getX() {
    return this.sprites['player_card_' + playerId].x;
  }

  getY() {
    return this.sprites['player_card_' + playerId].y;
  }

  getWidth() {
    return this.sprites['player_card_' + playerId].width;
  }

  getHeight() {
    return this.sprites['player_card_' + playerId].height;
  }
}
