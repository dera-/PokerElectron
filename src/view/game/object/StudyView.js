import ObjectView from '../../ObjectView';
import * as MachineStudy from '../../../const/game/learn/MachineStudy';
import ButtonView from '../../object/ButtonView';

export default class StudyView extends ObjectView {
  initializeElements(elements) {
    return new Promise((resolve, reject) => {
      this.praiseButtonView = new ButtonView();
      resolve(this.praiseButtonView.initialize({praise: this.sprites['praise']}, {praise: new Label('ほめる')}, {name: 'praise'}));
    }).then(() => {
      this.scoldButtonView = new ButtonView();
      return this.scoldButtonView.initialize({scold: this.sprites['scold']}, {scold: new Label('しかる')}, {name: 'scold'});
    }).then(()=>{
      this.skipButtonView = new ButtonView();
      return this.skipButtonView.initialize({skip: this.sprites['skip']}, {skip: new Label('スキップ')}, {name: 'skip'});
    }).then(()=>{
      this.removeSprite('praise');
      this.removeSprite('scold');
      this.removeSprite('skip');
      return Promise.resolve();
    });
  }

  showFirst() {
    this.praiseButtonView.showFirst();
    this.scoldButtonView.showFirst();
    this.skipButtonView.showFirst();
  }

  hideAll() {
    this.praiseButtonView.hideAll();
    this.scoldButtonView.hideAll();
    this.skipButtonView.hideAll();
  }

  getStudyStatus() {
    if (this.praiseButtonView.isClicked()) {
      return MachineStudy.STUDY_PRAISE;
    } else if (this.scoldButtonView.isClicked()) {
      return MachineStudy.STUDY_SCOLD;
    } else if (this.skipButtonView.isClicked()) {
      return MachineStudy.STUDY_SKIP;
    } else {
      return MachineStudy.STUDY_NONE;
    }
  }

  resetStudyStatus() {
    this.praiseButtonView.reset();
    this.scoldButtonView.reset();
    this.skipButtonView.reset();
  }
}
