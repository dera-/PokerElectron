import config from '../../config/conf.json';
import UserRepository from '../../repository/UserRepository';
import ApiError from '../../exception/ApiError';

export default class ReinPokerApiBase {
  constructor(){
    this.url = this.getBaseUrl() + this.getApiName();
  }

  async exec(method, body = '') {
    const requestData = {
      method: method,
      headers: this.getHeaders()
    };
    if (body !== '') {
      requestData['body'] = body;
    }
    const response = await fetch(this.url, requestData);
    if (response.status >= 400) {
      throw new ApiError(response.statusText, response.status);
    }
    return response.json();
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
      'Accept': 'application/json',
      'x-access-id': config.api.rein_poker.access_id,
      'x-access-token': UserRepository.getUserAccessToken()
    };
  }
}
