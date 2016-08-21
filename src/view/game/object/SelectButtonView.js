import ObjectView from '../../ObjectView';

export default class SelectButtonView extends ObjectView {
  initializeElements(elements) {
    return new Promise((resolve, reject) => {
      this.name = elements.name;
      this.labels['button_' + this.name].moveTo(
        this.sprites['button_' + this.name].x + 0.05 * this.sprites['button_' + this.name].width,
        this.sprites['button_' + this.name].y + 0.5 * this.sprites['button_' + this.name].height
      );
      this.labels['button_' + this.name].font = '36px sans-serif';
      this.labels['button_' + this.name].color = 'white';
      resolve();
    });
  }

  getSprite() {
    return this.sprites['button_' + this.name];
  }

  showFirst() {
    this.showLabel('button_' + this.name);
    this.showSprite('button_' + this.name);
  }

  changeText(buttonText) {
    this.labels['button_' + this.name].text = buttonText;
  }
}
