/**
 * 策略模式游戏 - 魔法战斗竞技场
 * Strategy Pattern Game - Magic Battle Arena
 */

// 战斗策略接口
export interface IBattleStrategy {
  name: string;
  emoji: string;
  description: string;
  execute(attacker: Fighter, defender: Fighter): BattleResult;
  getEffectiveness(defenderStrategy: string): number; // 1=有效, 0=普通, -1=无效
}

// 战斗结果
export interface BattleResult {
  damage: number;
  critical: boolean;
  message: string;
  effectiveness: 'super' | 'normal' | 'weak';
}

// 战斗者
export interface Fighter {
  name: string;
  emoji: string;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  strategy: IBattleStrategy | null;
}

// 攻击策略
export class AttackStrategy implements IBattleStrategy {
  name = '猛攻';
  emoji = '⚔️';
  description = '全力攻击，伤害最大化。克制魔法，被防御克制。';

  execute(attacker: Fighter, defender: Fighter): BattleResult {
    const effectiveness = this.getEffectiveness(defender.strategy?.name || '');
    let multiplier = 1;
    let effectivenessType: 'super' | 'normal' | 'weak' = 'normal';

    if (effectiveness > 0) {
      multiplier = 1.5;
      effectivenessType = 'super';
    } else if (effectiveness < 0) {
      multiplier = 0.5;
      effectivenessType = 'weak';
    }

    const baseDamage = Math.max(1, attacker.attack * multiplier - defender.defense * 0.3);
    const critical = Math.random() < 0.2;
    const finalDamage = Math.floor(critical ? baseDamage * 1.5 : baseDamage);

    return {
      damage: finalDamage,
      critical,
      message: `${attacker.emoji} ${attacker.name} 使用猛攻！造成 ${finalDamage} 点伤害${critical ? '（暴击！）' : ''}`,
      effectiveness: effectivenessType
    };
  }

  getEffectiveness(defenderStrategy: string): number {
    if (defenderStrategy === '魔法') return 1;
    if (defenderStrategy === '防御') return -1;
    return 0;
  }
}

// 防御策略
export class DefenseStrategy implements IBattleStrategy {
  name = '防御';
  emoji = '🛡️';
  description = '坚固防守，减少受到的伤害。克制攻击，被魔法克制。';

  execute(attacker: Fighter, defender: Fighter): BattleResult {
    const effectiveness = this.getEffectiveness(defender.strategy?.name || '');
    let multiplier = 1;
    let effectivenessType: 'super' | 'normal' | 'weak' = 'normal';

    if (effectiveness > 0) {
      multiplier = 1.3;
      effectivenessType = 'super';
    } else if (effectiveness < 0) {
      multiplier = 0.7;
      effectivenessType = 'weak';
    }

    const baseDamage = Math.max(1, attacker.attack * 0.5 * multiplier);
    const counterAttack = Math.random() < 0.3;
    const finalDamage = Math.floor(counterAttack ? baseDamage * 1.2 : baseDamage);

    return {
      damage: finalDamage,
      critical: counterAttack,
      message: `${attacker.emoji} ${attacker.name} 采取防御姿态${counterAttack ? '并发起反击' : ''}！造成 ${finalDamage} 点伤害`,
      effectiveness: effectivenessType
    };
  }

  getEffectiveness(defenderStrategy: string): number {
    if (defenderStrategy === '猛攻') return 1;
    if (defenderStrategy === '魔法') return -1;
    return 0;
  }
}

// 魔法策略
export class MagicStrategy implements IBattleStrategy {
  name = '魔法';
  emoji = '✨';
  description = '释放魔法攻击，无视部分防御。克制防御，被攻击克制。';

  execute(attacker: Fighter, defender: Fighter): BattleResult {
    const effectiveness = this.getEffectiveness(defender.strategy?.name || '');
    let multiplier = 1;
    let effectivenessType: 'super' | 'normal' | 'weak' = 'normal';

    if (effectiveness > 0) {
      multiplier = 1.5;
      effectivenessType = 'super';
    } else if (effectiveness < 0) {
      multiplier = 0.5;
      effectivenessType = 'weak';
    }

    const baseDamage = Math.max(1, attacker.attack * 0.9 * multiplier);
    const critical = Math.random() < 0.15;
    const finalDamage = Math.floor(critical ? baseDamage * 2 : baseDamage);

    return {
      damage: finalDamage,
      critical,
      message: `${attacker.emoji} ${attacker.name} 施放魔法！造成 ${finalDamage} 点伤害${critical ? '（魔暴！）' : ''}`,
      effectiveness: effectivenessType
    };
  }

  getEffectiveness(defenderStrategy: string): number {
    if (defenderStrategy === '防御') return 1;
    if (defenderStrategy === '猛攻') return -1;
    return 0;
  }
}

// 所有可用策略
export const AVAILABLE_STRATEGIES: IBattleStrategy[] = [
  new AttackStrategy(),
  new DefenseStrategy(),
  new MagicStrategy(),
];

// 策略克制关系说明
export const STRATEGY_RELATIONS = {
  attack: { beats: 'magic', losesTo: 'defense' },
  defense: { beats: 'attack', losesTo: 'magic' },
  magic: { beats: 'defense', losesTo: 'attack' },
};

// 敌人配置
export interface Enemy {
  name: string;
  emoji: string;
  hp: number;
  attack: number;
  defense: number;
  preferredStrategies: string[];
  description: string;
}

export const ENEMIES: Enemy[] = [
  { name: '哥布林', emoji: '👺', hp: 50, attack: 12, defense: 5, preferredStrategies: ['猛攻', '猛攻', '魔法'], description: '喜欢猛攻' },
  { name: '石头人', emoji: '🗿', hp: 80, attack: 8, defense: 15, preferredStrategies: ['防御', '防御', '猛攻'], description: '擅长防御' },
  { name: '暗影法师', emoji: '🧙‍♂️', hp: 40, attack: 18, defense: 3, preferredStrategies: ['魔法', '魔法', '防御'], description: '精通魔法' },
  { name: '骷髅战士', emoji: '💀', hp: 60, attack: 14, defense: 8, preferredStrategies: ['猛攻', '防御', '魔法'], description: '策略多变' },
  { name: '火焰巨龙', emoji: '🐉', hp: 120, attack: 20, defense: 12, preferredStrategies: ['魔法', '猛攻', '猛攻'], description: '强大的boss' },
];

// 游戏关卡
export interface StrategyLevel {
  id: number;
  name: string;
  description: string;
  story: string;
  playerHp: number;
  playerAttack: number;
  playerDefense: number;
  enemies: number[]; // 敌人索引
  objectives: {
    type: 'win_battles' | 'use_strategy' | 'super_effective' | 'no_damage';
    target: number;
    strategyName?: string;
    description: string;
  }[];
  hints: string[];
}

export const STRATEGY_LEVELS: StrategyLevel[] = [
  {
    id: 1,
    name: '初学策略',
    description: '学习策略模式的基础',
    story: '欢迎来到魔法竞技场！这里使用策略模式来切换战斗策略。攻击克制魔法，魔法克制防御，防御克制攻击。选择正确的策略赢得胜利！',
    playerHp: 100,
    playerAttack: 15,
    playerDefense: 10,
    enemies: [0], // 哥布林
    objectives: [
      { type: 'win_battles', target: 1, description: '击败 1 个敌人' },
      { type: 'use_strategy', target: 2, strategyName: '防御', description: '使用防御策略 2 次' },
    ],
    hints: [
      '哥布林喜欢使用猛攻策略',
      '防御策略可以克制猛攻',
      '策略模式允许在运行时切换算法',
    ],
  },
  {
    id: 2,
    name: '见招拆招',
    description: '根据敌人切换策略',
    story: '面对不同的敌人，你需要观察他们的行为模式，灵活切换策略。这就是策略模式的精髓：运行时动态改变行为！',
    playerHp: 100,
    playerAttack: 18,
    playerDefense: 12,
    enemies: [0, 1], // 哥布林, 石头人
    objectives: [
      { type: 'win_battles', target: 2, description: '击败 2 个敌人' },
      { type: 'super_effective', target: 3, description: '触发 3 次克制效果' },
    ],
    hints: [
      '观察敌人上次使用的策略',
      '预测敌人下一步行动',
      '选择能克制敌人的策略',
    ],
  },
  {
    id: 3,
    name: '竞技场之王',
    description: '挑战终极boss',
    story: '最终挑战！面对火焰巨龙，你需要精确运用策略模式的优势。记住：策略可以随时切换，保持灵活才能获胜！',
    playerHp: 150,
    playerAttack: 22,
    playerDefense: 15,
    enemies: [2, 3, 4], // 暗影法师, 骷髅战士, 火焰巨龙
    objectives: [
      { type: 'win_battles', target: 3, description: '击败所有 3 个敌人' },
      { type: 'super_effective', target: 5, description: '触发 5 次克制效果' },
    ],
    hints: [
      '暗影法师脆弱但伤害高，用猛攻快速解决',
      '骷髅战士策略多变，注意观察',
      '火焰巨龙是boss，需要持久战',
    ],
  },
];
