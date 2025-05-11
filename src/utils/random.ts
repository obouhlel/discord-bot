// LCG: Linear Congruential Generator
export default class Random {
  private seed: number;
  private readonly multiplier: number = 1664525;
  private readonly increment: number = 1013904223;
  private readonly modulus: number = 2 ** 32;

  constructor();
  constructor(seed: number);

  constructor(seed?: number) {
    if (!seed) {
      this.seed = Math.round(Math.random() * 1000);
    } else {
      this.seed = seed;
    }
  }

  next(): number {
    this.seed = (this.multiplier * this.seed + this.increment) % this.modulus;
    return this.seed;
  }
}
