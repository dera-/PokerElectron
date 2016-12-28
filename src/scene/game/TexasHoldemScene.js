import BaseScene from '../BaseScene';
import * as BaseStatus from '../../const/BaseStatus';
import * as TexasHoldemStatus from '../../const/game/TexasHoldemStatus';
import * as TexasHoldemAction from '../../const/game/TexasHoldemAction';
import * as BaseAction from '../../const/BaseAction';
import TexasHoldemService from '../../service/game/TexasHoldemService';
import TexasHoldemView from '../../view/game/TexasHoldemView';
import * as PlayerDicision from '../../const/game/PlayerDicision';
import * as MachineStudy from '../../const/game/learn/MachineStudy';
import * as GameMode from '../../const/game/GameMode';
import SceneRepository from '../../repository/SceneRepository';
import GameTitleSceneFactory from '../../factory/start/GameTitleSceneFactory';
import TexasHoldemSceneFactory from '../../factory/game/TexasHoldemSceneFactory';

export default class TexasHoldemScene extends BaseScene {
  initializeTexasHoldemScene(players, initialBlind, stageData, gameMode) {
    return this.initialize(
      {players: players, initialBlind: initialBlind, stageData: stageData},
      {players: players, initialBlind: initialBlind}
    ).then(() => {
      this.gameMode = gameMode;
      this.allyId = players[0].id;
      this.studentId = null;
      if (this.gameMode === GameMode.MODE_STUDY) {
        this.studentId = players[1].id;
      } else if (this.gameMode === GameMode.MODE_AI_BATTLE || this.gameMode === GameMode.MODE_RANDOM_AI_BATTLE) {
        this.studentId = this.allyId;
      }

      if (stageData.hasOwnProperty('next')) {
        this.nextStageKey = stageData.next;
      } else {
        this.nextStageKey = null;
      }
      return this;
    });
  }

  generateService(object = {}) {
    return Promise.resolve(new TexasHoldemService()).then(service => {
      this.service = service;
      return this.service.initializeTexasHoldemService(object.players, object.initialBlind);
    });
  }

  generateViewWithPromise(object = {}) {
    return Promise.resolve(new TexasHoldemView()).then(view => {
      this.view = view;
      return this.view.initializeTexasHoldemView(object.players, object.initialBlind, object.stageData);
    });
  }

  start() {
    super.start();
    this.view.showFirst();
    this.pushStatus(TexasHoldemStatus.STATUS_GAME_START);
  }

  run(status) {
    if (this.isStopStateTransition(status)) {
      return;
    }
    // シーン毎の行動+遷移
    this.popStatus();
    if (status === TexasHoldemStatus.STATUS_GAME_START || status === TexasHoldemStatus.STATUS_GAME_CONTINUE) {
      // ゲーム開始時
      this.service.initializeGame(status === TexasHoldemStatus.STATUS_GAME_CONTINUE);
      this.service.dealCards();
      this.view.setPlayerBetValue();
      this.view.setCallValue(this.service.getBigBlindValue());
      this.view.decidePositionDraw();
      this.view.dealCardsDraw(this.allyId, this.gameMode === GameMode.MODE_STUDY);
      this.pushStatuses([TexasHoldemStatus.STATUS_START_PHASE/*, BaseStatus.STATUS_DRAWING*/]);
    } else if (status === TexasHoldemStatus.STATUS_START_PHASE) {
      // フェーズ開始
      const openedCards = this.service.startPhase();
      this.view.setCardsDraw(openedCards);
      this.view.setPhaseInformation(this.service.getPhaseString());
      this.view.setSubInformation('');
      this.changeStatusByAutomaticTiming(TexasHoldemStatus.STATUS_NEXT_PLAYER);
    } else if (status === TexasHoldemStatus.STATUS_PLAYER_DESIDE) {
      // プレイヤーアクション決定時
      const player = this.service.getCurrentPlayer()
      const action = this.service.getCurrentPlayerAction();
      this.view.actionDraw(player.id, action);
      if (action.name === TexasHoldemAction.FOLD) {
        this.view.foldDraw(player.id);
      }
      this.service.nextActionPlayer();
      this.view.resetOneAction();
      this.changeStatusByAutomaticTiming(TexasHoldemStatus.STATUS_NEXT_PLAYER, 500);
    } else if (status === TexasHoldemStatus.STATUS_AI_THINKING) {
      this.service.decideCurrentPlayerAction();
      const player = this.service.getCurrentPlayer();
      const action = this.service.getCurrentPlayerAction();
      this.view.actionDraw(player.id, action);
      if (action.name === TexasHoldemAction.FOLD) {
        this.view.foldDraw(player.id);
      } else {
        this.view.setCallValue(action.value);
      }
      this.service.nextActionPlayer();
      if (this.studentId !== null && player.id === this.studentId) {
        this.changeStatusByAutomaticTiming(TexasHoldemStatus.STATUS_MOVE_STUDY, 500);
      } else {
        this.changeStatusByAutomaticTiming(TexasHoldemStatus.STATUS_NEXT_PLAYER, 500);
      }
    } else if (status === TexasHoldemStatus.STATUS_MOVE_STUDY) {
      this.view.moveStudyView();
      this.pushStatus(TexasHoldemStatus.STATUS_STUDY);
    } else if (status === TexasHoldemStatus.STATUS_STUDY_RESULT) {
      const study = this.view.getCurrentStudyAction();
      console.log('study_result: ' + study);
      this.view.studySerifsDraw(this.studentId, this.view.getCurrentStudyAction() === MachineStudy.STUDY_PRAISE);
      setTimeout(() => {
        this.view.studySerifsDrawErase();
      }, 1200);
      this.changeStatusByAutomaticTiming(TexasHoldemStatus.STATUS_NEXT_PLAYER, 1200);
    } else if (status === TexasHoldemStatus.STATUS_NEXT_PLAYER) {
      this.service.decideCurrentPlayer();
      // 次のフェーズに移るもしくは1プレイ完了
      if (this.service.isEndCurrentPhase()) {
          this.pushStatus(TexasHoldemStatus.STATUS_NEXT_PHASE);
      } else if (this.service.isAiAction()) {
        this.view.setSubInformation(this.service.getCurrentPlayer().characterData.displayName + 'のアクションです');
        this.pushStatus(TexasHoldemStatus.STATUS_AI_THINKING);
      } else {
        this.view.setSubInformation(this.service.getCurrentPlayer().characterData.displayName + 'のアクションです');
        this.view.resetOneAction();
        this.pushStatus(TexasHoldemStatus.STATUS_PLAYER_THINKING);
      }
    } else if (status === TexasHoldemStatus.STATUS_NEXT_PHASE) {
      // 次のフェーズへ移行
      this.service.collectChipsToPod();
      this.view.setSubInformation('');
      this.view.actionDrawErase();
      this.view.potDraw(this.service.board.getPotValue());
      this.view.resetOnePhase();
      if (this.service.existOnlyOneSurvivor()) {
        this.pushStatuses([TexasHoldemStatus.STATUS_FOLD_END]);
      } else if (false === this.service.isContinueGame()) {
        this.pushStatuses([TexasHoldemStatus.STATUS_SHOWDOWN]);
      } else {
        this.service.moveNextPhase();
        this.service.resetPlayersAction();
        this.pushStatuses([TexasHoldemStatus.STATUS_START_PHASE/*, BaseStatus.STATUS_DRAWING*/]);
      }
    } else if (status === TexasHoldemStatus.STATUS_SHOWDOWN) {
      // リバーまで行ってショーダウンする場合
      console.log('ショーダウン');
      const openedCards = this.service.showdown();
      const winners = this.service.getWinners();
      this.service.sharePodToWinners(winners);
      this.view.changeCharactersExpressionDraw(winners);
      this.view.setPhaseInformation('ショーダウン');
      this.view.ranksDraw(this.service.getPlayerRanks());
      this.view.showDownDraw();
      this.view.setCardsDraw(openedCards);
      this.view.shareChips();
      this.pushStatuses([TexasHoldemStatus.STATUS_JUDGE_CONTINUE_GAME/*, BaseStatus.STATUS_DRAWING*/]);
    } else if (status === TexasHoldemStatus.STATUS_FOLD_END) {
      // ショーダウンせずに勝負が決まる場合
      const winners = this.service.getWinners();
      this.service.sharePodToWinners(winners);
      this.view.changeCharactersExpressionDraw(winners);
      this.view.setPhaseInformation('フォールドエンド');
      this.view.shareChips();
      this.pushStatuses([TexasHoldemStatus.STATUS_JUDGE_CONTINUE_GAME/*, BaseStatus.STATUS_DRAWING*/]);
    } else if (status === TexasHoldemStatus.STATUS_JUDGE_CONTINUE_GAME) {
      this.service.learnForLearnAi();
      this.service.resetPlayersAction();
      this.view.resultDraw(this.service.getChipPots());
      this.service.deleteDeadPlayer();
      if (this.service.isFinished()) {
        this.view.setPhaseInformation('ゲーム終了');
        this.view.gameResultDraw(this.service.isSurvive(this.allyId), this.nextStageKey !== null);
        this.pushStatus(TexasHoldemStatus.STATUS_GAME_END);
      } else {
        this.view.setPhaseInformation('次ゲーム移行中...');
        this.changeStatusByAutomaticTiming(TexasHoldemStatus.STATUS_WAIT_NEXT_GAME, 2000);
      }
    } else if (status === TexasHoldemStatus.STATUS_WAIT_NEXT_GAME) {
      this.service.reset();
      this.view.oneGameDrawErase();
      this.view.resetBoard();
      this.pushStatus(TexasHoldemStatus.STATUS_GAME_CONTINUE);
    }
  }

  isStopStateTransition(status) {
    const targetStatuses = [BaseStatus.STATUS_DRAWING, BaseStatus.STATUS_NONE, BaseStatus.STATUS_WAITING, TexasHoldemStatus.STATUS_PLAYER_THINKING, TexasHoldemStatus.STATUS_GAME_END, TexasHoldemStatus.STATUS_STUDY];
    return targetStatuses.some(target => status === target);
  }

  changeStatusByAutomaticTiming(nextStatus = '', time = 500) {
    if (nextStatus === '') {
      this.pushStatuses([BaseStatus.STATUS_WAITING]);
    } else {
      this.pushStatuses([nextStatus, BaseStatus.STATUS_WAITING]);
    }
    setTimeout(() => {
      if (this.getCurrentStatus() === BaseStatus.STATUS_WAITING) {
        this.popStatus();
      }
    }, time);
  }

  touchEndEvent() {
    const action = this.view.getCurrentAction();
    const status = this.getCurrentStatus();
    const studyStatus = this.view.getCurrentStudyAction();
    if (this.view.isReturnToTitle()) {
      this.view.playSound('exit');
      this.returnToTitle();
    } else if (this.view.isSaveLearnData()) {
      this.view.playSound('save');
      this.saveLearnData();
    } else if (status === BaseStatus.STATUS_WAITING) {
      this.popStatus();
    } else if (status === TexasHoldemStatus.STATUS_PLAYER_THINKING && action !== BaseAction.ACTION_NONE) {
      this.view.playActionSound(action);
      this.service.setCurrentPlayerAction(action, this.view.getCurrentBetValue());
      this.popStatus();
      this.pushStatus(TexasHoldemStatus.STATUS_PLAYER_DESIDE);
    } else if (status === TexasHoldemStatus.STATUS_STUDY && studyStatus !== MachineStudy.STUDY_NONE) {
      this.view.playStudySound(studyStatus);
      this.service.learnDirect(this.studentId, studyStatus);
      this.view.eraseStudyView();
      this.popStatus();
      if (studyStatus === MachineStudy.STUDY_SKIP) {
        this.pushStatus(TexasHoldemStatus.STATUS_NEXT_PLAYER);
      } else {
        this.pushStatus(TexasHoldemStatus.STATUS_STUDY_RESULT);
      }
    } else if (status === TexasHoldemStatus.STATUS_GAME_END) {
      const dicision = this.view.getPlayerDicision();
      if (dicision === PlayerDicision.REPLAY) {
        this.service.reStart();
        this.view.hideSelectWindow();
        this.view.oneGameDrawErase();
        this.view.resetBoard();
        this.popStatus();
        this.pushStatus(TexasHoldemStatus.STATUS_GAME_START);
      } else if (dicision === PlayerDicision.TITLE) {
        this.returnToTitle();
      } else if (dicision === PlayerDicision.NEXT) {
        const beforeScene = null;
        new Promise((resolve,reject) => {
          SceneRepository.popScene();
          resolve(TexasHoldemSceneFactory.generateWithPromise(this.nextStageKey));
        }).then(sceneObject => {
          SceneRepository.pushScene(sceneObject.getScene());
        });
      }
    }
  }

  returnToTitle() {
    GameTitleSceneFactory.generateWithPromise().then(sceneObject => {
      SceneRepository.popScene();
      SceneRepository.pushScene(sceneObject.getScene());
    });
  }

  // TODO:セーブ中の表示が出されるように修正を入れる
  saveLearnData() {
    this.view.saveDraw();
    this.service.saveLearnedResult(this.studentId);
    this.view.saveFinishDraw();
    this.changeStatusByAutomaticTiming();
    this.view.saveDrawErase();
  }
}
