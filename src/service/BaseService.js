// serviceクラスのインターフェース的なサムシング
export default class BaseService {
  getStatus() {
    return 'none';
  }
  // メソッドがないとes6->es5の時にでエラーが出るため
  toString() {
    return 'BaseService';
  }
}
