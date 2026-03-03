#!/usr/bin/env node
// 小丑牌主入口

import chalk from 'chalk';
import { GameState } from './game.js';
import { UI } from './ui.js';
import { getRandomJoker } from './jokers.js';

async function main() {
  UI.clear();
  UI.printWelcome();

  const cont = await UI.askContinue();
  if (!cont) {
    console.log('再见!');
    process.exit(0);
  }

  const game = new GameState();
  game.drawInitialHand();

  while (true) {
    UI.clear();
    UI.printHeader(game);
    UI.printJokers(game);
    UI.printHand(game.hand);

    if (game.isRoundComplete()) {
      if (game.isVictory()) {
        UI.printVictory();

        const shopAction = await UI.askShop(game.money, game.maxJokers);

        if (shopAction === 'buy') {
          while (true) {
            UI.clear();
            UI.printHeader(game);

            if (game.jokers.length >= game.maxJokers) {
              console.log('你的小丑牌槽位已满!');
              await UI.askContinue();
              break;
            }

            const shopJokers = [
              getRandomJoker(),
              getRandomJoker(),
              getRandomJoker()
            ];

            UI.printShopJokers(shopJokers);

            const choice = await UI.askJokerPurchase(shopJokers, game.money);

            if (choice === -1) break;

            const joker = shopJokers[choice];
            if (game.buyJoker(joker)) {
              console.log(`购买了 ${joker.name}!`);
            } else {
              console.log('购买失败!');
            }
            await UI.askContinue();
          }
        }

        if (!game.nextRound()) {
          break;
        }
      } else {
        UI.printDefeat();
        UI.printGameOver(game);
        break;
      }
    } else {
      const action = await UI.askMainMenu();

      if (action === 'play') {
        const indices = await UI.askCardSelection(
          game.hand,
          '选择要出的牌 (1-5 张牌):',
          1,
          5
        );

        if (indices === 'back') {
          continue;
        }

        if (indices.length > 0) {
          const result = game.playHand(indices);

          UI.clear();
          UI.printHeader(game);
          UI.printJokers(game);
          UI.printHand(game.hand);
          UI.printPlayResult(result);

          await UI.askContinue();
        }
      } else if (action === 'discard') {
        if (game.discardsRemaining <= 0) {
          console.log('没有剩余的弃牌次数了!');
          await UI.askContinue();
          continue;
        }

        const indices = await UI.askCardSelection(
          game.hand,
          '选择要弃掉的牌:',
          1,
          game.hand.cards.length
        );

        if (indices === 'back') {
          continue;
        }

        if (indices.length > 0) {
          game.discard(indices);
        }
      } else if (action === 'sortRank') {
        game.hand.sortByRank();
      } else if (action === 'sortSuit') {
        game.hand.sortBySuit();
      }
    }
  }

  console.log(chalk.gray('感谢游玩!'));
}

main().catch(console.error);
