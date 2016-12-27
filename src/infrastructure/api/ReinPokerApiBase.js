import config from '../../config/conf.json';
import UserRepository from '../../repository/UserRepository';

export default class ReinPokerApiBase {
  constructor(){
    this.url = this.getBaseUrl() + this.getApiName();
  }

  async exec(method, body = '') {
    const response = await fetch(this.url, {
      method: method,
      headers: this.getHeaders(),
      body: body
    });
    if (response.status >= 400) {
      throw new Error(response.status + ":" + response.statusText);
    }
    return response;
  }

  getApiName() {
    return '';
  }

  getBaseUrl() {
    return config.api.rein_poker.url;
  }

  getHeaders(){
    return {
      'Content-Type': 'application/json',
      'x-access-id': config.api.rein_poker.access_id,
      'x-access-token': UserRepository.getUserAccessToken()
    };
  }
}
