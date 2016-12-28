import BaseService from '../BaseService';
import Config from '../../config/conf.json';
import FileAccess from '../../process/FileAccess';
import ReinPokerPlayerApi from '../../infrastructure/api/ReinPokerPlayerApi';
import ReinPokerPlayerLoginApi from '../../infrastructure/api/ReinPokerPlayerLoginApi';
import UserRepository from '../../repository/UserRepository';

export default class LoginService extends BaseService {
  async initializeLoginService(name, serialCode) {
    this.aiData = {name: name, teach_count: 0, hand_count: 0, pot_get_count: 0, fold_count: 0, right_fold_count: 0};
    this.learningData = {};
    this.serialCode = serialCode;
    this.isRegistered = (name === '' && serialCode === '') ? false : true;
    const aiDataStr = await FileAccess.readData(Config.data.player.dir_path + 'ai_count_data.csv');
    this.learningData.pre_flop = await FileAccess.readData(Config.data.player.dir_path + 'ai_pre_flop.csv');
    this.learningData.flop = await FileAccess.readData(Config.data.player.dir_path + 'ai_flop.csv');
    this.learningData.turn = await FileAccess.readData(Config.data.player.dir_path + 'ai_turn.csv');
    this.learningData.river = await FileAccess.readData(Config.data.player.dir_path + 'ai_river.csv');
    if (aiDataStr !== '') {
      const aiCountData = aiDataStr.split(',');
      this.aiData.teach_count = parseInt(aiCountData[0], 10);
      this.aiData.hand_count = parseInt(aiCountData[1], 10);
      this.aiData.pot_get_count = parseInt(aiCountData[2], 10);
      this.aiData.fold_count = parseInt(aiCountData[3], 10);
      this.aiData.right_fold_count = parseInt(aiCountData[4], 10);
    }
  }

  isRegisterd() {
    return this.isRegistered;
  }

  getAiName() {
    return this.aiData.name;
  }

  async login() {
    const loginApi = new ReinPokerPlayerLoginApi();
    console.log(this.serialCode);
    loginApi.setSerialCode(this.serialCode);
    try {
      const result = await loginApi.post(this.aiData, this.learningData);
      UserRepository.setUserAccessToken(result.data);
      return true;
    } catch(err) {
      return false;
    }
  }

  async register(name, serialCode) {
    if (name === '' || serialCode === '') {
      return false;
    }
    const registerApi = new ReinPokerPlayerApi();
    registerApi.setSerialCode(serialCode);
    this.aiData.name = name;
    try {
      const result = await registerApi.post(this.aiData, this.learningData);
      UserRepository.setUserAccessToken(result.data);
      FileAccess.writeDataAsync(name + "\n" + serialCode, Config.data.player.dir_path + 'login.txt');
      return true;
    } catch(err) {
      console.log(err);
      return false;
    }
  }
}
