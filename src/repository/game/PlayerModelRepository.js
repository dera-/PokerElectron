import PlayerModelFactory from '../../factory/game/PlayerModelFactory';
import ReinPokerPlayerAiRandomApi from '../../infrastructure/api/ReinPokerPlayerAiRandomApi';

const players = {};
export default class PlayerModelRepository {
  static register(key) {
    players[key] = PlayerModelFactory.generate(key);
  }

  static get(key, stack, seatNumber) {
    let player;
    if (players.hasOwnProperty(key)) {
      player = players[key];
    } else {
      player = PlayerModelFactory.generate(key);
      players[key] = player;
    }
    player.changeInitialiStack(stack);
    player.setStack(stack);
    player.setSeatNumber(seatNumber);
    return player;
  }

  static async getFromRandomApi(stack, seatNumber) {
    const player = PlayerModelRepository.get('online_random_ai', stack, seatNumber);
    const randomApi = new ReinPokerPlayerAiRandomApi();
    const response = await randomApi.get();
    // TODO 戦績が閲覧可能になったら、教えた回数とかも見られるようにする
    player.setDisplayName(response.data.name);
    player.setLearningData(response.data);
    return player;
  }

  static delete(key) {
    if (players.hasOwnProperty(key)) {
      delete players[key];
    }
  }
}