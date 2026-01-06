import { Subject, type IObserver } from '../../patterns';

/**
 * 魔法信使塔游戏 - 观察者模式实现
 * Magic Signal Tower Game - Observer Pattern Implementation
 */

// 信号类型
export type SignalType = 'fire' | 'water' | 'earth' | 'wind' | 'lightning';

// 信号接口
export interface Signal {
  type: SignalType;
  message: string;
  power: number;
}

// 魔法信号塔（被观察者/Subject）
export class MagicTower extends Subject {
  public id: string;
  public name: string;
  public position: { x: number; y: number };
  public signalHistory: Signal[] = [];
  public isActive: boolean = true;

  constructor(id: string, name: string, x: number, y: number) {
    super();
    this.id = id;
    this.name = name;
    this.position = { x, y };
  }

  // 发送信号
  sendSignal(signal: Signal): void {
    if (!this.isActive) {
      console.log(`${this.name} 塔已关闭，无法发送信号`);
      return;
    }
    this.signalHistory.push(signal);
    this.notify(signal);
  }

  // 获取订阅的生物数量
  getSubscriberCount(): number {
    return this.observers.length;
  }
}

// 魔法生物接口
export interface MagicCreature extends IObserver {
  type: CreatureType;
  position: { x: number; y: number };
  preferredSignals: SignalType[];
  lastReceivedSignal: Signal | null;
  reactions: string[];
  happiness: number;
  isAnimating: boolean;
}

// 生物类型
export type CreatureType = 'dragon' | 'fairy' | 'golem' | 'phoenix' | 'mermaid' | 'griffin';

// 生物配置
export const CREATURE_CONFIG: Record<CreatureType, {
  name: string;
  emoji: string;
  preferredSignals: SignalType[];
  description: string;
}> = {
  dragon: {
    name: '火龙',
    emoji: '🐉',
    preferredSignals: ['fire', 'wind'],
    description: '喜欢火焰和风的信号',
  },
  fairy: {
    name: '精灵',
    emoji: '🧚',
    preferredSignals: ['water', 'wind'],
    description: '喜欢水和风的信号',
  },
  golem: {
    name: '石魔',
    emoji: '🗿',
    preferredSignals: ['earth', 'fire'],
    description: '喜欢大地和火焰的信号',
  },
  phoenix: {
    name: '凤凰',
    emoji: '🔥',
    preferredSignals: ['fire', 'lightning'],
    description: '喜欢火焰和闪电的信号',
  },
  mermaid: {
    name: '人鱼',
    emoji: '🧜',
    preferredSignals: ['water', 'earth'],
    description: '喜欢水和大地的信号',
  },
  griffin: {
    name: '狮鹫',
    emoji: '🦅',
    preferredSignals: ['wind', 'lightning'],
    description: '喜欢风和闪电的信号',
  },
};

// 信号配置
export const SIGNAL_CONFIG: Record<SignalType, {
  name: string;
  emoji: string;
  color: string;
}> = {
  fire: { name: '火焰', emoji: '🔥', color: '#ff4444' },
  water: { name: '水流', emoji: '💧', color: '#4488ff' },
  earth: { name: '大地', emoji: '🌍', color: '#88aa44' },
  wind: { name: '狂风', emoji: '💨', color: '#aaddff' },
  lightning: { name: '闪电', emoji: '⚡', color: '#ffdd44' },
};

// 魔法生物类
export class Creature implements MagicCreature {
  public id: string;
  public name: string;
  public type: CreatureType;
  public position: { x: number; y: number };
  public preferredSignals: SignalType[];
  public lastReceivedSignal: Signal | null = null;
  public reactions: string[] = [];
  public happiness: number = 50;
  public isAnimating: boolean = false;

  private onUpdateCallback?: (creature: Creature) => void;

  constructor(id: string, type: CreatureType, x: number, y: number) {
    this.id = id;
    this.type = type;
    this.name = CREATURE_CONFIG[type].name;
    this.position = { x, y };
    this.preferredSignals = CREATURE_CONFIG[type].preferredSignals;
  }

  // 设置更新回调
  setUpdateCallback(callback: (creature: Creature) => void): void {
    this.onUpdateCallback = callback;
  }

  // 观察者的更新方法
  update(signal: Signal): void {
    this.lastReceivedSignal = signal;
    this.isAnimating = true;

    const isPreferred = this.preferredSignals.includes(signal.type);
    const signalEmoji = SIGNAL_CONFIG[signal.type].emoji;
    
    if (isPreferred) {
      this.happiness = Math.min(100, this.happiness + 20);
      this.reactions.push(`${this.getEmoji()} 收到 ${signalEmoji}，非常开心！+20 幸福值`);
    } else {
      this.happiness = Math.max(0, this.happiness - 10);
      this.reactions.push(`${this.getEmoji()} 收到 ${signalEmoji}，不太喜欢... -10 幸福值`);
    }

    // 通知回调
    this.onUpdateCallback?.(this);

    // 重置动画状态
    setTimeout(() => {
      this.isAnimating = false;
      this.onUpdateCallback?.(this);
    }, 800);
  }

  getEmoji(): string {
    return CREATURE_CONFIG[this.type].emoji;
  }

  getDescription(): string {
    return CREATURE_CONFIG[this.type].description;
  }
}

// 游戏关卡定义
export interface ObserverLevel {
  id: number;
  name: string;
  description: string;
  story: string;
  towers: { id: string; name: string; x: number; y: number }[];
  creatures: { id: string; type: CreatureType; x: number; y: number }[];
  objectives: {
    type: 'happiness' | 'subscribe' | 'signal';
    target: number;
    description: string;
  }[];
  hints: string[];
  requiredConnections?: { towerId: string; creatureId: string }[];
}

// 游戏关卡数据
export const OBSERVER_LEVELS: ObserverLevel[] = [
  {
    id: 1,
    name: '初识信使塔',
    description: '学习如何让魔法生物订阅信号塔',
    story: '在魔法森林中，信号塔负责向魔法生物传递重要信息。你需要帮助生物们订阅正确的信号塔！',
    towers: [
      { id: 'tower1', name: '中央塔', x: 50, y: 30 },
    ],
    creatures: [
      { id: 'dragon1', type: 'dragon', x: 25, y: 70 },
      { id: 'fairy1', type: 'fairy', x: 75, y: 70 },
    ],
    objectives: [
      { type: 'subscribe', target: 2, description: '让 2 个生物订阅信号塔' },
      { type: 'signal', target: 1, description: '发送 1 次信号' },
    ],
    hints: [
      '点击生物，然后点击信号塔来建立订阅关系',
      '订阅后，当信号塔发送信号时，所有订阅的生物都会收到通知',
      '这就是观察者模式的核心：当被观察者（信号塔）状态改变时，所有观察者（生物）都会收到通知',
    ],
  },
  {
    id: 2,
    name: '信号的选择',
    description: '了解不同生物对不同信号的反应',
    story: '每种魔法生物都有自己喜欢的信号类型。火龙喜欢火焰，精灵喜欢水流。发送正确的信号让生物们更开心！',
    towers: [
      { id: 'tower1', name: '火焰塔', x: 30, y: 30 },
      { id: 'tower2', name: '水晶塔', x: 70, y: 30 },
    ],
    creatures: [
      { id: 'dragon1', type: 'dragon', x: 20, y: 70 },
      { id: 'fairy1', type: 'fairy', x: 50, y: 70 },
      { id: 'golem1', type: 'golem', x: 80, y: 70 },
    ],
    objectives: [
      { type: 'happiness', target: 70, description: '让所有生物平均幸福值达到 70' },
      { type: 'signal', target: 3, description: '发送 3 次信号' },
    ],
    hints: [
      '查看每个生物喜欢什么类型的信号',
      '让生物订阅会发送它喜欢信号的塔',
      '发送生物喜欢的信号会增加幸福值，否则会减少',
    ],
  },
  {
    id: 3,
    name: '取消订阅',
    description: '学习如何管理订阅关系',
    story: '有时候生物需要改变订阅的信号塔。学习如何取消订阅，重新建立更好的连接！',
    towers: [
      { id: 'tower1', name: '北方塔', x: 25, y: 20 },
      { id: 'tower2', name: '南方塔', x: 75, y: 20 },
      { id: 'tower3', name: '中央塔', x: 50, y: 50 },
    ],
    creatures: [
      { id: 'phoenix1', type: 'phoenix', x: 15, y: 80 },
      { id: 'mermaid1', type: 'mermaid', x: 50, y: 80 },
      { id: 'griffin1', type: 'griffin', x: 85, y: 80 },
    ],
    objectives: [
      { type: 'happiness', target: 80, description: '让所有生物平均幸福值达到 80' },
      { type: 'subscribe', target: 4, description: '总共建立 4 个订阅关系' },
    ],
    hints: [
      '已订阅的生物再次点击信号塔可以取消订阅',
      '一个生物可以同时订阅多个信号塔',
      '合理安排订阅关系，让每个生物都能收到喜欢的信号',
    ],
  },
];
