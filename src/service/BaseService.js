// serviceクラスのインターフェース的なサムシング
export default class BaseService {
  // メソッドがないとes6->es5の時にでエラーが出るため
  toString() {
    return 'BaseService';
  }
}
