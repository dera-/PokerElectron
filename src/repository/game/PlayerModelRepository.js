import PlayerModelFactory from '../../factory/game/PlayerModelFactory';

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

  static delete(key) {
    if (players.hasOwnProperty(key)) {
      delete players[key];
    }
  }
}