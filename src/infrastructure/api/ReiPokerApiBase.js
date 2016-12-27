import config from '../../config/config.json';
import UserRepository from '../../repository/UserRepository';

export default class ReinPokerApiBase {
  constructor(){
    this.url = this.getBaseUrl() + this.getApiName();
  }

  exec(method, body = '') {
    return fetch(this.url, {
      method: method,
      headers: this.getHeaders(),
      body: body,
    }).then(response => {
      return response.json()
    }).catch(err => {
      throw new Error();
    });
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
      'x-access-id': config.api.rein_poker.access-id
      'x-access-token': UserRepository.getUserAccessToken();
    }
  }
}
