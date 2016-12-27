import ReinPokerApiBase from './ReinPokerApiBase';

export default class ReinPokerPlayerAiResultsApi extends ReinPokerApiBase {
  async post(isWin) {
    const json = {
      results: {
        is_win: isWin
      }
    };
    const response = await this.exec('POST', JSON.stringify(json));
    return response;
  }

  getApiName() {
    return 'player-ai/myself/results';
  }
}
