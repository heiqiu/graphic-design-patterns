/**
 * 游戏引擎类型定义
 */

// 游戏状态
export type GameStatus = 'idle' | 'playing' | 'paused' | 'completed' | 'failed';

// 游戏难度
export type GameDifficulty = 'easy' | 'medium' | 'hard';

// 游戏关卡接口
export interface GameLevel {
  id: number;
  name: string;
  description: string;
  objectives: string[];
  hints: string[];
  targetScore: number;
}

// 游戏配置
export interface GameConfig {
  difficulty: GameDifficulty;
  soundEnabled: boolean;
  animationSpeed: number;
}

// 游戏结果
export interface GameResult {
  score: number;
  starsEarned: number;
  timeSpent: number;
  completed: boolean;
}

// 设计模式类型
export type PatternType = 
  | 'observer' 
  | 'singleton' 
  | 'factory' 
  | 'abstract-factory' 
  | 'builder' 
  | 'prototype'
  | 'adapter'
  | 'decorator'
  | 'strategy'
  | 'command';

// 设计模式分类
export type PatternCategory = 'creational' | 'structural' | 'behavioral';

// 设计模式信息
export interface PatternInfo {
  type: PatternType;
  category: PatternCategory;
  name: string;
  nameCn: string;
  description: string;
  descriptionCn: string;
  icon: string;
  color: string;
}
