import ObjectView from '../ObjectView';

export default class ButtonView extends ObjectView {
  initializeElements(elements) {
    return new Promise((resolve, reject) => {
      this.name = elements.name;
      this.clickFlag = false;
      resolve();
    }).then(()=>{
      return this.initializeEvent();
    });
  }

  initializeEvent() {
    return new Promise((resolve, reject) => {
      this.sprites[this.name].addEventListener('touchend', () => {
        this.clickFlag = true;
      });
      resolve();
    });
  }

  isClicked() {
    return this.clickFlag;
  }

  reset() {
    this.clickFlag = false;
  }
}
