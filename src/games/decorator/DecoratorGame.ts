/**
 * 装饰器模式游戏 - 魔法装备强化
 * Decorator Pattern Game - Magic Equipment Enhancement
 */

// 装备接口（Component）
export interface IEquipment {
  getName(): string;
  getDescription(): string;
  getStats(): EquipmentStats;
  getEnhancements(): string[];
}

export interface EquipmentStats {
  attack: number;
  defense: number;
  magic: number;
  speed: number;
}

// 基础装备（Concrete Component）
export class BaseEquipment implements IEquipment {
  constructor(
    private name: string,
    private description: string,
    private stats: EquipmentStats,
    public emoji: string
  ) {}

  getName(): string { return this.name; }
  getDescription(): string { return this.description; }
  getStats(): EquipmentStats { return { ...this.stats }; }
  getEnhancements(): string[] { return []; }
}

// 装备装饰器基类（Decorator）
export abstract class EquipmentDecorator implements IEquipment {
  protected equipment: IEquipment;

  constructor(equipment: IEquipment) {
    this.equipment = equipment;
  }

  getName(): string { return this.equipment.getName(); }
  getDescription(): string { return this.equipment.getDescription(); }
  getStats(): EquipmentStats { return this.equipment.getStats(); }
  getEnhancements(): string[] { return this.equipment.getEnhancements(); }
}

// 火焰附魔（Concrete Decorator）
export class FireEnchantment extends EquipmentDecorator {
  getName(): string {
    return `烈焰${this.equipment.getName()}`;
  }

  getDescription(): string {
    return `${this.equipment.getDescription()} [附魔：火焰]`;
  }

  getStats(): EquipmentStats {
    const stats = this.equipment.getStats();
    return {
      ...stats,
      attack: stats.attack + 15,
      magic: stats.magic + 10,
    };
  }

  getEnhancements(): string[] {
    return [...this.equipment.getEnhancements(), '🔥 火焰附魔 (+15攻击, +10魔法)'];
  }
}

// 冰霜附魔
export class IceEnchantment extends EquipmentDecorator {
  getName(): string {
    return `冰霜${this.equipment.getName()}`;
  }

  getDescription(): string {
    return `${this.equipment.getDescription()} [附魔：冰霜]`;
  }

  getStats(): EquipmentStats {
    const stats = this.equipment.getStats();
    return {
      ...stats,
      defense: stats.defense + 12,
      magic: stats.magic + 8,
    };
  }

  getEnhancements(): string[] {
    return [...this.equipment.getEnhancements(), '❄️ 冰霜附魔 (+12防御, +8魔法)'];
  }
}

// 雷电附魔
export class LightningEnchantment extends EquipmentDecorator {
  getName(): string {
    return `雷霆${this.equipment.getName()}`;
  }

  getDescription(): string {
    return `${this.equipment.getDescription()} [附魔：雷电]`;
  }

  getStats(): EquipmentStats {
    const stats = this.equipment.getStats();
    return {
      ...stats,
      attack: stats.attack + 10,
      speed: stats.speed + 15,
    };
  }

  getEnhancements(): string[] {
    return [...this.equipment.getEnhancements(), '⚡ 雷电附魔 (+10攻击, +15速度)'];
  }
}

// 神圣附魔
export class HolyEnchantment extends EquipmentDecorator {
  getName(): string {
    return `神圣${this.equipment.getName()}`;
  }

  getDescription(): string {
    return `${this.equipment.getDescription()} [附魔：神圣]`;
  }

  getStats(): EquipmentStats {
    const stats = this.equipment.getStats();
    return {
      attack: stats.attack + 8,
      defense: stats.defense + 8,
      magic: stats.magic + 8,
      speed: stats.speed + 8,
    };
  }

  getEnhancements(): string[] {
    return [...this.equipment.getEnhancements(), '✨ 神圣附魔 (+8全属性)'];
  }
}

// 暗影附魔
export class ShadowEnchantment extends EquipmentDecorator {
  getName(): string {
    return `暗影${this.equipment.getName()}`;
  }

  getDescription(): string {
    return `${this.equipment.getDescription()} [附魔：暗影]`;
  }

  getStats(): EquipmentStats {
    const stats = this.equipment.getStats();
    return {
      ...stats,
      attack: stats.attack + 20,
      speed: stats.speed + 10,
    };
  }

  getEnhancements(): string[] {
    return [...this.equipment.getEnhancements(), '🌑 暗影附魔 (+20攻击, +10速度)'];
  }
}

// 附魔类型
export type EnchantmentType = 'fire' | 'ice' | 'lightning' | 'holy' | 'shadow';

export const ENCHANTMENT_CONFIG: Record<EnchantmentType, {
  name: string;
  emoji: string;
  description: string;
  color: string;
  decorator: new (equipment: IEquipment) => EquipmentDecorator;
}> = {
  fire: { name: '火焰', emoji: '🔥', description: '+15攻击, +10魔法', color: '#e74c3c', decorator: FireEnchantment },
  ice: { name: '冰霜', emoji: '❄️', description: '+12防御, +8魔法', color: '#3498db', decorator: IceEnchantment },
  lightning: { name: '雷电', emoji: '⚡', description: '+10攻击, +15速度', color: '#f1c40f', decorator: LightningEnchantment },
  holy: { name: '神圣', emoji: '✨', description: '+8全属性', color: '#fff', decorator: HolyEnchantment },
  shadow: { name: '暗影', emoji: '🌑', description: '+20攻击, +10速度', color: '#9b59b6', decorator: ShadowEnchantment },
};

// 基础装备配置
export interface BaseEquipmentConfig {
  id: string;
  name: string;
  emoji: string;
  description: string;
  stats: EquipmentStats;
}

export const BASE_EQUIPMENTS: BaseEquipmentConfig[] = [
  { id: 'sword', name: '铁剑', emoji: '⚔️', description: '基础的铁质长剑', stats: { attack: 20, defense: 5, magic: 0, speed: 10 } },
  { id: 'staff', name: '木杖', emoji: '🪄', description: '魔法师的基础法杖', stats: { attack: 5, defense: 5, magic: 25, speed: 5 } },
  { id: 'shield', name: '铁盾', emoji: '🛡️', description: '坚固的防护盾牌', stats: { attack: 0, defense: 30, magic: 0, speed: -5 } },
  { id: 'bow', name: '短弓', emoji: '🏹', description: '轻便的远程武器', stats: { attack: 15, defense: 0, magic: 5, speed: 20 } },
  { id: 'robe', name: '法袍', emoji: '👘', description: '魔法师的长袍', stats: { attack: 0, defense: 10, magic: 20, speed: 10 } },
];

// 游戏关卡
export interface DecoratorLevel {
  id: number;
  name: string;
  description: string;
  story: string;
  availableEquipments: string[];
  availableEnchantments: EnchantmentType[];
  objectives: {
    type: 'total_stat' | 'enchant_count' | 'specific_enchant' | 'multi_enchant';
    stat?: keyof EquipmentStats;
    target: number;
    enchantType?: EnchantmentType;
    description: string;
  }[];
  hints: string[];
}

export const DECORATOR_LEVELS: DecoratorLevel[] = [
  {
    id: 1,
    name: '初次附魔',
    description: '学习使用装饰器增强装备',
    story: '欢迎来到魔法锻造屋！这里使用装饰器模式为装备添加附魔效果。每次附魔都是在原有基础上"包装"新功能！',
    availableEquipments: ['sword', 'shield'],
    availableEnchantments: ['fire', 'ice'],
    objectives: [
      { type: 'enchant_count', target: 2, description: '为装备添加 2 次附魔' },
      { type: 'total_stat', stat: 'attack', target: 40, description: '装备攻击力达到 40' },
    ],
    hints: [
      '装饰器模式可以动态地为对象添加功能',
      '每次附魔都会在原有基础上叠加效果',
      '火焰附魔增加攻击和魔法属性',
    ],
  },
  {
    id: 2,
    name: '叠加附魔',
    description: '体验多重装饰器的威力',
    story: '装饰器模式的精髓在于可以无限叠加！同一件装备可以添加多层附魔，每层都会增强装备的能力。',
    availableEquipments: ['sword', 'staff', 'bow'],
    availableEnchantments: ['fire', 'ice', 'lightning'],
    objectives: [
      { type: 'multi_enchant', target: 3, description: '为同一件装备添加 3 层附魔' },
      { type: 'total_stat', stat: 'magic', target: 50, description: '装备魔法值达到 50' },
    ],
    hints: [
      '可以为同一件装备多次添加附魔',
      '每次附魔都会包装前一次的结果',
      '尝试组合不同的附魔效果',
    ],
  },
  {
    id: 3,
    name: '传说锻造',
    description: '创造终极神器',
    story: '终极挑战！使用所有可用的附魔，创造出拥有强大属性的传说装备。这就是装饰器模式的威力！',
    availableEquipments: ['sword', 'staff', 'shield', 'bow', 'robe'],
    availableEnchantments: ['fire', 'ice', 'lightning', 'holy', 'shadow'],
    objectives: [
      { type: 'multi_enchant', target: 4, description: '为同一件装备添加 4 层附魔' },
      { type: 'total_stat', stat: 'attack', target: 100, description: '装备攻击力达到 100' },
      { type: 'specific_enchant', enchantType: 'holy', target: 1, description: '使用神圣附魔' },
    ],
    hints: [
      '神圣附魔可以均衡提升所有属性',
      '火焰和暗影附魔提供高攻击加成',
      '尝试创造属性总和最高的装备',
    ],
  },
];
