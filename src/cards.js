// 扑克牌核心逻辑

export const SUITS = ['♠', '♥', '♦', '♣'];
export const SUIT_NAMES = {
  '♠': 'spades',
  '♥': 'hearts',
  '♦': 'diamonds',
  '♣': 'clubs'
};
export const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
export const RANK_VALUES = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
  'J': 11, 'Q': 12, 'K': 13, 'A': 14
};

export class Card {
  constructor(suit, rank) {
    this.suit = suit;
    this.rank = rank;
    this.value = RANK_VALUES[rank];
    this.enhanced = false;
    this.bonusChips = 0;
    this.bonusMult = 0;
  }

  toString() {
    return `${this.rank}${this.suit}`;
  }

  isFaceCard() {
    return ['J', 'Q', 'K'].includes(this.rank);
  }

  isAce() {
    return this.rank === 'A';
  }

  getChipValue() {
    if (this.isFaceCard() || this.isAce()) {
      return 10;
    }
    return parseInt(this.rank, 10);
  }
}

export class Deck {
  constructor() {
    this.cards = [];
    this.discardPile = [];
    this.initializeDeck();
  }

  initializeDeck() {
    this.cards = [];
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        this.cards.push(new Card(suit, rank));
      }
    }
    this.shuffle();
  }

  shuffle() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  draw(num = 1) {
    const drawn = [];
    for (let i = 0; i < num; i++) {
      if (this.cards.length === 0) {
        if (this.discardPile.length > 0) {
          this.cards = [...this.discardPile];
          this.discardPile = [];
          this.shuffle();
        } else {
          break;
        }
      }
      drawn.push(this.cards.pop());
    }
    return drawn;
  }

  discard(cards) {
    this.discardPile.push(...cards);
  }
}

export class Hand {
  constructor() {
    this.cards = [];
    this.maxSize = 8;
  }

  addCards(cards) {
    if (this.cards.length + cards.length <= this.maxSize) {
      this.cards.push(...cards);
      return true;
    }
    return false;
  }

  removeCards(indices) {
    const sorted = [...indices].sort((a, b) => b - a);
    const removed = sorted.map(i => this.cards.splice(i, 1)[0]);
    return removed.reverse();
  }

  clear() {
    const cards = [...this.cards];
    this.cards = [];
    return cards;
  }

  sortByRank() {
    this.cards.sort((a, b) => a.value - b.value);
  }

  sortBySuit() {
    this.cards.sort((a, b) => {
      const suitOrder = SUITS.indexOf(a.suit) - SUITS.indexOf(b.suit);
      if (suitOrder !== 0) return suitOrder;
      return a.value - b.value;
    });
  }
}
