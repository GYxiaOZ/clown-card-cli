// 存档系统
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Card, Deck, Hand } from './cards.js';
import { Joker, JOKER_TYPES } from './jokers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SAVE_FILE = path.join(__dirname, '../save.json');

export class SaveManager {
  static saveExists() {
    return fs.existsSync(SAVE_FILE);
  }

  static saveGame(game) {
    const saveData = {
      round: game.round,
      ante: game.ante,
      money: game.money,
      handsRemaining: game.handsRemaining,
      discardsRemaining: game.discardsRemaining,
      score: game.score,
      scoreRequired: game.scoreRequired,
      isFirstHand: game.isFirstHand,
      maxJokers: game.maxJokers,
      hand: game.hand.cards.map(c => ({ suit: c.suit, rank: c.rank })),
      deck: game.deck.cards.map(c => ({ suit: c.suit, rank: c.rank })),
      discardPile: game.deck.discardPile.map(c => ({ suit: c.suit, rank: c.rank })),
      jokers: game.jokers.map(j => j.id)
    };

    fs.writeFileSync(SAVE_FILE, JSON.stringify(saveData, null, 2));
  }

  static loadGame() {
    if (!this.saveExists()) return null;

    try {
      const data = fs.readFileSync(SAVE_FILE, 'utf8');
      const saveData = JSON.parse(data);
      return saveData;
    } catch (e) {
      console.error('读取存档失败:', e);
      return null;
    }
  }

  static restoreGame(game, saveData) {
    game.round = saveData.round;
    game.ante = saveData.ante;
    game.money = saveData.money;
    game.handsRemaining = saveData.handsRemaining;
    game.discardsRemaining = saveData.discardsRemaining;
    game.score = saveData.score;
    game.scoreRequired = saveData.scoreRequired;
    game.isFirstHand = saveData.isFirstHand;
    game.maxJokers = saveData.maxJokers;

    game.hand = new Hand();
    saveData.hand.forEach(c => game.hand.addCards([new Card(c.suit, c.rank)]));

    game.deck = new Deck();
    game.deck.cards = saveData.deck.map(c => new Card(c.suit, c.rank));
    game.deck.discardPile = saveData.discardPile.map(c => new Card(c.suit, c.rank));

    const jokerMap = {};
    Object.keys(JOKER_TYPES).forEach(key => {
      jokerMap[JOKER_TYPES[key].id] = key;
    });

    game.jokers = saveData.jokers.map(id => {
      const key = jokerMap[id];
      return key ? new Joker(key) : null;
    }).filter(j => j !== null);
  }

  static deleteSave() {
    if (this.saveExists()) {
      fs.unlinkSync(SAVE_FILE);
    }
  }
}

