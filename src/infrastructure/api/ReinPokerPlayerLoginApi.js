import ReinPokerApiBase from './ReinPokerApiBase';

export default class ReinPokerPlayerLoginApi extends ReinPokerApiBase {
  async post(aiData, learningData) {
    const json = {
      ai_data: aiData,
      learning_data: learningData
    };
    const response = await this.exec('POST', JSON.stringify(json));
    return response;
  }

  setSerialCode(serialCode) {
    this.serialCode = serialCode;
  }

  getApiName() {
    return 'player/login';
  }

  getHeaders() {
    const headers = super.getHeaders();
    if (typeof this.serialCode !== 'undefined') {
      headers['x-serial-code'] = this.serialCode;
    }
    return headers;
  }
}
