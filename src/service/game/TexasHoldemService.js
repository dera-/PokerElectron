import BaseService from '../BaseService';
import * as TexasHoldemPhase from '../../const/game/TexasHoldemPhase';
import * as TexasHoldemAction from '../../const/game/TexasHoldemAction';
import PlayerModel from '../../model/game/PlayerModel';
import AiPlayerModel from '../../model/game/AiPlayerModel';
import MachineLearnPlayerModel from '../../model/game/MachineLearnPlayerModel';
import DealerModel from '../../model/game/DealerModel';
import BoardModel from '../../model/game/BoardModel';
import RankUtil from '../../util/game/RankUtil'
import CardsFactory from '../../factory/game/CardsFactory';
import * as Position from '../../const/game/Position';
import * as MachineStudy from '../../const/game/learn/MachineStudy';

const NON_EXIST_PLAYER_INDEX = -1;
const FROP_CARDS_NUM = 3;

export default class TexasHoldemService extends BaseService {
  initializeTexasHoldemService(players, initialBlind) {
    return new Promise((resolve, reject) => {
      this.players = players;
      this.copyPlayers = this.players.map(player => player);
      this.dealer = new DealerModel(CardsFactory.generate());
      this.board = new BoardModel();

      this.bigBlind = initialBlind;
      this.bbIndex = 0;
      this.currentPlayerIndex = 0;
      this.originalRaiserIndex = NON_EXIST_PLAYER_INDEX;
      this.currentCallValue = 0;
      this.actionPhase = TexasHoldemPhase.PHASE_PRE_FLOP;
      resolve();
    });
  }

  /**
   * ゲームが終了したかどうかの判定
   */
  isFinished() {
    return this.players.length <= 1;
  }

  /**
   * スタックが0になったプレイヤーをゲーム内から除外する処理
   * TODO: ヘッズアップならこれでいいけど、３人以上のゲームだと次にアクションが始まる位置がおかしなことになるので要修正
   */
  deleteDeadPlayer() {
    this.players = this.players.filter(player => {
      return player.hasChip();
    });
  }

  isSurvive(id) {
    return this.players.some(player => player.id === id);
  }

  reset() {
    this.resetPlayersAction();
    this.board.clear();
  }

  resetPlayersAction(){
    this.players.forEach((player) => {
      player.resetAction();
    });
  }

  initializeGame(next = true) {
    const playerNum = this.players.length;
    this.actionPhase = TexasHoldemPhase.PHASE_PRE_FLOP;
    if (next) {
      this.bbIndex = (this.bbIndex + 1) % playerNum;
    } else {
      this.bbIndex = Math.floor(playerNum * Math.random());
    }
    this.updatePosition();
    this.players[this.bbIndex].setAction(TexasHoldemAction.ACTION_NONE, this.bigBlind);
    if (this.players[this.bbIndex] instanceof AiPlayerModel) {
      this.players[this.bbIndex].fixAction();
    }
    this.players[(this.bbIndex + playerNum - 1) % playerNum].setAction(TexasHoldemAction.ACTION_NONE, this.bigBlind/2);
    if (this.players[(this.bbIndex + playerNum - 1) % playerNum] instanceof AiPlayerModel) {
      this.players[(this.bbIndex + playerNum - 1) % playerNum].fixAction();
    }
  }

  updatePosition() {
    const playerNum = this.players.length;
    if (playerNum === 2) {
      this.players[this.bbIndex].setPosition(Position.BIG_BLIND);
      this.players[(this.bbIndex + playerNum - 1) % playerNum].setPosition(Position.DEALER_FOR_HEADS_UP);
      return;
    }
    for (let index = 0; index < playerNum; index++) {
      if (index === this.bbIndex) {
        this.players[index].setPosition(Position.BIG_BLIND);
      } else if (index === (this.bbIndex + playerNum - 1) % playerNum) {
        this.players[index].setPosition(Position.SMALL_BLIND);
      } else if (index === (this.bbIndex + playerNum - 2) % playerNum) {
        this.players[index].setPosition(Position.DEALER);
      } else {
        this.players[index].setPosition(Position.OTHER);
      }
    }
  }

  dealCards() {
    this.dealer.shuffleCards();
    // 変な配り方しているけど、ロジック部分なので。。
    this.players.forEach((player) => {
        let cards = [this.dealer.getNextCard(), this.dealer.getNextCard()];
        player.setCards(cards);
    });
  }

  startPhase() {
    const openedCards = [];
    //console.log("actionPhase:" + this.actionPhase);
    //ボードにカードを公開する
    if (this.actionPhase === TexasHoldemPhase.PHASE_FLOP) {
      // とりあえず、バーンカードは無しで。。
      for (let i = 0; i < FROP_CARDS_NUM; i++) {
        let card = this.dealer.getNextCard();
        openedCards.push(card);
        this.board.setCard(card);
      }
    } else if (this.actionPhase === TexasHoldemPhase.PHASE_TURN || this.actionPhase === TexasHoldemPhase.PHASE_RIVER) {
      let card = this.dealer.getNextCard();
      openedCards.push(card);
      this.board.setCard(card);
    }
    // メンバ変数リセット
    this.currentPlayerIndex = this.getInitialPlayerIndex();
    this.originalRaiserIndex = NON_EXIST_PLAYER_INDEX;
    if (this.actionPhase === TexasHoldemPhase.PHASE_PRE_FLOP) {
      this.currentCallValue = this.bigBlind;
    } else {
      this.currentCallValue = 0;
    }
    return openedCards;
  }

  getInitialPlayerIndex() {
    const playerNum = this.players.length;
    if (this.actionPhase === TexasHoldemPhase.PHASE_PRE_FLOP) {
      return (this.bbIndex + 1) % playerNum;
    } else if (playerNum === 2) {
      return this.bbIndex;
    } else {
      return (this.bbIndex + playerNum -1) % playerNum;
    }
  }

  decideCurrentPlayer() {
    this.currentPlayerIndex = this.searchNextPlayerIndex(this.currentPlayerIndex, this.originalRaiserIndex, this.currentCallValue);
  }

  getCurrentPlayer() {
    return this.players[this.currentPlayerIndex];
  }

  isAiAction() {
    return this.players[this.currentPlayerIndex] instanceof AiPlayerModel;
  }

  decideCurrentPlayerAction() {
    const currentPlayer = this.players[this.currentPlayerIndex];
    const enemyPlayer = this.players[(this.currentPlayerIndex + 1) % this.players.length];
    currentPlayer.decideAction(this.actionPhase, enemyPlayer, this.board, this.currentCallValue);
    currentPlayer.fixAction(this.bigBlind);
    if (currentPlayer instanceof MachineLearnPlayerModel) {
      currentPlayer.setFoldHand();
    }
  }

  getCurrentPlayerAction() {
    const action = this.players[this.currentPlayerIndex].getAction();
    if (action !== null && action.name === TexasHoldemAction.ACTION_FOLD) {
      this.players[this.currentPlayerIndex].dumpCards();
    }
    return action;
  }

  setCurrentPlayerAction(actionName, value) {
     this.players[this.currentPlayerIndex].setAction(actionName, value);
  }

  isEndCurrentPhase() {
    const lastActionPlayerIndex = (this.getInitialPlayerIndex() + this.players.length - 1) % this.players.length;
    const lastPlayerAction = this.players[lastActionPlayerIndex].getAction();
    return this.currentPlayerIndex === NON_EXIST_PLAYER_INDEX ||
      this.existOnlyOneSurvivor() ||
      (lastPlayerAction!==null && lastPlayerAction.name === TexasHoldemAction.ACTION_CHECK);
  }

  nextActionPlayer() {
    // オリジナルレイザーが変わった場合
    const currentPlayerAction = this.getCurrentPlayerAction();
    //console.log(currentPlayerAction);
    if (currentPlayerAction.name === TexasHoldemAction.ACTION_RAISE ||
      (currentPlayerAction.name === TexasHoldemAction.ACTION_ALLIN && currentPlayerAction.value > this.currentCallValue)) {
      this.originalRaiserIndex = this.currentPlayerIndex;
      this.currentCallValue = currentPlayerAction.value;
      //console.log('raise_value:' + this.currentCallValue);
    }
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
  }

  moveNextPhase() {
    this.actionPhase++;
  }

  showdown() {
    let cards = [];
    while (this.actionPhase < TexasHoldemPhase.PHASE_RIVER) {
      this.actionPhase++;
      cards = cards.concat(this.startPhase());
    }
    return cards;
  }

  existOnlyOneSurvivor() {
    const survivors = this.players.filter((player) => {
      const action = player.getAction();
      return action === null || action.name !== TexasHoldemAction.ACTION_FOLD;
    });
    return survivors.length === 1;
  }

  isContinueGame() {
    if (this.actionPhase === TexasHoldemPhase.PHASE_RIVER) {
      return false;
    }
    const players = this.players.filter((player) => {
      const action = player.getAction();
      return (action === null || (action.name !== TexasHoldemAction.ACTION_FOLD && action.name !== TexasHoldemAction.ACTION_ALLIN));
    });
    return players.length >= 2;
  }

  searchNextPlayerIndex(initialPlayerIndex, originalRaiserIndex, currentCallValue) {
    const playerNum = this.players.length;
    for (let i = 0; i < playerNum; i++) {
      const currentPlayerIndex = (initialPlayerIndex + i) % playerNum;
      const currentPlayer = this.players[currentPlayerIndex];
      const currentPlayerAction = currentPlayer.getAction();
      // オリジナルレイザーまで回ってきたら終了
      if (currentPlayerIndex === originalRaiserIndex) {
        return NON_EXIST_PLAYER_INDEX;
      }
      if (false === currentPlayer.isActive()) {
        continue;
      }
      if (currentPlayerAction === null || currentPlayerAction.name === TexasHoldemAction.ACTION_NONE ||
        (currentPlayerAction.name !== TexasHoldemAction.ACTION_ALLIN && currentPlayerAction.name !== TexasHoldemAction.ACTION_FOLD && currentPlayerAction.value < currentCallValue)
      ) {
        return currentPlayerIndex;
      }
    }
    return NON_EXIST_PLAYER_INDEX;
  }

  collectChipsToPod() {
    this.players.forEach((player)=>{
      let action = player.getAction(),
        value = action === null ? 0 : action.value;
      //console.log(player.id + ':' + value);
      this.board.addChip(player.id, value);
      player.pay(value);
    });
  }

  getWinners() {
    let boardCards = this.board.getOpenedCards(),
      bestRank = RankUtil.getWeakestRank(),
      candidates = this.players.filter(player => player.hasHand()),
      winners = [];
    if (candidates.length === 1) {
      return candidates;
    }
    candidates.forEach((player)=>{
      let rank = player.getRank(boardCards);
      let comparedResult = RankUtil.compareRanks(rank, bestRank);
      if (comparedResult === 1) {
        bestRank = rank;
        winners = [player];
      } else if (comparedResult === 0) {
        winners.push(player);
      }
    });
    return winners;
  }

  sharePodToWinners(winners) {
    let ids = winners.map(player => player.id),
      pots;
    if (winners.length === 1) {
      pots = this.board.getPotForOne(ids[0]);
    } else {
      pots = this.board.getPotForMulti(ids);
    }
    pots.forEach((pot) => {
      this.getPlayer(pot.id).addStack(pot.chip);
    });
  }

  getPlayer(id) {
    let targetPlayers = this.players.filter(player => id === player.id);
    return targetPlayers[0];
  }

  getPlayerRanks() {
    const boardCards = this.board.getOpenedCards();
    return this.players.map(player => {
      return {id: player.id, rank: player.getRank(boardCards)};
    });
  }

  learnDirect(id, studyStatus) {
    this.players.forEach(player => {
      if (player instanceof MachineLearnPlayerModel && player.id === id) {
        const reward = player.getInitialStack();
        if (studyStatus === MachineStudy.STUDY_PRAISE) {
          //console.log('ほめる');
          player.learnDirect(reward);
        } else if (studyStatus === MachineStudy.STUDY_SCOLD) {
          //console.log('しかる');
          player.learnDirect(-1 * reward);
        } else {
          //console.log('何もしない');
        }
      }
    });
  }

  learnForLearnAi() {
    this.players.forEach(player => {
      if (player instanceof MachineLearnPlayerModel) {
        const action = player.getAction();
        if (action !== null && action.name === TexasHoldemAction.ACTION_FOLD) {
          player.learnWhenFold(this.actionPhase, this.board.getPotValue(), this.isWinByHand(player.id));
        } else {
          player.learn(this.board.getPotValue(), false === this.isWinByResult(player.id));
        }
      }
    });
  }

  saveLearnedResult(id = null) {
    this.players.forEach(player => {
      if (player instanceof MachineLearnPlayerModel && (id === null || id === player.id)) {
        player.save();
      }
    });
  }

  isWinByResult(playerId) {
    return this.getWinners().some(player => player.id === playerId);
  }

  isWinByHand(playerId) {
    const boardCards = this.board.getOpenedCards();
    const targetPlayer = this.getPlayer(playerId);
    return false === this.getWinners().some(player => RankUtil.compareRanks(RankUtil.getRank(targetPlayer.getFoldHand(), boardCards), player.getRank(boardCards)) === -1);
  }

  reStart() {
    this.reset();
    this.players = [];
    this.copyPlayers.forEach(player => {
      player.resetAll();
      this.players.push(player);
    });
  }

  getBigBlindValue() {
    return this.bigBlind;
  }

  getChipPots() {
    return this.board.getChipPots();
  }

  getPhaseString() {
    switch (this.actionPhase) {
      case TexasHoldemPhase.PHASE_PRE_FLOP:
        return 'プリフロップ';
      case TexasHoldemPhase.PHASE_FLOP:
        return 'フロップ';
      case TexasHoldemPhase.PHASE_TURN:
        return 'ターン';
      case TexasHoldemPhase.PHASE_RIVER:
        return 'リバー';
      default:
        return '';
    }
  }
}
