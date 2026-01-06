/**
 * 观察者模式 - 核心接口和基类
 * Observer Pattern - Core interfaces and base classes
 */

// 观察者接口
export interface IObserver {
  id: string;
  name: string;
  update(message: any): void;
}

// 被观察者接口（主题）
export interface ISubject {
  attach(observer: IObserver): void;
  detach(observer: IObserver): void;
  notify(message: any): void;
  getObservers(): IObserver[];
}

// 被观察者基类
export abstract class Subject implements ISubject {
  protected observers: IObserver[] = [];
  
  attach(observer: IObserver): void {
    const isExist = this.observers.includes(observer);
    if (isExist) {
      console.log('Observer already attached.');
      return;
    }
    this.observers.push(observer);
  }
  
  detach(observer: IObserver): void {
    const observerIndex = this.observers.indexOf(observer);
    if (observerIndex === -1) {
      console.log('Observer not found.');
      return;
    }
    this.observers.splice(observerIndex, 1);
  }
  
  notify(message: any): void {
    for (const observer of this.observers) {
      observer.update(message);
    }
  }
  
  getObservers(): IObserver[] {
    return [...this.observers];
  }
}
