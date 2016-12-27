import LoginScene from '../../scene/start/LoginScene';
import UserRepository from '../../repository/UserRepository';

export default class LoginSceneFactory {
  static generateWithPromise() {
    return new Promise((resolve) => {
      resolve(UserRepository.getLoginData());
    }).then((loginData)=>{
      const scene = new LoginScene();
      return scene.initializeLoginScene(loginData);
    });
  }
}
