import BaseScene from './BaseScene';

export default class TexasHoldemScene extends BaseScene {
  constructor(players, initialBlind) {
    super({players: players, initialBlind: initialBlind});
  }

  generateService(object = {}) {
    return new TexasHoldemService(object.players, object.initialBlind);
  }

  generateView(object = {}) {
    return new BaseView(object.players, object.initialBlind);
  }

  start(status) {

  }

  run(status) {

  }

  end(status) {

  }

  touchStartEvent(action) {

  }

  touchMoveEvent(action) {

  }

  touchEndEvent(action) {

  }
}
