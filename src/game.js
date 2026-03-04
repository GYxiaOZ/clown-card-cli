// 游戏主逻辑
import { Deck, Hand } from './cards.js';
import { HandEvaluator, HAND_TYPES } from './handEvaluator.js';
import { Joker, getRandomJoker } from './jokers.js';

export class GameState {
  constructor() {
    this.round = 1;
    this.ante = 1;
    this.money = 4;
    this.handsRemaining = 4;
    this.discardsRemaining = 3;
    this.score = 0;
    this.scoreRequired = this.getScoreRequired();

    this.deck = new Deck();
    this.hand = new Hand();
    this.jokers = [new Joker('JOKER')];
    this.maxJokers = 5;

    this.isFirstHand = true;
  }

  getScoreRequired() {
    return 300 + (this.ante - 1) * 100 + (this.round - 1) * 50;
  }

  drawInitialHand() {
    const cards = this.deck.draw(8);
    this.hand.addCards(cards);
    this.hand.sortByRank();
    this.isFirstHand = true;
  }

  playHand(selectedIndices) {
    if (this.handsRemaining <= 0) return null;

    const selectedCards = selectedIndices.map(i => this.hand.cards[i]);
    const handResult = HandEvaluator.evaluate(selectedCards);

    if (!handResult) return null;

    const state = {
      hand: selectedCards,
      handResult,
      money: this.money,
      discardsRemaining: this.discardsRemaining,
      jokerCount: this.jokers.length,
      isFirstHand: this.isFirstHand
    };

    let chipBonus = 0;
    let multBonus = 0;
    let multMult = 1;
    let scoreMult = 1;

    // 先处理"哎呀!"的特殊效果（给其他小丑牌+6倍率）
    const hasOops = this.jokers.some(j => j.id === 'oops');
    const extraMultFromOops = hasOops ? (this.jokers.length - 1) * 6 : 0;

    for (const joker of this.jokers) {
      const effect = joker.applyEffect(state);
      chipBonus += effect.chipBonus || 0;
      multBonus += effect.multBonus || 0;
      if (effect.multMult !== undefined) {
        multMult = effect.multMult; // 赌徒效果覆盖式
      }
      if (effect.scoreMult !== undefined) {
        scoreMult = effect.scoreMult; // 幻影效果覆盖式
      }
    }

    multBonus += extraMultFromOops;

    const totalChips = handResult.chips + chipBonus + selectedCards.reduce((sum, c) => sum + (c.bonusChips || 0), 0);
    let totalMult = handResult.mult + multBonus + selectedCards.reduce((sum, c) => sum + (c.bonusMult || 0), 0);
    totalMult = Math.max(1, totalMult) * multMult;
    let roundScore = totalChips * Math.max(1, totalMult);
    roundScore = Math.floor(roundScore * scoreMult);

    this.score += roundScore;
    this.handsRemaining--;

    this.hand.removeCards(selectedIndices.sort((a, b) => b - a));
    const newCards = this.deck.draw(selectedIndices.length);
    this.hand.addCards(newCards);
    this.hand.sortByRank();

    this.isFirstHand = false;

    return {
      handResult,
      chips: totalChips,
      mult: totalMult,
      score: roundScore
    };
  }

  discard(indices) {
    if (this.discardsRemaining <= 0) return false;

    const removed = this.hand.removeCards(indices.sort((a, b) => b - a));
    this.deck.discard(removed);

    const newCards = this.deck.draw(indices.length);
    this.hand.addCards(newCards);
    this.hand.sortByRank();

    this.discardsRemaining--;
    return true;
  }

  isRoundComplete() {
    return this.score >= this.scoreRequired || this.handsRemaining <= 0;
  }

  isVictory() {
    return this.score >= this.scoreRequired;
  }

  nextRound() {
    if (!this.isVictory()) return false;

    this.round++;
    if (this.round % 3 === 1 && this.round > 1) {
      this.ante++;
    }

    this.money += 3 + this.ante;
    this.handsRemaining = 4;
    this.discardsRemaining = 3;
    this.score = 0;
    this.scoreRequired = this.getScoreRequired();

    this.deck = new Deck();
    this.hand = new Hand();
    this.drawInitialHand();

    return true;
  }

  buyJoker(joker) {
    if (this.money < joker.cost) return false;
    if (this.jokers.length >= this.maxJokers) return false;

    this.money -= joker.cost;
    this.jokers.push(joker);
    return true;
  }

  sellJoker(index) {
    if (index < 0 || index >= this.jokers.length) return null;

    const joker = this.jokers[index];
    const sellPrice = Math.max(1, Math.floor(joker.cost / 3));
    this.money += sellPrice;
    this.jokers.splice(index, 1);
    return { joker, sellPrice };
  }
}
