// 牌型判断系统
import { RANK_VALUES } from './cards.js';

export const HAND_TYPES = {
  HIGH_CARD: { name: '高牌', chips: 5, mult: 1, order: 0 },
  PAIR: { name: '对子', chips: 10, mult: 2, order: 1 },
  TWO_PAIR: { name: '两对', chips: 20, mult: 2, order: 2 },
  THREE_OF_A_KIND: { name: '三条', chips: 30, mult: 3, order: 3 },
  STRAIGHT: { name: '顺子', chips: 30, mult: 4, order: 4 },
  FLUSH: { name: '同花', chips: 35, mult: 4, order: 5 },
  FULL_HOUSE: { name: '葫芦', chips: 40, mult: 4, order: 6 },
  FOUR_OF_A_KIND: { name: '炸弹', chips: 60, mult: 7, order: 7 },
  STRAIGHT_FLUSH: { name: '同花顺', chips: 100, mult: 8, order: 8 },
  ROYAL_FLUSH: { name: '皇家同花顺', chips: 100, mult: 8, order: 9 },
  FIVE_OF_A_KIND: { name: '五同', chips: 120, mult: 12, order: 10 }
};

export class HandEvaluator {
  static evaluate(cards) {
    if (cards.length < 1) return null;

    const sorted = [...cards].sort((a, b) => b.value - a.value);
    const rankCounts = this.getRankCounts(sorted);
    const suitCounts = this.getSuitCounts(sorted);

    const results = [];

    const fiveOfAKind = this.checkFiveOfAKind(rankCounts, sorted);
    if (fiveOfAKind) results.push(fiveOfAKind);

    const royalFlush = this.checkRoyalFlush(sorted, suitCounts);
    if (royalFlush) results.push(royalFlush);

    const straightFlush = this.checkStraightFlush(sorted, suitCounts);
    if (straightFlush) results.push(straightFlush);

    const fourOfAKind = this.checkFourOfAKind(rankCounts, sorted);
    if (fourOfAKind) results.push(fourOfAKind);

    const fullHouse = this.checkFullHouse(rankCounts, sorted);
    if (fullHouse) results.push(fullHouse);

    const flush = this.checkFlush(suitCounts, sorted);
    if (flush) results.push(flush);

    const straight = this.checkStraight(sorted);
    if (straight) results.push(straight);

    const threeOfAKind = this.checkThreeOfAKind(rankCounts, sorted);
    if (threeOfAKind) results.push(threeOfAKind);

    const twoPair = this.checkTwoPair(rankCounts, sorted);
    if (twoPair) results.push(twoPair);

    const pair = this.checkPair(rankCounts, sorted);
    if (pair) results.push(pair);

    if (results.length > 0) {
      return results.sort((a, b) => HAND_TYPES[b.type].order - HAND_TYPES[a.type].order)[0];
    }

    return {
      type: 'HIGH_CARD',
      primaryCard: sorted[0],
      cards: [sorted[0]],
      chips: HAND_TYPES.HIGH_CARD.chips,
      mult: HAND_TYPES.HIGH_CARD.mult
    };
  }

  static getRankCounts(cards) {
    const counts = {};
    for (const card of cards) {
      counts[card.rank] = (counts[card.rank] || 0) + 1;
    }
    return counts;
  }

  static getSuitCounts(cards) {
    const counts = {};
    for (const card of cards) {
      counts[card.suit] = (counts[card.suit] || 0) + 1;
    }
    return counts;
  }

  static checkFiveOfAKind(rankCounts, sorted) {
    for (const [rank, count] of Object.entries(rankCounts)) {
      if (count >= 5) {
        const cards = sorted.filter(c => c.rank === rank);
        return {
          type: 'FIVE_OF_A_KIND',
          primaryCard: cards[0],
          cards,
          chips: HAND_TYPES.FIVE_OF_A_KIND.chips,
          mult: HAND_TYPES.FIVE_OF_A_KIND.mult
        };
      }
    }
    return null;
  }

  static checkRoyalFlush(cards, suitCounts) {
    const royalRanks = ['10', 'J', 'Q', 'K', 'A'];
    for (const [suit, count] of Object.entries(suitCounts)) {
      if (count >= 5) {
        const suitedCards = cards.filter(c => c.suit === suit);
        const hasAllRoyal = royalRanks.every(rank => suitedCards.some(c => c.rank === rank));
        if (hasAllRoyal) {
          const royalCards = suitedCards.filter(c => royalRanks.includes(c.rank));
          return {
            type: 'ROYAL_FLUSH',
            primaryCard: royalCards.find(c => c.rank === 'A'),
            cards: royalCards,
            chips: HAND_TYPES.ROYAL_FLUSH.chips,
            mult: HAND_TYPES.ROYAL_FLUSH.mult
          };
        }
      }
    }
    return null;
  }

  static checkStraightFlush(cards, suitCounts) {
    for (const [suit, count] of Object.entries(suitCounts)) {
      if (count >= 5) {
        const suitedCards = cards.filter(c => c.suit === suit).sort((a, b) => b.value - a.value);
        const straight = this.findStraight(suitedCards);
        if (straight) {
          return {
            type: 'STRAIGHT_FLUSH',
            primaryCard: straight[0],
            cards: straight,
            chips: HAND_TYPES.STRAIGHT_FLUSH.chips,
            mult: HAND_TYPES.STRAIGHT_FLUSH.mult
          };
        }
      }
    }
    return null;
  }

  static checkFourOfAKind(rankCounts, sorted) {
    for (const [rank, count] of Object.entries(rankCounts)) {
      if (count >= 4) {
        const cards = sorted.filter(c => c.rank === rank);
        return {
          type: 'FOUR_OF_A_KIND',
          primaryCard: cards[0],
          cards,
          chips: HAND_TYPES.FOUR_OF_A_KIND.chips,
          mult: HAND_TYPES.FOUR_OF_A_KIND.mult
        };
      }
    }
    return null;
  }

  static checkFullHouse(rankCounts, sorted) {
    let threeRank = null;
    let pairRank = null;

    for (const [rank, count] of Object.entries(rankCounts)) {
      if (count >= 3 && !threeRank) {
        threeRank = rank;
      } else if (count >= 2 && !pairRank) {
        pairRank = rank;
      }
    }

    if (threeRank && pairRank) {
      const threeCards = sorted.filter(c => c.rank === threeRank).slice(0, 3);
      const pairCards = sorted.filter(c => c.rank === pairRank).slice(0, 2);
      return {
        type: 'FULL_HOUSE',
        primaryCard: threeCards[0],
        cards: [...threeCards, ...pairCards],
        chips: HAND_TYPES.FULL_HOUSE.chips,
        mult: HAND_TYPES.FULL_HOUSE.mult
      };
    }
    return null;
  }

  static checkFlush(suitCounts, sorted) {
    for (const [suit, count] of Object.entries(suitCounts)) {
      if (count >= 5) {
        const cards = sorted.filter(c => c.suit === suit).slice(0, 5);
        return {
          type: 'FLUSH',
          primaryCard: cards[0],
          cards,
          chips: HAND_TYPES.FLUSH.chips,
          mult: HAND_TYPES.FLUSH.mult
        };
      }
    }
    return null;
  }

  static checkStraight(sorted) {
    const straight = this.findStraight(sorted);
    if (straight) {
      return {
        type: 'STRAIGHT',
        primaryCard: straight[0],
        cards: straight,
        chips: HAND_TYPES.STRAIGHT.chips,
        mult: HAND_TYPES.STRAIGHT.mult
      };
    }
    return null;
  }

  static findStraight(cards) {
    if (cards.length < 5) return null;

    const uniqueValues = [...new Set(cards.map(c => c.value))].sort((a, b) => b - a);

    for (let i = 0; i <= uniqueValues.length - 5; i++) {
      let isStraight = true;
      for (let j = 0; j < 4; j++) {
        if (uniqueValues[i + j] - uniqueValues[i + j + 1] !== 1) {
          isStraight = false;
          break;
        }
      }
      if (isStraight) {
        const straightValues = uniqueValues.slice(i, i + 5);
        return straightValues.map(v => cards.find(c => c.value === v));
      }
    }

    if (uniqueValues.includes(14) && uniqueValues.includes(2) && uniqueValues.includes(3) && uniqueValues.includes(4) && uniqueValues.includes(5)) {
      const ace = cards.find(c => c.value === 14);
      const two = cards.find(c => c.value === 2);
      const three = cards.find(c => c.value === 3);
      const four = cards.find(c => c.value === 4);
      const five = cards.find(c => c.value === 5);
      return [five, four, three, two, ace];
    }

    return null;
  }

  static checkThreeOfAKind(rankCounts, sorted) {
    for (const [rank, count] of Object.entries(rankCounts)) {
      if (count >= 3) {
        const cards = sorted.filter(c => c.rank === rank);
        return {
          type: 'THREE_OF_A_KIND',
          primaryCard: cards[0],
          cards,
          chips: HAND_TYPES.THREE_OF_A_KIND.chips,
          mult: HAND_TYPES.THREE_OF_A_KIND.mult
        };
      }
    }
    return null;
  }

  static checkTwoPair(rankCounts, sorted) {
    const pairs = [];
    for (const [rank, count] of Object.entries(rankCounts)) {
      if (count >= 2) {
        pairs.push(rank);
      }
    }
    if (pairs.length >= 2) {
      pairs.sort((a, b) => RANK_VALUES[b] - RANK_VALUES[a]);
      const pair1Cards = sorted.filter(c => c.rank === pairs[0]).slice(0, 2);
      const pair2Cards = sorted.filter(c => c.rank === pairs[1]).slice(0, 2);
      return {
        type: 'TWO_PAIR',
        primaryCard: pair1Cards[0],
        cards: [...pair1Cards, ...pair2Cards],
        chips: HAND_TYPES.TWO_PAIR.chips,
        mult: HAND_TYPES.TWO_PAIR.mult
      };
    }
    return null;
  }

  static checkPair(rankCounts, sorted) {
    for (const [rank, count] of Object.entries(rankCounts)) {
      if (count >= 2) {
        const cards = sorted.filter(c => c.rank === rank);
        return {
          type: 'PAIR',
          primaryCard: cards[0],
          cards,
          chips: HAND_TYPES.PAIR.chips,
          mult: HAND_TYPES.PAIR.mult
        };
      }
    }
    return null;
  }
}
