import ReinPokerApiBase from './ReinPokerApiBase';

export default class ReinPokerPlayerAiRandomApi extends ReinPokerApiBase {
  async get() {
    const response = await this.exec('GET');
    return response;
  }

  getApiName() {
    return 'player-ai/random';
  }
}
