import BaseView from '../BaseView';
import ImageRepository from '../ImageRepository';

export default class TexasHoldemView extends BaseView {
  constructor(players, initialBlind) {

  }
  getAction() {
    return 'none';
  }
}
