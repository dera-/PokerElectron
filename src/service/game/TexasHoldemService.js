import BaseService from '../BaseService';
import * as TexasHoldemPhase from '../../const/game/TexasHoldemPhase';
import * as TexasHoldemAction from '../../const/game/TexasHoldemAction';
import PlayerModel from '../../model/game/PlayerModel';
import AiPlayerModel from '../../model/game/AiPlayerModel';
import DealerModel from '../../model/game/DealerModel';
import BoardModel from '../../model/game/BoardModel';
import RanlUtil from '../../util/game/RankUtil'
import CardsFactory from '../../factory/game/CardsFactory';

const NON_EXIST_PLAYER_INDEX = -1;
const HAND_CARDS_NUM = 2;
const FROP_CARDS_NUM = 3;

export default class TexasHoldemService extends BaseService {

  initializeTexasHoldemService(players, initialBlind) {
    return new Promise((resolve, reject)=>{
      this.players = players;
      this.dealer = new DealerModel(CardsFactory.generate());
      this.board = new BoardModel();

      this.phase = TexasHoldemPhase.PHASE_PRE_FLOP;
      this.bigBlind = initialBlind;
      this.bbIndex = 0;
      this.currentPlayerIndex = 0;
      this.originalRaiserIndex = NON_EXIST_PLAYER_INDEX;
      this.currentCallValue = 0;
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
    this.players = this.players.filter((player) => {
      return player.isAlive();
    });
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
    if (next) {
      this.bbIndex = (this.bbIndex + 1) % playerNum;
    } else {
      this.bbIndex = Math.floor(playerNum * Math.round());
    }
    this.players[this.bbIndex].setAction(TexasHoldemAction.NONE, this.bigBlind);
    this.players[(this.bbIndex + playerNum - 1) % playerNum].setAction(TexasHoldemAction.NONE, this.bigBlind/2);
  }

  dealCards() {
    this.dealer.shuffleCards();
    // 変な配り方しているけど、ロジック部分なので。。
    this.players.forEach((player) => {
      for (let i = 0; i < HAND_CARDS_NUM; i++) {
        let cards = [this.dealer.getNextCard(), this.dealer.getNextCard()];
        player.setCards(cards);
      }
    });
  }

  startPhase() {
    const openedCards = [];
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
  }

  getCurrentPlayerAction() {
    const action = this.players[this.currentPlayerIndex].getAction();
    if (action !== null && action.name === TexasHoldemAction.ACTION_FOLD) {
      player.dumpCards();
    }
    return action;
  }

  setCurrentPlayerAction(actionName, value) {
     this.players[this.currentPlayerIndex].setAction(actionName, value);
  }

  isEndCurrentPhase() {
    const lastActionPlayerIndex = (this.getInitialPlayerIndex() + this.players.length - 1) % this.players.length;
    return this.currentPlayerIndex === NON_EXIST_PLAYER_INDEX ||
      this.existOnlyOneSurvivor() ||
      this.players[lastActionPlayerIndex].getAction().name === TexasHoldemAction.ACTION_CHECK;
  }

  nextActionPlayer() {
    // オリジナルレイザーが変わった場合
    const currentPlayerAction = this.getCurrentPlayerAction();
    if (currentPlayerAction.name === TexasHoldemAction.ACTION_RAISE ||
      (currentPlayerAction.name === TexasHoldemAction.ACTION_ALLIN && currentPlayerAction.value > currentCallValue)) {
      this.originalRaiserIndex = this.currentPlayerIndex;
      this.currentCallValue = currentPlayerAction.value;
    }
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
  }

  moveNextPhase() {
    this.collectChipsToPod();
    this.actionPhase++;
  }

  showdown() {
    while (this.actionPhase < TexasHoldemPhase.PHASE_RIVER) {
      this.actionPhase++;
      startPhase();
    }
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
      if (
        currentPlayerAction === null || currentPlayerAction.name === TexasHoldemAction.ACTION_NONE ||
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
      this.board.addChip(player.id, value);
      player.pay(value);
    });
  }

  getWinners() {
    let boardCards = this.board.getOpenedCards(),
      bestRank = RankUtil.getWeakestRank(),
      candidates = this.players.filter(player => player.hasHand()),
      winners = [];
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
    return targetPlayers[0].getPlayer();
  }

  isWin(playerHand, targetHand) {
    let boardCards = this.board.getOpenedCards();
    return RankUtil.compareRanks(RankUtil.getRank(playerHand, boardCards), RankUtil.getRank(targetHand, boardCards)) !== -1;
  }

  getBigBlindValue() {
    return this.bigBlind;
  }

  getBigBlindIndex() {
    return this.bbIndex;
  }

}