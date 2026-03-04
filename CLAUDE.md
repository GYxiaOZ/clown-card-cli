# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个命令行版的 Balatro 风格扑克牌 Roguelike 游戏（小丑牌 CLI）。玩家通过出牌组成牌型获得分数，收集小丑牌获得特殊加成，在回合结束前达到分数目标。

## 常用命令

| 命令 | 说明 |
|------|------|
| `npm install` | 安装依赖 |
| `npm start` | 启动游戏 |
| `npm run dev` | 开发模式（使用 `--watch` 自动重启） |

## 项目架构

### 核心模块

```
src/
├── index.js          # 游戏入口 - 主程序流程、存档管理
├── game.js           # GameState 类 - 游戏状态管理和核心逻辑
├── cards.js          # Card/Deck/Hand 类 - 扑克牌系统
├── handEvaluator.js  # 牌型判断引擎
├── jokers.js         # Joker 类和 30+ 种小丑牌定义
├── ui.js             # UI 类 - 命令行界面渲染
└── save.js           # SaveManager 类 - 存档系统
```

### 数据流

1. **入口** (`index.js`) → 加载存档 → 创建 GameState
2. **游戏循环** (`GameState`) → 管理回合、分数、出牌/弃牌
3. **牌型判断** (`HandEvaluator`) → 评估手牌并计算分数
4. **小丑牌效果** (`JOKER_TYPES`) → 应用各种加成
5. **UI 渲染** (`UI`) → 显示游戏状态和处理交互

## 关键类和职责

| 类 | 文件 | 职责 |
|----|------|------|
| `GameState` | game.js | 回合管理、分数计算、商店购买、进度控制 |
| `Card` | cards.js | 单张牌（花色、点数、强化状态） |
| `Deck` | cards.js | 牌堆管理（洗牌、发牌、弃牌堆） |
| `Hand` | cards.js | 手牌管理（添加、删除、排序） |
| `HandEvaluator` | handEvaluator.js | 11 种牌型判断（高牌到五同） |
| `Joker` | jokers.js | 小丑牌（稀有度、效果、描述） |
| `UI` | ui.js | chalk/inquirer 界面渲染 |
| `SaveManager` | save.js | save.json 读写 |

## 牌型系统

牌型按等级排序：高牌 < 对子 < 两对 < 三条 < 顺子 < 同花 < 葫芦 < 炸弹 < 同花顺 < 皇家同花顺 < 五同

每种牌型有基础筹码和倍率，最终分数 = (筹码 + 小丑牌加成) × (倍率 + 小丑牌加成)

## 小丑牌系统

- 30+ 种效果定义在 `JOKER_TYPES` 对象中
- 稀有度：普通（灰色）、稀有（绿色）、史诗（蓝色）、传说（金色）
- 添加新小丑牌：在 `jokers.js` 的 `JOKER_TYPES` 中新增配置

## 存档系统

- 存档文件：`save.json`
- 保存完整游戏状态（回合、分数、手牌、牌堆、小丑牌等）
- 启动时自动检测存档

## 技术栈

- Node.js ES Modules (`"type": "module"`)
- chalk ^5.3.0 - 终端颜色
- inquirer ^9.2.15 - 交互式命令行
