import RankCardView from '../../ObjectView';

export default class RankCardView extends ObjectView {
  initializeElements(elements) {
    return new Promise((resolve, reject) => {
      const playerId = elements.player.id;
      this.sprites['rank_card' + playerId].x = elements.x_place + 1.05 * this.sprites['player_card_' + playerId].width;
      this.sprites['rank_card' + playerId].y = elements.y_place + 0.15 * this.sprites['player_card_' + playerId].height;
      this.labels['result_rank' + playerId].moveTo(
        this.sprites['rank_card' + playerId].x + 0.2 * this.sprites['rank_card' + playerId].width,
        this.sprites['rank_card' + playerId].y + 0.3 * this.sprites['rank_card' + playerId].height
      );
      this.labels['result_rank' + playerId].color = 'black';
      this.labels['result_rank' + playerId].font = '36px sans-serif';
      resolve();
    });
  }

  showRank(rank) {
    this.showSprite('rank_card' + rank.id);
    this.labels['result_rank' + rank.id].text = data.rank.getRankName();
    this.showLabel('result_rank' + rank.id);
  }

  hideRank(id) {
    this.hideSprite('rank_card' + id);
    this.labels['result_rank' + id].text = '';
    this.hideLabel('result_rank' + id);
  }
}
