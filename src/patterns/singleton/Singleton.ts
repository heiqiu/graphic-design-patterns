/**
 * 单例模式 - 核心实现
 * Singleton Pattern - Core implementation
 * 
 * 确保一个类只有一个实例，并提供全局访问点
 */

export class Singleton {
  private static instance: Singleton | null = null;
  private static instanceCount: number = 0;

  public readonly id: number;
  public readonly createdAt: Date;

  private constructor() {
    Singleton.instanceCount++;
    this.id = Singleton.instanceCount;
    this.createdAt = new Date();
  }

  public static getInstance(): Singleton {
    if (!Singleton.instance) {
      Singleton.instance = new Singleton();
    }
    return Singleton.instance;
  }

  public static getInstanceCount(): number {
    return Singleton.instanceCount;
  }

  public static resetInstance(): void {
    Singleton.instance = null;
    Singleton.instanceCount = 0;
  }

  public static hasInstance(): boolean {
    return Singleton.instance !== null;
  }
}

// 单例模式的通用基类
export abstract class SingletonBase {
  private static instances: Map<string, unknown> = new Map();

  protected constructor() {}

  protected static getInstanceInternal<T>(
    this: new () => T,
    key: string
  ): T {
    if (!SingletonBase.instances.has(key)) {
      SingletonBase.instances.set(key, new this());
    }
    return SingletonBase.instances.get(key) as T;
  }

  public static clearAllInstances(): void {
    SingletonBase.instances.clear();
  }
}
