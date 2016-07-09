// viewクラスのインターフェース的なサムシング
export default class BaseView {
  getAction() {
    return 'none';
  }
  // メソッドがないとes6->es5の時にでエラーが出るため
  toString() {
    return 'BaseView';
  }
}