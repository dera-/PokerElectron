import ObjectView from '../../ObjectView';

export default class RankCardView extends ObjectView {
  initializeElements(elements) {
    return new Promise((resolve, reject) => {
      this.playerId = elements.player.id;
      this.sprites['rank_card' + this.playerId].x = elements.x_place + 1.05 * elements.player_card_width;
      this.sprites['rank_card' + this.playerId].y = elements.y_place + 0.15 * elements.player_card_height;
      this.labels['result_rank' + this.playerId].moveTo(
        this.sprites['rank_card' + this.playerId].x + 0.2 * this.sprites['rank_card' + this.playerId].width,
        this.sprites['rank_card' + this.playerId].y + 0.3 * this.sprites['rank_card' + this.playerId].height
      );
      this.labels['result_rank' + this.playerId].color = 'black';
      this.labels['result_rank' + this.playerId].font = '36px sans-serif';
      resolve();
    });
  }

  showRank(data) {
    this.showSprite('rank_card' + this.playerId);
    this.labels['result_rank' + this.playerId].text = data.rank.getRankName();
    this.showLabel('result_rank' + this.playerId);
  }

  hideRank() {
    this.hideSprite('rank_card' + this.playerId);
    this.labels['result_rank' + this.playerId].text = '';
    this.hideLabel('result_rank' + this.playerId);
  }
}
