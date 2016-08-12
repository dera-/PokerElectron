import ObjectView from '../../ObjectView';
import * as PlayerDicision from '../../../const/game/PlayerDicision';

export default class SelectWindowView extends ObjectView {
  initializeElements(elements) {
    return new Promise((resolve, reject) => {
      this.name = elements.name;
      this.choices = elements.choices;
      this.currentChoice = PlayerDicision.NONE;
      for (let index = 1; index <= this.choices.length; index++) {
        this.initializeSprite('select_' + this.name + '_' + index, elements.x + (index - 1) * elements.outer_interval, elements.y);
        this.initializeLabel(
          'select_' + this.name + '_' + index,
          elements.x + elements.inner_x_interval + (index - 1) * elements.outer_interval,
          elements.y + elements.inner_y_interval,
          elements.font,
          elements.color
        );
      }
      resolve();
    }).then(()=>{
      return this.initializeEvents();
    });
  }

  initializeEvents() {
    return new Promise((resolve, reject) => {
      for (let index = 1; index <= this.choices.length; index++) {
        this.sprites['select_' + this.name + '_' + index].addEventListener('touchend', event => {
          this.currentChoice = this.choices[index - 1]
        });
      }
      resolve();
    });
  }

  showFirst() {
    this.showAll();
  }

  getCurrentChoice() {
    return this.currentChoice;
  }

  resetCurrentChoice() {
    this.currentChoice = PlayerDicision.NONE;
  }

  nextDraw(canGoNext) {
    if (canGoNext) {
      this.labels['select_' + this.name + '_1'].text = '次の対戦へ'
      this.choices[0] = PlayerDicision.NEXT;
    } else {
      this.labels['select_' + this.name + '_1'].text = 'もう一回';
      this.choices[0] = PlayerDicision.REPLAY;
    }
  }
}
