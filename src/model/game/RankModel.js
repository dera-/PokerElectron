export default class Rank {
  constructor(strength, top, bottom = 0, kickers = [0, 0, 0]) {
    this.strength = strength;
    this.top   = top;
    this.bottom = bottom;
    this.kickers = kickers;
  }
}
