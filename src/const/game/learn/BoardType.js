export const NONE = 0;

export const STRAIGHT_SITUATION = 1;
export const ALL_STRAIGHT_SITUATIONS = [NONE, STRAIGHT_SITUATION];

export const FLUSH_SITUATION = 10;
export const ALL_FLUSH_SITUATIONS = [NONE, FLUSH_SITUATION];

export const SAME_CARDS = 100;
export const ALL_SAME_CARDS = [NONE, SAME_CARDS];

// TODO: 流石にやばいので修正
let getAllBoardPatterns = () => {
  let patterns = [];
  for (let a of ALL_STRAIGHT_SITUATIONS) {
    for (let b of ALL_FLUSH_SITUATIONS) {
      for (let c of ALL_SAME_CARDS) {
        patterns.push(a + b + c);
      }
    }
  }
  return patterns;
};
export const ALL_BOARD_PATTERNS = getAllBoardPatterns();