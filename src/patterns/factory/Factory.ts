/**
 * 工厂模式 - 核心实现
 * Factory Pattern - Core implementation
 */

// 产品接口
export interface IProduct {
  id: string;
  name: string;
  type: string;
  create(): void;
}

// 简单工厂
export class SimpleFactory {
  public static createProduct(type: string): IProduct {
    switch (type) {
      case 'A':
        return new ProductA();
      case 'B':
        return new ProductB();
      default:
        throw new Error(`Unknown product type: ${type}`);
    }
  }
}

class ProductA implements IProduct {
  id = 'product-a-' + Math.random().toString(36).substr(2, 6);
  name = 'Product A';
  type = 'A';
  create() { console.log('Creating Product A'); }
}

class ProductB implements IProduct {
  id = 'product-b-' + Math.random().toString(36).substr(2, 6);
  name = 'Product B';
  type = 'B';
  create() { console.log('Creating Product B'); }
}

// 工厂方法模式 - 抽象工厂
export abstract class Creator {
  abstract factoryMethod(): IProduct;
  
  public someOperation(): string {
    const product = this.factoryMethod();
    return `Creator: Working with ${product.name}`;
  }
}
