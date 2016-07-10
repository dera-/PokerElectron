import BaseService from '../BaseService';
import * as TexasHoldemPhase from '../../const/game/TexasHoldemPhase';
import * as TexasHoldemAction from '../../const/game/TexasHoldemAction';
import PlayerModel from '../../model/game/PlayerModel';
import AiPlayerModel from '../../model/game/AiPlayerModel';
import DealerModel from '../../model/game/DealerModel';
import BoardModel from '../../model/game/BoardModel';

const NON_EXIST_PLAYER_INDEX = -1;

export default class TexasHoldemService extends BaseService {
  constructor(players, initialBlind) {
    this.players = players;
    this.dealer = new DealerModel((new CardsFactory()).generate());
    this.board = new BoardModel();

    this.phase = TexasHoldemPhase.PHASE_PRE_FLOP;
    this.bigBlind = initialBigBlind;
    this.bbIndex = 0;
    this.currentPlayerIndex = 0;
    this.originalRaiserIndex = NON_EXIST_PLAYER_INDEX;
    this.currentCallValue = 0;
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

  initializeGame() {
    const playerNum = this.players.length;
    this.bbIndex = (this.bbIndex + 1) % this.players.length;
    this.players[this.bbIndex].setAction(NONE, this.bigBlind);
    this.players[(this.bbIndex + playerNum - 1) % playerNum].setAction(NONE, this.bigBlind/2);
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
    //ボードにカードを公開する
    if (this.actionPhase === TexasHoldemPhase.PHASE_FLOP) {
      // とりあえず、バーンカードは無しで。。
      for (let i = 0; i < FROP_CARDS_NUM; i++) {
        this.board.setCard(this.dealer.getNextCard());
      }
    } else if (this.actionPhase === TexasHoldemPhase.PHASE_TURN || this.actionPhase === TexasHoldemPhase.PHASE_RIVER) {
      this.board.setCard(this.dealer.getNextCard());
    }
    // メンバ変数リセット
    this.currentPlayerIndex = this.getInitialPlayerIndex();
    this.originalRaiserIndex = NON_EXIST_PLAYER_INDEX;
    if (this.actionPhase === TexasHoldemPhase.PHASE_PRE_FLOP) {
      this.currentCallValue = this.bigBlind;
    } else {
      this.currentCallValue = 0;
    }
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

  decideCurrentPlayerAction() {
    const currentPlayer = this.players[this.currentPlayerIndex];
    if (currentPlayer instanceof AiPlayerModel) {
      currentPlayer.decideAction(this.actionPhase, this.players[(currentPlayerIndex + 1) % this.players.length], this.board, this.currentCallValue);
      return true
    }
    return false;
  }

  getCurrentPlayerAction() {
    const action = this.players[this.currentPlayerIndex].getAction();
    if (action !== null && action.name === TexasHoldemAction.ACTION_FOLD) {
      player.dumpCards();
    }
    return action;
  }

  isEndCurrentPhase() {
    const lastActionPlayerIndex = (this.getInitialPlayerIndex() + this.players.length - 1) % this.players.length;
    return this.currentPlayerIndex === NON_EXIST_PLAYER_INDEX ||
      this.existOnlyOneSurvivor() ||
      this.players[lastActionPlayerIndex].getAction().name === TexasHoldemAction.ACTION_CHECK;
  }

  nextActionPlayer() {
    // オリジナルレイザーが変わった場合
    currentPlayerAction = this.players[this.currentPlayerIndex].getAction();
    if (currentPlayerAction.name === TexasHoldemAction.ACTION_RAISE ||
      (currentPlayerAction.name === TexasHoldemAction.ACTION_ALLIN && currentPlayerAction.value > currentCallValue)) {
      this.originalRaiserIndex = currentPlayerIndex;
      this.currentCallValue = currentPlayerAction.value;
    }
    this.currentPlayerIndex++;
  }

  moveNextPhase() {
    this.collectChipsToPod();
    this.actionPhase++;
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
}
