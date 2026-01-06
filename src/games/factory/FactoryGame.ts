/**
 * 工厂模式游戏 - 魔法武器锻造厂
 * Factory Pattern Game - Magic Weapon Forge
 */

// 武器类型
export type WeaponType = 'sword' | 'staff' | 'bow' | 'axe' | 'dagger';

// 武器品质
export type WeaponQuality = 'common' | 'rare' | 'epic' | 'legendary';

// 武器接口（产品接口）
export interface IWeapon {
  id: string;
  type: WeaponType;
  name: string;
  quality: WeaponQuality;
  damage: number;
  emoji: string;
  description: string;
}

// 武器配置
export const WEAPON_CONFIG: Record<WeaponType, {
  name: string;
  emoji: string;
  baseDamage: number;
  description: string;
}> = {
  sword: { name: '魔法剑', emoji: '⚔️', baseDamage: 25, description: '近战利器，平衡攻防' },
  staff: { name: '法杖', emoji: '🪄', baseDamage: 30, description: '魔法之源，施法必备' },
  bow: { name: '精灵弓', emoji: '🏹', baseDamage: 22, description: '远程武器，精准打击' },
  axe: { name: '战斧', emoji: '🪓', baseDamage: 35, description: '重型武器，威力惊人' },
  dagger: { name: '暗影匕首', emoji: '🗡️', baseDamage: 18, description: '轻便武器，暴击利器' },
};

// 品质配置
export const QUALITY_CONFIG: Record<WeaponQuality, {
  name: string;
  color: string;
  damageMultiplier: number;
}> = {
  common: { name: '普通', color: '#aaa', damageMultiplier: 1 },
  rare: { name: '稀有', color: '#3498db', damageMultiplier: 1.5 },
  epic: { name: '史诗', color: '#9b59b6', damageMultiplier: 2 },
  legendary: { name: '传说', color: '#f39c12', damageMultiplier: 3 },
};

// 具体武器类
class Sword implements IWeapon {
  id = 'sword-' + Math.random().toString(36).substr(2, 6);
  type: WeaponType = 'sword';
  name: string;
  quality: WeaponQuality;
  damage: number;
  emoji = WEAPON_CONFIG.sword.emoji;
  description = WEAPON_CONFIG.sword.description;

  constructor(quality: WeaponQuality = 'common') {
    this.quality = quality;
    this.name = `${QUALITY_CONFIG[quality].name}${WEAPON_CONFIG.sword.name}`;
    this.damage = Math.floor(WEAPON_CONFIG.sword.baseDamage * QUALITY_CONFIG[quality].damageMultiplier);
  }
}

class Staff implements IWeapon {
  id = 'staff-' + Math.random().toString(36).substr(2, 6);
  type: WeaponType = 'staff';
  name: string;
  quality: WeaponQuality;
  damage: number;
  emoji = WEAPON_CONFIG.staff.emoji;
  description = WEAPON_CONFIG.staff.description;

  constructor(quality: WeaponQuality = 'common') {
    this.quality = quality;
    this.name = `${QUALITY_CONFIG[quality].name}${WEAPON_CONFIG.staff.name}`;
    this.damage = Math.floor(WEAPON_CONFIG.staff.baseDamage * QUALITY_CONFIG[quality].damageMultiplier);
  }
}

class Bow implements IWeapon {
  id = 'bow-' + Math.random().toString(36).substr(2, 6);
  type: WeaponType = 'bow';
  name: string;
  quality: WeaponQuality;
  damage: number;
  emoji = WEAPON_CONFIG.bow.emoji;
  description = WEAPON_CONFIG.bow.description;

  constructor(quality: WeaponQuality = 'common') {
    this.quality = quality;
    this.name = `${QUALITY_CONFIG[quality].name}${WEAPON_CONFIG.bow.name}`;
    this.damage = Math.floor(WEAPON_CONFIG.bow.baseDamage * QUALITY_CONFIG[quality].damageMultiplier);
  }
}

class Axe implements IWeapon {
  id = 'axe-' + Math.random().toString(36).substr(2, 6);
  type: WeaponType = 'axe';
  name: string;
  quality: WeaponQuality;
  damage: number;
  emoji = WEAPON_CONFIG.axe.emoji;
  description = WEAPON_CONFIG.axe.description;

  constructor(quality: WeaponQuality = 'common') {
    this.quality = quality;
    this.name = `${QUALITY_CONFIG[quality].name}${WEAPON_CONFIG.axe.name}`;
    this.damage = Math.floor(WEAPON_CONFIG.axe.baseDamage * QUALITY_CONFIG[quality].damageMultiplier);
  }
}

class Dagger implements IWeapon {
  id = 'dagger-' + Math.random().toString(36).substr(2, 6);
  type: WeaponType = 'dagger';
  name: string;
  quality: WeaponQuality;
  damage: number;
  emoji = WEAPON_CONFIG.dagger.emoji;
  description = WEAPON_CONFIG.dagger.description;

  constructor(quality: WeaponQuality = 'common') {
    this.quality = quality;
    this.name = `${QUALITY_CONFIG[quality].name}${WEAPON_CONFIG.dagger.name}`;
    this.damage = Math.floor(WEAPON_CONFIG.dagger.baseDamage * QUALITY_CONFIG[quality].damageMultiplier);
  }
}

// 武器工厂（简单工厂模式）
export class WeaponFactory {
  private static createdWeapons: IWeapon[] = [];

  public static createWeapon(type: WeaponType, quality: WeaponQuality = 'common'): IWeapon {
    let weapon: IWeapon;

    switch (type) {
      case 'sword':
        weapon = new Sword(quality);
        break;
      case 'staff':
        weapon = new Staff(quality);
        break;
      case 'bow':
        weapon = new Bow(quality);
        break;
      case 'axe':
        weapon = new Axe(quality);
        break;
      case 'dagger':
        weapon = new Dagger(quality);
        break;
      default:
        throw new Error(`Unknown weapon type: ${type}`);
    }

    this.createdWeapons.push(weapon);
    return weapon;
  }

  public static getCreatedWeapons(): IWeapon[] {
    return [...this.createdWeapons];
  }

  public static getWeaponCount(): number {
    return this.createdWeapons.length;
  }

  public static reset(): void {
    this.createdWeapons = [];
  }
}

// 订单接口
export interface WeaponOrder {
  id: string;
  type: WeaponType;
  quality: WeaponQuality;
  customerName: string;
  customerEmoji: string;
  fulfilled: boolean;
  reward: number;
}

// 游戏关卡
export interface FactoryLevel {
  id: number;
  name: string;
  description: string;
  story: string;
  orders: Omit<WeaponOrder, 'id' | 'fulfilled'>[];
  objectives: {
    type: 'fulfill_orders' | 'create_weapons' | 'create_quality' | 'total_damage';
    target: number;
    quality?: WeaponQuality;
    description: string;
  }[];
  hints: string[];
}

export const FACTORY_LEVELS: FactoryLevel[] = [
  {
    id: 1,
    name: '初级锻造师',
    description: '学习使用工厂创建武器',
    story: '欢迎来到魔法武器锻造厂！这里使用工厂模式来创建各种武器。客户只需告诉我们想要什么类型的武器，工厂就会负责创建。',
    orders: [
      { type: 'sword', quality: 'common', customerName: '骑士', customerEmoji: '🛡️', reward: 50 },
      { type: 'staff', quality: 'common', customerName: '法师', customerEmoji: '🧙', reward: 50 },
    ],
    objectives: [
      { type: 'fulfill_orders', target: 2, description: '完成 2 个订单' },
      { type: 'create_weapons', target: 2, description: '使用工厂创建 2 件武器' },
    ],
    hints: [
      '工厂模式将对象创建逻辑封装在工厂类中',
      '客户端无需知道具体产品类，只需要通过工厂获取产品',
      '点击"锻造"按钮，使用工厂创建武器',
    ],
  },
  {
    id: 2,
    name: '品质锻造',
    description: '创建不同品质的武器',
    story: '高级订单来了！客户们需要不同品质的武器。工厂可以根据参数创建不同配置的产品。',
    orders: [
      { type: 'bow', quality: 'rare', customerName: '游侠', customerEmoji: '🏹', reward: 80 },
      { type: 'axe', quality: 'epic', customerName: '狂战士', customerEmoji: '💪', reward: 120 },
      { type: 'dagger', quality: 'rare', customerName: '刺客', customerEmoji: '🥷', reward: 80 },
    ],
    objectives: [
      { type: 'fulfill_orders', target: 3, description: '完成 3 个订单' },
      { type: 'create_quality', target: 1, quality: 'epic', description: '创建至少 1 件史诗品质武器' },
    ],
    hints: [
      '工厂可以接收参数来创建不同配置的产品',
      '注意匹配订单要求的武器类型和品质',
      '史诗品质武器伤害更高',
    ],
  },
  {
    id: 3,
    name: '武器大师',
    description: '大量生产满足各种需求',
    story: '战争即将来临，王国需要大量武器！使用工厂模式的优势：统一管理创建逻辑，快速响应不同需求。',
    orders: [
      { type: 'sword', quality: 'epic', customerName: '将军', customerEmoji: '⚔️', reward: 150 },
      { type: 'staff', quality: 'legendary', customerName: '大法师', customerEmoji: '🔮', reward: 200 },
      { type: 'bow', quality: 'epic', customerName: '精灵王子', customerEmoji: '🧝', reward: 150 },
      { type: 'axe', quality: 'legendary', customerName: '矮人王', customerEmoji: '👑', reward: 200 },
    ],
    objectives: [
      { type: 'fulfill_orders', target: 4, description: '完成所有 4 个订单' },
      { type: 'create_quality', target: 2, quality: 'legendary', description: '创建 2 件传说品质武器' },
      { type: 'total_damage', target: 200, description: '创建的武器总伤害达到 200' },
    ],
    hints: [
      '工厂模式的优势：创建逻辑集中管理，易于扩展',
      '添加新武器类型只需修改工厂，不影响客户端代码',
      '传说品质武器伤害是普通的 3 倍！',
    ],
  },
];
