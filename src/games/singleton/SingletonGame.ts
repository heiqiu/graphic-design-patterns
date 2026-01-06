/**
 * 单例模式游戏 - 魔法水晶球
 * Singleton Pattern Game - Magic Crystal Ball
 * 
 * 游戏概念：整个王国只有一个魔法水晶球，所有魔法师都从同一个水晶球获取能量
 */

// 魔法水晶球 - 单例
export class MagicCrystalBall {
  private static instance: MagicCrystalBall | null = null;
  private static creationAttempts: number = 0;

  public readonly id: string;
  public energy: number = 100;
  public readonly createdAt: Date;
  private connectedWizards: Wizard[] = [];

  private constructor() {
    this.id = 'crystal-' + Math.random().toString(36).substr(2, 9);
    this.createdAt = new Date();
  }

  public static getInstance(): MagicCrystalBall {
    MagicCrystalBall.creationAttempts++;
    if (!MagicCrystalBall.instance) {
      MagicCrystalBall.instance = new MagicCrystalBall();
    }
    return MagicCrystalBall.instance;
  }

  public static getCreationAttempts(): number {
    return MagicCrystalBall.creationAttempts;
  }

  public static hasInstance(): boolean {
    return MagicCrystalBall.instance !== null;
  }

  public static reset(): void {
    MagicCrystalBall.instance = null;
    MagicCrystalBall.creationAttempts = 0;
  }

  public connectWizard(wizard: Wizard): boolean {
    if (!this.connectedWizards.find(w => w.id === wizard.id)) {
      this.connectedWizards.push(wizard);
      return true;
    }
    return false;
  }

  public disconnectWizard(wizard: Wizard): void {
    this.connectedWizards = this.connectedWizards.filter(w => w.id !== wizard.id);
  }

  public getConnectedWizards(): Wizard[] {
    return [...this.connectedWizards];
  }

  public transferEnergy(amount: number): number {
    const transferred = Math.min(amount, this.energy);
    this.energy -= transferred;
    return transferred;
  }

  public rechargeEnergy(amount: number): void {
    this.energy = Math.min(100, this.energy + amount);
  }
}

// 魔法师类
export class Wizard {
  public id: string;
  public name: string;
  public emoji: string;
  public energy: number = 0;
  public maxEnergy: number = 50;
  public crystalReference: MagicCrystalBall | null = null;

  constructor(name: string, emoji: string) {
    this.id = 'wizard-' + Math.random().toString(36).substr(2, 9);
    this.name = name;
    this.emoji = emoji;
  }

  public connectToCrystal(): { success: boolean; message: string; isSameInstance: boolean } {
    const crystal = MagicCrystalBall.getInstance();
    const isNew = this.crystalReference === null;
    const isSame = this.crystalReference === crystal;
    
    this.crystalReference = crystal;
    crystal.connectWizard(this);

    return {
      success: true,
      message: isNew 
        ? `${this.emoji} ${this.name} 首次连接到水晶球` 
        : `${this.emoji} ${this.name} 再次获取水晶球引用（同一个实例）`,
      isSameInstance: !isNew && isSame
    };
  }

  public drawEnergy(amount: number): { success: boolean; amount: number; message: string } {
    if (!this.crystalReference) {
      return { success: false, amount: 0, message: '未连接到水晶球' };
    }

    const canDraw = this.maxEnergy - this.energy;
    const toDraw = Math.min(amount, canDraw);
    const drawn = this.crystalReference.transferEnergy(toDraw);
    this.energy += drawn;

    return {
      success: true,
      amount: drawn,
      message: `${this.emoji} ${this.name} 从水晶球获取了 ${drawn} 点能量`
    };
  }
}

// 游戏关卡定义
export interface SingletonLevel {
  id: number;
  name: string;
  description: string;
  story: string;
  wizards: { name: string; emoji: string }[];
  objectives: {
    type: 'connect' | 'verify_singleton' | 'draw_energy' | 'all_same_ref';
    target: number;
    description: string;
  }[];
  hints: string[];
}

export const SINGLETON_LEVELS: SingletonLevel[] = [
  {
    id: 1,
    name: '唯一的水晶球',
    description: '学习单例模式的核心概念',
    story: '魔法王国中只有一个强大的水晶球作为能量源。无论多少魔法师尝试获取水晶球，他们得到的都是同一个实例。',
    wizards: [
      { name: '梅林', emoji: '🧙‍♂️' },
      { name: '甘道夫', emoji: '🧙' },
    ],
    objectives: [
      { type: 'connect', target: 2, description: '让 2 位魔法师连接水晶球' },
      { type: 'verify_singleton', target: 1, description: '验证所有魔法师获得的是同一个水晶球' },
    ],
    hints: [
      '点击魔法师让他们获取水晶球的引用',
      '观察：无论调用多少次 getInstance()，返回的都是同一个实例',
      '单例模式确保一个类只有一个实例',
    ],
  },
  {
    id: 2,
    name: '共享能量源',
    description: '理解单例模式的状态共享',
    story: '所有魔法师都从同一个水晶球获取能量。当一个魔法师消耗能量时，其他魔法师能看到水晶球的能量减少。',
    wizards: [
      { name: '哈利', emoji: '⚡' },
      { name: '赫敏', emoji: '📚' },
      { name: '罗恩', emoji: '🦁' },
    ],
    objectives: [
      { type: 'connect', target: 3, description: '让 3 位魔法师都连接水晶球' },
      { type: 'draw_energy', target: 50, description: '总共从水晶球获取 50 点能量' },
      { type: 'all_same_ref', target: 1, description: '确认所有魔法师引用的是同一个水晶球' },
    ],
    hints: [
      '让魔法师获取能量，观察水晶球的能量变化',
      '因为是单例，所有魔法师看到的是同一个水晶球的状态',
      '这就是单例模式的状态共享特性',
    ],
  },
  {
    id: 3,
    name: '全局访问点',
    description: '掌握单例模式的全局访问特性',
    story: '在魔法世界的任何角落，魔法师们都可以通过 getInstance() 方法访问到同一个水晶球，这就是单例提供的全局访问点。',
    wizards: [
      { name: '邓布利多', emoji: '🔮' },
      { name: '伏地魔', emoji: '🐍' },
      { name: '斯内普', emoji: '🧪' },
      { name: '麦格', emoji: '🐱' },
    ],
    objectives: [
      { type: 'connect', target: 4, description: '让所有魔法师获取水晶球引用' },
      { type: 'verify_singleton', target: 3, description: '验证 3 次单例特性' },
      { type: 'draw_energy', target: 80, description: '协调使用水晶球能量达到 80 点' },
    ],
    hints: [
      'getInstance() 是单例模式的全局访问点',
      '无论何时何地调用，都返回同一个实例',
      '单例模式常用于：配置管理、日志记录、数据库连接池等场景',
    ],
  },
];
