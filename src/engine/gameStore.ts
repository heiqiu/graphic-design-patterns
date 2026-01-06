import { reactive, readonly } from 'vue';
import type { GameStatus, GameConfig } from './types';

/**
 * 游戏全局状态管理
 */
interface GameState {
  currentPattern: string | null;
  currentLevel: number;
  totalScore: number;
  status: GameStatus;
  config: GameConfig;
  completedPatterns: string[];
  unlockedPatterns: string[];
}

const state = reactive<GameState>({
  currentPattern: null,
  currentLevel: 1,
  totalScore: 0,
  status: 'idle',
  config: {
    difficulty: 'easy',
    soundEnabled: true,
    animationSpeed: 1,
  },
  completedPatterns: [],
  unlockedPatterns: ['observer'], // 初始解锁观察者模式
});

// Actions
const actions = {
  setCurrentPattern(pattern: string | null) {
    state.currentPattern = pattern;
  },

  setLevel(level: number) {
    state.currentLevel = level;
  },

  addScore(score: number) {
    state.totalScore += score;
  },

  setStatus(status: GameStatus) {
    state.status = status;
  },

  updateConfig(config: Partial<GameConfig>) {
    Object.assign(state.config, config);
  },

  completePattern(pattern: string) {
    if (!state.completedPatterns.includes(pattern)) {
      state.completedPatterns.push(pattern);
    }
  },

  unlockPattern(pattern: string) {
    if (!state.unlockedPatterns.includes(pattern)) {
      state.unlockedPatterns.push(pattern);
    }
  },

  resetGame() {
    state.currentPattern = null;
    state.currentLevel = 1;
    state.status = 'idle';
  },
};

// Getters
const getters = {
  isPatternUnlocked: (pattern: string) => state.unlockedPatterns.includes(pattern),
  isPatternCompleted: (pattern: string) => state.completedPatterns.includes(pattern),
  getCurrentState: () => readonly(state),
};

export const useGameStore = () => ({
  state: readonly(state),
  ...actions,
  ...getters,
});

export type { GameState };
