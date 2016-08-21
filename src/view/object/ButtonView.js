import ObjectView from '../ObjectView';
import SpriteFactory from '../../factory/SpriteFactory';

export default class ButtonView extends ObjectView {
  initializeElements(elements) {
    return new Promise((resolve, reject) => {
      this.name = elements.name;
      this.clickFlag = false;
      resolve();
    }).then(() => {
      return this.initializeEvent();
    });
  }

  initializeSprites(sprites, elements) {
    return super.initializeSprites(sprites, elements).then(() => {
      this.sprites[elements.name + '_surface'] = SpriteFactory.getRect(
        this.sprites[elements.name].x,
        this.sprites[elements.name].y,
        this.sprites[elements.name].width,
        this.sprites[elements.name].height,
        "rgba(0, 0, 0, 0)"
      );
      return Promise.resolve();
    });
  }

  initializeLabels(labels, elements) {
    return super.initializeLabels(labels, elements).then(() => {
      this.initializeLabel(
        elements.name,
        this.sprites[elements.name].x + 0.05 * this.sprites[elements.name].width,
        this.sprites[elements.name].y + 0.5 * this.sprites[elements.name].height,
        '36px sans-serif',
        'white'
      );
      return Promise.resolve();
    });
  }

  showFirst() {
    this.showSprite(this.name);
    this.showLabel(this.name);
    this.showSprite(this.name + '_surface');
  }

  initializeEvent() {
    return new Promise((resolve, reject) => {
      this.sprites[this.name + '_surface'].addEventListener('touchend', () => {
        this.clickFlag = true;
      });
      resolve();
    });
  }

  changeText(text) {
    if (this.labels.hasOwnProperty(this.name)) {
      this.labels[this.name].text = text;
    }
  }

  getEventSprite() {
    return this.sprites[this.name + '_surface'];
  }

  isClicked() {
    return this.clickFlag;
  }

  reset() {
    this.clickFlag = false;
  }
}
