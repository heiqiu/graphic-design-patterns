/**
 * 策略模式 - 核心实现
 * Strategy Pattern - Core implementation
 */

// 策略接口
export interface IStrategy {
  execute(data: any): any;
  getName(): string;
}

// 上下文类
export class Context {
  private strategy: IStrategy;

  constructor(strategy: IStrategy) {
    this.strategy = strategy;
  }

  public setStrategy(strategy: IStrategy): void {
    this.strategy = strategy;
  }

  public getStrategy(): IStrategy {
    return this.strategy;
  }

  public executeStrategy(data: any): any {
    return this.strategy.execute(data);
  }
}
