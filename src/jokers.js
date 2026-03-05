// 小丑牌系统
//
// 小丑牌效果字段说明：
//
// chipBonus:  筹码加成 - 直接加到基础筹码上的数值
//             例：{ chipBonus: 50 } → 总筹码 = 基础筹码 + 50
//
// multBonus:  倍率加成 - 直接加到基础倍率上的数值
//             例：{ multBonus: 4 } → 总倍率 = 基础倍率 + 4
//
// multMult:   倍率乘法 - 对总倍率进行乘法（覆盖式，后生效的覆盖先生效的）
//             例：{ multMult: 3 } → 总倍率 = (基础倍率 + multBonus) × 3
//
// scoreMult:  得分乘法 - 对最终得分进行乘法（覆盖式，后生效的覆盖先生效的）
//             例：{ scoreMult: 1.5 } → 最终得分 = 筹码 × 倍率 × 1.5
//
// 计算顺序：
// 1. 计算基础筹码和基础倍率（来自牌型）
// 2. 累加所有小丑牌的 chipBonus 和 multBonus
// 3. 如果有 multMult，应用倍率乘法
// 4. 计算得分：(筹码 + chipBonus) × max(1, 倍率 + multBonus) × multMult
// 5. 如果有 scoreMult，应用得分乘法


export const JOKER_TYPES = {
  // 普通 (16张)
  JOKER: {
    id: 'joker',
    name: '小丑',
    description: '+4 倍率',
    rarity: '普通',
    cost: 4,
    effect: (state) => ({ multBonus: 4 })
  },
  GREEDY_JOKER: {
    id: 'greedy_joker',
    name: '贪婪小丑',
    description: '打出的牌中有对子时 +4 倍率',
    rarity: '普通',
    cost: 4,
    effect: (state) => {
      if (state.handResult?.type === 'PAIR' || state.handResult?.type === 'TWO_PAIR' ||
          state.handResult?.type === 'FULL_HOUSE') {
        return { multBonus: 4 };
      }
      return {};
    }
  },
  FLASH_JOKER: {
    id: 'flash_joker',
    name: '闪光小丑',
    description: '打出的牌中有同花时 +50 筹码',
    rarity: '普通',
    cost: 5,
    effect: (state) => {
      if (state.handResult?.type === 'FLUSH' || state.handResult?.type === 'STRAIGHT_FLUSH' ||
          state.handResult?.type === 'ROYAL_FLUSH') {
        return { chipBonus: 50 };
      }
      return {};
    }
  },
  STONE_JOKER: {
    id: 'stone_joker',
    name: '石头小丑',
    description: '+50 筹码, -2 倍率',
    rarity: '普通',
    cost: 4,
    effect: (state) => ({ chipBonus: 50, multBonus: -2 })
  },
  LUSTY_JOKER: {
    id: 'lusty_joker',
    name: '色欲小丑',
    description: '打出的牌中每张红桃 +3 倍率',
    rarity: '普通',
    cost: 5,
    effect: (state) => {
      const heartCount = state.hand?.filter(c => c.suit === '♥').length || 0;
      return { multBonus: heartCount * 3 };
    }
  },
  WRATHFUL_JOKER: {
    id: 'wrathful_joker',
    name: '愤怒小丑',
    description: '打出的牌中每张黑桃 +3 倍率',
    rarity: '普通',
    cost: 5,
    effect: (state) => {
      const spadeCount = state.hand?.filter(c => c.suit === '♠').length || 0;
      return { multBonus: spadeCount * 3 };
    }
  },
  GLUTTONOUS_JOKER: {
    id: 'gluttonous_joker',
    name: '暴食小丑',
    description: '打出的牌中每张梅花 +3 倍率',
    rarity: '普通',
    cost: 5,
    effect: (state) => {
      const clubCount = state.hand?.filter(c => c.suit === '♣').length || 0;
      return { multBonus: clubCount * 3 };
    }
  },
  SLOTHFUL_JOKER: {
    id: 'slothful_joker',
    name: '懒惰小丑',
    description: '打出的牌中每张方块 +3 倍率',
    rarity: '普通',
    cost: 5,
    effect: (state) => {
      const diamondCount = state.hand?.filter(c => c.suit === '♦').length || 0;
      return { multBonus: diamondCount * 3 };
    }
  },
  BANNER: {
    id: 'banner',
    name: '旗帜',
    description: '回合第一手牌 +12 倍率',
    rarity: '普通',
    cost: 5,
    effect: (state) => {
      if (state.isFirstHand) {
        return { multBonus: 12 };
      }
      return {};
    }
  },
  JOLLY_JOKER: {
    id: 'jolly_joker',
    name: '欢乐小丑',
    description: '打出的牌中有对子或三条时 +6 倍率',
    rarity: '普通',
    cost: 5,
    effect: (state) => {
      if (state.handResult?.type === 'PAIR' || state.handResult?.type === 'THREE_OF_A_KIND' ||
          state.handResult?.type === 'FULL_HOUSE') {
        return { multBonus: 6 };
      }
      return {};
    }
  },
  SLY_JOKER: {
    id: 'sly_joker',
    name: '狡猾小丑',
    description: '打出的牌中有同花时 +6 倍率',
    rarity: '普通',
    cost: 5,
    effect: (state) => {
      if (state.handResult?.type === 'FLUSH' || state.handResult?.type === 'STRAIGHT_FLUSH' ||
          state.handResult?.type === 'ROYAL_FLUSH') {
        return { multBonus: 6 };
      }
      return {};
    }
  },
  WILY_JOKER: {
    id: 'wily_joker',
    name: '诡计小丑',
    description: '打出的牌中有葫芦时 +8 倍率',
    rarity: '普通',
    cost: 6,
    effect: (state) => {
      if (state.handResult?.type === 'FULL_HOUSE') {
        return { multBonus: 8 };
      }
      return {};
    }
  },
  STEEL_JOKER: {
    id: 'steel_joker',
    name: '钢铁小丑',
    description: '+80 筹码, -3 倍率',
    rarity: '普通',
    cost: 5,
    effect: (state) => ({ chipBonus: 80, multBonus: -3 })
  },
  CERAMIC_JOKER: {
    id: 'ceramic_joker',
    name: '陶瓷小丑',
    description: '剩余弃牌次数 ×20 筹码',
    rarity: '普通',
    cost: 5,
    effect: (state) => {
      return { chipBonus: (state.discardsRemaining || 0) * 20 };
    }
  },
  MYSTIC_SUMMIT: {
    id: 'mystic_summit',
    name: '神秘之巅',
    description: '打出的牌正好 5 张时 +12 倍率',
    rarity: '普通',
    cost: 6,
    effect: (state) => {
      if (state.hand?.length === 5) {
        return { multBonus: 12 };
      }
      return {};
    }
  },
  SQUARE_JOKER: {
    id: 'square_joker',
    name: '方块小丑',
    description: '打出的牌全是偶数时 +6 倍率',
    rarity: '普通',
    cost: 5,
    effect: (state) => {
      if (state.hand?.every(c => c.value % 2 === 0)) {
        return { multBonus: 6 };
      }
      return {};
    }
  },

  // 稀有 (8张)
  ZANY_JOKER: {
    id: 'zany_joker',
    name: '滑稽小丑',
    description: '打出的牌中有三条时 +15 倍率',
    rarity: '稀有',
    cost: 7,
    effect: (state) => {
      if (state.handResult?.type === 'THREE_OF_A_KIND' || state.handResult?.type === 'FULL_HOUSE') {
        return { multBonus: 15 };
      }
      return {};
    }
  },
  MARBLE_JOKER: {
    id: 'marble_joker',
    name: '大理石小丑',
    description: '弃牌次数用完时 +30 倍率',
    rarity: '稀有',
    cost: 7,
    effect: (state) => {
      if (state.discardsRemaining === 0) {
        return { multBonus: 30 };
      }
      return {};
    }
  },
  HANGER_ON: {
    id: 'hanger_on',
    name: '跟屁虫',
    description: '拥有至少 5 张小丑牌时 +12 倍率',
    rarity: '稀有',
    cost: 7,
    effect: (state) => {
      if (state.jokerCount >= 5) {
        return { multBonus: 12 };
      }
      return {};
    }
  },
  CLEVER_JOKER: {
    id: 'clever_joker',
    name: '聪明小丑',
    description: '打出的牌中有炸弹时 +15 倍率',
    rarity: '稀有',
    cost: 7,
    effect: (state) => {
      if (state.handResult?.type === 'FOUR_OF_A_KIND' || state.handResult?.type === 'FIVE_OF_A_KIND') {
        return { multBonus: 15 };
      }
      return {};
    }
  },
  GOLD_JOKER: {
    id: 'gold_joker',
    name: '黄金小丑',
    description: '根据金钱 +5 到 +15 倍率',
    rarity: '稀有',
    cost: 8,
    effect: (state) => {
      let multBonus = 5;
      if (state.money >= 20) multBonus = 10;
      if (state.money >= 40) multBonus = 15;
      return { multBonus };
    }
  },
  DROLL_JOKER: {
    id: 'droll_joker',
    name: '逗趣小丑',
    description: '打出的牌中有顺子时 +15 倍率',
    rarity: '稀有',
    cost: 8,
    effect: (state) => {
      if (state.handResult?.type === 'STRAIGHT' || state.handResult?.type === 'STRAIGHT_FLUSH' ||
          state.handResult?.type === 'ROYAL_FLUSH') {
        return { multBonus: 15 };
      }
      return {};
    }
  },
  RED_CARD: {
    id: 'red_card',
    name: '红卡',
    description: '每张红桃 +40 筹码',
    rarity: '稀有',
    cost: 7,
    effect: (state) => {
      const heartCount = state.hand?.filter(c => c.suit === '♥').length || 0;
      return { chipBonus: heartCount * 40 };
    }
  },
  BLACK_CARD: {
    id: 'black_card',
    name: '黑卡',
    description: '每张黑桃 +40 筹码',
    rarity: '稀有',
    cost: 7,
    effect: (state) => {
      const spadeCount = state.hand?.filter(c => c.suit === '♠').length || 0;
      return { chipBonus: spadeCount * 40 };
    }
  },

  // 史诗 (4张)
  MISPRINT: {
    id: 'misprint',
    name: '错印',
    description: '+0-30 随机倍率',
    rarity: '史诗',
    cost: 9,
    effect: (state) => {
      return { multBonus: Math.floor(Math.random() * 31) };
    }
  },
  GAMBLER: {
    id: 'gambler',
    name: '赌徒',
    description: '70%几率 ×3 倍率，25%几率 ×2 倍率， 5%几率 ×0 倍率',
    rarity: '史诗',
    cost: 9,
    effect: (state) => {
      const r = Math.random();
      if (r < 0.7) return { multBonus: 0, multMult: 3 };
      if (r < 0.95) return { multBonus: 0, multMult: 2 };
      return { multBonus: 0, multMult: 0 };
    }
  },
  VAULT: {
    id: 'vault',
    name: '金库',
    description: '每有 $5 增加 +1 倍率',
    rarity: '史诗',
    cost: 10,
    effect: (state) => {
      return { multBonus: Math.floor(state.money / 5) };
    }
  },
  CONSTRUCTOR: {
    id: 'constructor',
    name: '建筑师',
    description: '每回合第一张牌 +30 筹码，+8 倍率',
    rarity: '史诗',
    cost: 10,
    effect: (state) => {
      if (state.isFirstHand) {
        return { chipBonus: 30, multBonus: 8 };
      }
      return {};
    }
  },

  // 传说 (2张)
  OOPS: {
    id: 'oops',
    name: '哎呀!',
    description: '所有小丑牌 +6 倍率（这个除外）',
    rarity: '传说',
    cost: 20,
    effect: (state) => ({})
  },
  PHANTOM: {
    id: 'phantom',
    name: '幻影',
    description: '最终得分 ×1.5',
    rarity: '传说',
    cost: 22,
    effect: (state) => ({ scoreMult: 1.5 })
  }
};

export const RARITY_COLORS = {
  普通: '#999999',
  稀有: '#00aa00',
  史诗: '#0066ff',
  传说: '#ffaa00'
};

export class Joker {
  constructor(type) {
    const jokerType = JOKER_TYPES[type];
    if (!jokerType) throw new Error(`未知的小丑牌类型: ${type}`);

    this.id = jokerType.id;
    this.name = jokerType.name;
    this.description = jokerType.description;
    this.rarity = jokerType.rarity;
    this.cost = jokerType.cost;
    this.effectFn = jokerType.effect;
    this.enabled = true;
  }

  applyEffect(state) {
    if (!this.enabled) return {};
    return this.effectFn(state);
  }

  toString() {
    return `[${this.rarity}] ${this.name}: ${this.description}`;
  }
}

export function getRandomJoker(minRarity = '普通') {
  const rarityWeights = {
    普通: { weight: 60, minOrder: 0 },
    稀有: { weight: 25, minOrder: 1 },
    史诗: { weight: 12, minOrder: 2 },
    传说: { weight: 3, minOrder: 3 }
  };

  const rarityOrder = ['普通', '稀有', '史诗', '传说'];
  const minOrder = rarityOrder.indexOf(minRarity);

  const availableRarities = rarityOrder.slice(minOrder);

  let totalWeight = 0;
  const weights = availableRarities.map(r => {
    const w = rarityWeights[r].weight;
    totalWeight += w;
    return { rarity: r, weight: w, cumulative: totalWeight };
  });

  const roll = Math.random() * totalWeight;
  let selectedRarity = availableRarities[availableRarities.length - 1];
  for (const w of weights) {
    if (roll <= w.cumulative) {
      selectedRarity = w.rarity;
      break;
    }
  }

  const jokersOfRarity = Object.entries(JOKER_TYPES)
    .filter(([_, j]) => j.rarity === selectedRarity);

  const [key, _] = jokersOfRarity[Math.floor(Math.random() * jokersOfRarity.length)];
  return new Joker(key);
}
