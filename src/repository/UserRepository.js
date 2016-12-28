import FileAccess from '../process/FileAccess';
import Config from '../config/conf.json';

let userAccessToken = '';

export default class UserRepository {
  static async getLoginData() {
    const userDataStr = await FileAccess.readData(Config.data.player.dir_path + 'login.txt');
    if (userDataStr !== '') {
      const data = userDataStr.split("\n");
      return {name: data[0], serial_code: data[1]};
    }
    return {name: '', serial_code: ''};
  }

  static isLogin() {
    // TODO いずれは実際にAPI叩くようにしたいが、今はローカルの値を見るくらいで。。
    return userAccessToken !== '';
  }

  static setUserAccessToken(token) {
    userAccessToken = token;
  }

  static getUserAccessToken() {
    return userAccessToken;
  }
}
