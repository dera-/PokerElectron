export const NONE = 0;

export const TWO_SAME_SUITES = 1;
export const THREE_SAME_SUITES = 2;
export const FOUR_SAME_SUITES = 3;
export const FIVE_SAME_SUITES = 4; // レアケース
export const ALL_SAME_SUITES = [NONE, TWO_SAME_SUITES, THREE_SAME_SUITES];

export const TWO_CONNECTOR = 10;
export const THREE_CONNECTOR = 20;
export const FOUR_CONNECTOR = 30;
export const FIVE_CONNECTOR = 40; // レアケース
export const ONLY_ONE_GAP = 50;
export const ALL_CONNECTORS = [NONE, TWO_CONNECTOR, THREE_CONNECTOR];

export const TWO_SAME_CARDS = 100;
export const THREE_SAME_CARDS = 200;
export const FOUR_SAME_CARDS = 300; // レアケース
export const TWO_AND_TWO_SAME_CARDS = 400;
export const THREE_AND_TWO_SAME_CARDS = 500; // レアケース
export const ALL_SAME_CARDS = [NONE, TWO_SAME_CARDS, THREE_SAME_CARDS];

export const ONLY_LOW_CARDS = 1000;
export const ONLY_MIDDLE_CARDS = 2000;
export const ONLY_HIGH_CARDS = 3000;
export const LOW_AND_MIDDLE_CARDS = 4000;
export const HIGH_AND_MIDDLE_CARDS = 5000;
export const HIGH_AND_LOW_CARDS = 6000;
export const ALL_CARDS = [NONE, ONLY_HIGH_CARDS, LOW_AND_MIDDLE_CARDS];

export const EXIST_ACE = 10000;
export const ALL_EXISTS = [NONE, EXIST_ACE];

// TODO: 流石にやばいので修正
let getAllBoardPatterns = () => {
  let patterns = [];
  for (let a of ALL_SAME_SUITES) {
    for (let b of ALL_CONNECTORS) {
      for (let c of ALL_SAME_CARDS) {
        for (let d of ALL_CARDS) {
          for (let e of ALL_EXISTS) {
            patterns.push(a + b + c + d + e);
          }
        }
      }
    }
  }
  return patterns;
};
export const ALL_BOARD_PATTERNS = getAllBoardPatterns();