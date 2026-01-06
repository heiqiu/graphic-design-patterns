<template>
  <div class="observer-game">
    <!-- 游戏头部 -->
    <header class="game-header">
      <div class="header-left">
        <button class="btn-back" @click="goBack">← 返回</button>
        <h1>🏰 魔法信使塔</h1>
        <span class="level-badge">第 {{ currentLevelData?.id }} 关</span>
      </div>
      <div class="header-right">
        <div class="score-display">⭐ {{ score }} 分</div>
        <button class="btn-hint" @click="showHint = !showHint">💡 提示</button>
        <button class="btn-restart" @click="restartLevel">🔄 重新开始</button>
      </div>
    </header>

    <!-- 关卡选择 -->
    <div v-if="gamePhase === 'select'" class="level-select">
      <h2>选择关卡</h2>
      <p class="pattern-intro">
        <strong>观察者模式</strong>：定义对象间的一种一对多的依赖关系，当一个对象状态改变时，
        所有依赖它的对象都会得到通知并自动更新。
      </p>
      <div class="level-grid">
        <div 
          v-for="level in levels" 
          :key="level.id"
          class="level-card"
          :class="{ locked: level.id > maxUnlockedLevel }"
          @click="selectLevel(level.id)"
        >
          <div class="level-number">{{ level.id }}</div>
          <div class="level-name">{{ level.name }}</div>
          <div class="level-desc">{{ level.description }}</div>
          <div v-if="level.id > maxUnlockedLevel" class="lock-icon">🔒</div>
        </div>
      </div>
    </div>

    <!-- 游戏主界面 -->
    <div v-else-if="gamePhase === 'playing'" class="game-main">
      <!-- 故事介绍 -->
      <div v-if="showStory" class="story-panel">
        <div class="story-content">
          <h3>📜 {{ currentLevelData?.name }}</h3>
          <p>{{ currentLevelData?.story }}</p>
          <div class="objectives">
            <h4>🎯 目标：</h4>
            <ul>
              <li v-for="(obj, idx) in currentLevelData?.objectives" :key="idx">
                {{ obj.description }}
              </li>
            </ul>
          </div>
          <button class="btn-start" @click="showStory = false">开始挑战</button>
        </div>
      </div>

      <!-- 提示面板 -->
      <div v-if="showHint && !showStory" class="hint-panel">
        <h4>💡 提示</h4>
        <ul>
          <li v-for="(hint, idx) in currentLevelData?.hints" :key="idx">{{ hint }}</li>
        </ul>
        <button class="btn-close" @click="showHint = false">关闭</button>
      </div>

      <!-- 游戏场景 -->
      <div class="game-scene" @click="handleSceneClick">
        <!-- 信号塔 -->
        <div 
          v-for="tower in towers" 
          :key="tower.id"
          class="tower"
          :class="{ selected: selectedCreature && !isSubscribed(selectedCreature, tower), 
                    subscribed: selectedCreature && isSubscribed(selectedCreature, tower) }"
          :style="{ left: tower.position.x + '%', top: tower.position.y + '%' }"
          @click.stop="handleTowerClick(tower)"
        >
          <div class="tower-icon">🏰</div>
          <div class="tower-name">{{ tower.name }}</div>
          <div class="subscriber-count">👥 {{ tower.getSubscriberCount() }}</div>
        </div>

        <!-- 订阅连线 -->
        <svg class="connection-lines" viewBox="0 0 100 100" preserveAspectRatio="none">
          <line 
            v-for="line in connectionLines" 
            :key="line.id"
            :x1="line.x1" :y1="line.y1"
            :x2="line.x2" :y2="line.y2"
            class="connection-line"
            :class="{ animating: line.animating }"
          />
        </svg>

        <!-- 魔法生物 -->
        <div 
          v-for="creature in creatures" 
          :key="creature.id"
          class="creature"
          :class="{ selected: selectedCreature?.id === creature.id, animating: creature.isAnimating }"
          :style="{ left: creature.position.x + '%', top: creature.position.y + '%' }"
          @click.stop="handleCreatureClick(creature)"
        >
          <div class="creature-emoji">{{ creature.getEmoji() }}</div>
          <div class="creature-name">{{ creature.name }}</div>
          <div class="happiness-bar">
            <div class="happiness-fill" :style="{ width: creature.happiness + '%' }"
                 :class="getHappinessClass(creature.happiness)"></div>
          </div>
          <div class="creature-info" v-if="selectedCreature?.id === creature.id">
            <p>{{ creature.getDescription() }}</p>
            <p>喜欢: {{ creature.preferredSignals.map(s => SIGNAL_CONFIG[s].emoji).join(' ') }}</p>
          </div>
        </div>

        <!-- 信号动画 -->
        <div v-if="activeSignal" class="signal-animation" :style="signalAnimationStyle">
          {{ SIGNAL_CONFIG[activeSignal.type].emoji }}
        </div>
      </div>

      <!-- 信号发送面板 -->
      <div class="signal-panel">
        <h3>📡 发送信号</h3>
        <p class="signal-tip">选择一个信号塔，然后发送信号给所有订阅者</p>
        <div class="signal-tower-select">
          <button 
            v-for="tower in towers" 
            :key="tower.id"
            class="tower-select-btn"
            :class="{ active: selectedTower?.id === tower.id }"
            @click="selectedTower = tower"
          >
            🏰 {{ tower.name }}
          </button>
        </div>
        <div class="signal-buttons">
          <button 
            v-for="(config, type) in SIGNAL_CONFIG" 
            :key="type"
            class="signal-btn"
            :style="{ backgroundColor: config.color }"
            :disabled="!selectedTower"
            @click="sendSignal(type as SignalType)"
          >
            {{ config.emoji }} {{ config.name }}
          </button>
        </div>
      </div>

      <!-- 状态面板 -->
      <div class="status-panel">
        <h3>📊 游戏状态</h3>
        <div class="objectives-status">
          <div 
            v-for="(obj, idx) in currentLevelData?.objectives" 
            :key="idx"
            class="objective-item"
            :class="{ completed: isObjectiveCompleted(obj) }"
          >
            <span class="objective-icon">{{ isObjectiveCompleted(obj) ? '✅' : '⬜' }}</span>
            <span>{{ obj.description }}</span>
          </div>
        </div>
        <div class="stats">
          <div>信号发送次数: {{ signalCount }}</div>
          <div>总订阅数: {{ totalSubscriptions }}</div>
          <div>平均幸福值: {{ averageHappiness.toFixed(0) }}%</div>
        </div>
        <button 
          class="btn-complete" 
          :disabled="!allObjectivesCompleted"
          @click="completeLevel"
        >
          {{ allObjectivesCompleted ? '🎉 完成关卡' : '完成所有目标后点击' }}
        </button>
      </div>

      <!-- 消息日志 -->
      <div class="message-log">
        <h3>📜 消息记录</h3>
        <div class="log-content">
          <div v-for="(msg, idx) in messageLog.slice(-10)" :key="idx" class="log-item">
            {{ msg }}
          </div>
        </div>
      </div>
    </div>

    <!-- 过关弹窗 -->
    <div v-if="showVictory" class="victory-modal">
      <div class="victory-content">
        <h2>🎉 恭喜过关！</h2>
        <div class="stars">
          <span v-for="i in 3" :key="i" :class="{ earned: i <= earnedStars }">⭐</span>
        </div>
        <p>你已经掌握了观察者模式的基本用法！</p>
        <div class="pattern-summary">
          <h4>📚 知识点回顾</h4>
          <ul>
            <li><strong>Subject（主题/被观察者）</strong>：信号塔，维护观察者列表，状态改变时通知所有观察者</li>
            <li><strong>Observer（观察者）</strong>：魔法生物，订阅主题后会收到通知</li>
            <li><strong>attach/detach</strong>：添加/移除订阅关系</li>
            <li><strong>notify</strong>：通知所有观察者</li>
          </ul>
        </div>
        <div class="victory-buttons">
          <button @click="nextLevel" v-if="currentLevel < levels.length">下一关</button>
          <button @click="goBack">返回选关</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { 
  MagicTower, 
  Creature, 
  OBSERVER_LEVELS, 
  SIGNAL_CONFIG,
  type SignalType,
  type Signal
} from './ObserverGame';

// Props
const emit = defineEmits(['back']);

// 状态
const gamePhase = ref<'select' | 'playing'>('select');
const currentLevel = ref(1);
const maxUnlockedLevel = ref(1);
const score = ref(0);
const showStory = ref(true);
const showHint = ref(false);
const showVictory = ref(false);
const earnedStars = ref(0);

// 游戏对象
const towers = ref<MagicTower[]>([]);
const creatures = ref<Creature[]>([]);
const selectedCreature = ref<Creature | null>(null);
const selectedTower = ref<MagicTower | null>(null);
const messageLog = ref<string[]>([]);
const signalCount = ref(0);
const activeSignal = ref<Signal | null>(null);
const signalAnimationStyle = ref({});

// 关卡数据
const levels = OBSERVER_LEVELS;
const currentLevelData = computed(() => levels.find(l => l.id === currentLevel.value));

// 计算属性
const connectionLines = computed(() => {
  const lines: { id: string; x1: number; y1: number; x2: number; y2: number; animating: boolean }[] = [];
  towers.value.forEach(tower => {
    tower.getObservers().forEach(observer => {
      const creature = creatures.value.find(c => c.id === observer.id);
      if (creature) {
        lines.push({
          id: `${tower.id}-${creature.id}`,
          x1: tower.position.x,
          y1: tower.position.y + 5,
          x2: creature.position.x,
          y2: creature.position.y - 5,
          animating: creature.isAnimating
        });
      }
    });
  });
  return lines;
});

const totalSubscriptions = computed(() => {
  return towers.value.reduce((sum, t) => sum + t.getSubscriberCount(), 0);
});

const averageHappiness = computed(() => {
  if (creatures.value.length === 0) return 0;
  return creatures.value.reduce((sum, c) => sum + c.happiness, 0) / creatures.value.length;
});

const allObjectivesCompleted = computed(() => {
  if (!currentLevelData.value) return false;
  return currentLevelData.value.objectives.every(obj => isObjectiveCompleted(obj));
});

// 方法
function goBack() {
  if (gamePhase.value === 'playing') {
    gamePhase.value = 'select';
  } else {
    emit('back');
  }
}

function selectLevel(levelId: number) {
  if (levelId > maxUnlockedLevel.value) return;
  currentLevel.value = levelId;
  gamePhase.value = 'playing';
  showStory.value = true;
  showVictory.value = false;
  initLevel();
}

function initLevel() {
  const level = currentLevelData.value;
  if (!level) return;

  // 重置状态
  towers.value = [];
  creatures.value = [];
  messageLog.value = [];
  signalCount.value = 0;
  selectedCreature.value = null;
  selectedTower.value = null;

  // 创建信号塔
  level.towers.forEach(t => {
    towers.value.push(new MagicTower(t.id, t.name, t.x, t.y));
  });

  // 创建魔法生物
  level.creatures.forEach(c => {
    const creature = new Creature(c.id, c.type, c.x, c.y);
    creature.setUpdateCallback((updatedCreature) => {
      // 触发响应式更新
      const idx = creatures.value.findIndex(cr => cr.id === updatedCreature.id);
      if (idx !== -1) {
        creatures.value[idx] = updatedCreature;
      }
    });
    creatures.value.push(creature);
  });

  addMessage(`🎮 第 ${level.id} 关开始！`);
}

function restartLevel() {
  showStory.value = true;
  showVictory.value = false;
  initLevel();
}

function handleSceneClick() {
  selectedCreature.value = null;
}

function handleCreatureClick(creature: Creature) {
  if (selectedCreature.value?.id === creature.id) {
    selectedCreature.value = null;
  } else {
    selectedCreature.value = creature;
    addMessage(`${creature.getEmoji()} 选中了 ${creature.name}`);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function handleTowerClick(tower: any) {
  if (!selectedCreature.value) {
    selectedTower.value = tower;
    addMessage(`🏰 选中了 ${tower.name}`);
    return;
  }

  const creature = selectedCreature.value;
  
  if (isSubscribed(creature, tower)) {
    // 取消订阅
    tower.detach(creature);
    addMessage(`${creature.getEmoji()} ${creature.name} 取消订阅了 ${tower.name}`);
  } else {
    // 添加订阅
    tower.attach(creature);
    addMessage(`${creature.getEmoji()} ${creature.name} 订阅了 ${tower.name}`);
    score.value += 10;
  }
  
  selectedCreature.value = null;
  // 强制更新视图
  towers.value = [...towers.value];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isSubscribed(creature: Creature, tower: any): boolean {
  return tower.getObservers().some((o: { id: string }) => o.id === creature.id);
}

function sendSignal(type: SignalType) {
  if (!selectedTower.value) return;

  const signal: Signal = {
    type,
    message: `来自 ${selectedTower.value.name} 的 ${SIGNAL_CONFIG[type].name} 信号`,
    power: 100
  };

  // 显示信号动画
  activeSignal.value = signal;
  signalAnimationStyle.value = {
    left: selectedTower.value.position.x + '%',
    top: selectedTower.value.position.y + '%',
    backgroundColor: SIGNAL_CONFIG[type].color
  };

  // 发送信号
  selectedTower.value.sendSignal(signal);
  signalCount.value++;
  
  const subscriberCount = selectedTower.value.getSubscriberCount();
  addMessage(`📡 ${selectedTower.value.name} 发送了 ${SIGNAL_CONFIG[type].emoji} ${SIGNAL_CONFIG[type].name} 信号，通知了 ${subscriberCount} 个订阅者`);
  
  score.value += 5 * subscriberCount;

  // 清除动画
  setTimeout(() => {
    activeSignal.value = null;
  }, 1000);

  // 强制更新
  creatures.value = [...creatures.value];
}

function addMessage(msg: string) {
  const time = new Date().toLocaleTimeString();
  messageLog.value.push(`[${time}] ${msg}`);
}

function getHappinessClass(happiness: number): string {
  if (happiness >= 70) return 'high';
  if (happiness >= 40) return 'medium';
  return 'low';
}

function isObjectiveCompleted(obj: { type: string; target: number }): boolean {
  switch (obj.type) {
    case 'subscribe':
      return totalSubscriptions.value >= obj.target;
    case 'signal':
      return signalCount.value >= obj.target;
    case 'happiness':
      return averageHappiness.value >= obj.target;
    default:
      return false;
  }
}

function completeLevel() {
  if (!allObjectivesCompleted.value) return;
  
  // 计算星级
  const happiness = averageHappiness.value;
  if (happiness >= 90) earnedStars.value = 3;
  else if (happiness >= 70) earnedStars.value = 2;
  else earnedStars.value = 1;

  score.value += earnedStars.value * 50;
  
  // 解锁下一关
  if (currentLevel.value >= maxUnlockedLevel.value) {
    maxUnlockedLevel.value = Math.min(currentLevel.value + 1, levels.length);
  }

  showVictory.value = true;
}

function nextLevel() {
  showVictory.value = false;
  if (currentLevel.value < levels.length) {
    currentLevel.value++;
    showStory.value = true;
    initLevel();
  }
}

// 初始化
onMounted(() => {
  addMessage('🎮 欢迎来到魔法信使塔游戏！');
});
</script>

<style scoped>
.observer-game {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  color: #fff;
  font-family: 'Microsoft YaHei', sans-serif;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: rgba(0, 0, 0, 0.3);
  border-bottom: 2px solid #e94560;
}

.header-left, .header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.game-header h1 {
  margin: 0;
  font-size: 1.5rem;
  color: #e94560;
}

.level-badge {
  background: #e94560;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
}

.score-display {
  background: linear-gradient(45deg, #ffd700, #ff8c00);
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: bold;
  color: #000;
}

button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.3s;
}

.btn-back {
  background: transparent;
  color: #fff;
  border: 1px solid #fff;
}

.btn-back:hover {
  background: rgba(255, 255, 255, 0.1);
}

.btn-hint {
  background: #4834d4;
  color: #fff;
}

.btn-restart {
  background: #eb4d4b;
  color: #fff;
}

/* 关卡选择 */
.level-select {
  padding: 2rem;
  max-width: 1000px;
  margin: 0 auto;
}

.level-select h2 {
  text-align: center;
  color: #e94560;
  margin-bottom: 1rem;
}

.pattern-intro {
  text-align: center;
  background: rgba(233, 69, 96, 0.2);
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 2rem;
  line-height: 1.8;
}

.level-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.level-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.level-card:hover:not(.locked) {
  transform: translateY(-5px);
  background: rgba(233, 69, 96, 0.3);
}

.level-card.locked {
  opacity: 0.5;
  cursor: not-allowed;
}

.level-number {
  font-size: 3rem;
  font-weight: bold;
  color: #e94560;
  margin-bottom: 0.5rem;
}

.level-name {
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.level-desc {
  color: #aaa;
  font-size: 0.875rem;
}

.lock-icon {
  position: absolute;
  top: 1rem;
  right: 1rem;
  font-size: 1.5rem;
}

/* 游戏主界面 */
.game-main {
  display: grid;
  grid-template-columns: 1fr 300px;
  grid-template-rows: 1fr auto auto;
  gap: 1rem;
  padding: 1rem;
  height: calc(100vh - 80px);
}

/* 故事面板 */
.story-panel {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.story-content {
  background: linear-gradient(135deg, #1a1a2e, #16213e);
  padding: 2rem;
  border-radius: 1rem;
  max-width: 500px;
  border: 2px solid #e94560;
}

.story-content h3 {
  color: #e94560;
  margin-bottom: 1rem;
}

.objectives {
  background: rgba(255, 255, 255, 0.1);
  padding: 1rem;
  border-radius: 0.5rem;
  margin: 1rem 0;
}

.objectives h4 {
  margin: 0 0 0.5rem 0;
  color: #ffd700;
}

.objectives ul {
  margin: 0;
  padding-left: 1.5rem;
}

.btn-start {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(45deg, #e94560, #ff6b6b);
  color: #fff;
  font-size: 1.25rem;
  font-weight: bold;
}

/* 提示面板 */
.hint-panel {
  position: absolute;
  top: 100px;
  right: 20px;
  background: rgba(72, 52, 212, 0.95);
  padding: 1rem;
  border-radius: 0.5rem;
  max-width: 300px;
  z-index: 50;
}

.hint-panel h4 {
  margin: 0 0 0.5rem 0;
}

.hint-panel ul {
  margin: 0;
  padding-left: 1.25rem;
  font-size: 0.875rem;
}

.btn-close {
  margin-top: 0.5rem;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  width: 100%;
}

/* 游戏场景 */
.game-scene {
  grid-column: 1;
  grid-row: 1 / 3;
  background: linear-gradient(180deg, #0a0a1a 0%, #1a1a3e 100%);
  border-radius: 1rem;
  position: relative;
  overflow: hidden;
  min-height: 400px;
}

.connection-lines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.connection-line {
  stroke: #e94560;
  stroke-width: 0.3;
  stroke-dasharray: 5 3;
  opacity: 0.6;
}

.connection-line.animating {
  stroke: #ffd700;
  stroke-width: 0.5;
  opacity: 1;
  animation: pulse-line 0.5s ease-in-out;
}

@keyframes pulse-line {
  0%, 100% { stroke-width: 0.3; }
  50% { stroke-width: 0.8; }
}

/* 信号塔 */
.tower {
  position: absolute;
  transform: translate(-50%, -50%);
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  padding: 0.5rem;
  border-radius: 0.5rem;
}

.tower:hover, .tower.selected {
  background: rgba(233, 69, 96, 0.3);
  transform: translate(-50%, -50%) scale(1.1);
}

.tower.subscribed {
  background: rgba(46, 213, 115, 0.3);
}

.tower-icon {
  font-size: 2.5rem;
  filter: drop-shadow(0 0 10px rgba(233, 69, 96, 0.5));
}

.tower-name {
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.subscriber-count {
  font-size: 0.75rem;
  color: #aaa;
}

/* 魔法生物 */
.creature {
  position: absolute;
  transform: translate(-50%, -50%);
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  padding: 0.5rem;
  border-radius: 0.5rem;
}

.creature:hover, .creature.selected {
  background: rgba(72, 52, 212, 0.3);
  transform: translate(-50%, -50%) scale(1.1);
}

.creature.animating {
  animation: bounce 0.5s ease-in-out;
}

@keyframes bounce {
  0%, 100% { transform: translate(-50%, -50%) scale(1); }
  50% { transform: translate(-50%, -60%) scale(1.2); }
}

.creature-emoji {
  font-size: 2.5rem;
}

.creature-name {
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.happiness-bar {
  width: 60px;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  margin: 0.25rem auto 0;
  overflow: hidden;
}

.happiness-fill {
  height: 100%;
  transition: all 0.3s;
  border-radius: 3px;
}

.happiness-fill.high { background: #2ed573; }
.happiness-fill.medium { background: #ffd700; }
.happiness-fill.low { background: #eb4d4b; }

.creature-info {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.9);
  padding: 0.5rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  white-space: nowrap;
  z-index: 10;
}

.creature-info p {
  margin: 0.25rem 0;
}

/* 信号动画 */
.signal-animation {
  position: absolute;
  transform: translate(-50%, -50%);
  font-size: 3rem;
  animation: signal-expand 1s ease-out forwards;
  pointer-events: none;
}

@keyframes signal-expand {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(3);
  }
}

/* 信号面板 */
.signal-panel {
  grid-column: 1;
  grid-row: 3;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 1rem;
}

.signal-panel h3 {
  margin: 0 0 0.5rem 0;
  color: #e94560;
}

.signal-tip {
  font-size: 0.875rem;
  color: #aaa;
  margin: 0 0 0.5rem 0;
}

.signal-tower-select {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.tower-select-btn {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  flex: 1;
}

.tower-select-btn.active {
  background: #e94560;
}

.signal-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.signal-btn {
  flex: 1;
  min-width: 80px;
  color: #fff;
  font-weight: bold;
}

.signal-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 状态面板 */
.status-panel {
  grid-column: 2;
  grid-row: 1;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 1rem;
}

.status-panel h3 {
  margin: 0 0 1rem 0;
  color: #e94560;
}

.objectives-status {
  margin-bottom: 1rem;
}

.objective-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 0.25rem;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.objective-item.completed {
  background: rgba(46, 213, 115, 0.2);
}

.stats {
  font-size: 0.875rem;
  color: #aaa;
  margin-bottom: 1rem;
}

.stats > div {
  padding: 0.25rem 0;
}

.btn-complete {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(45deg, #2ed573, #1e90ff);
  color: #fff;
  font-weight: bold;
}

.btn-complete:disabled {
  background: #666;
  cursor: not-allowed;
}

/* 消息日志 */
.message-log {
  grid-column: 2;
  grid-row: 2 / 4;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 1rem;
  padding: 1rem;
  display: flex;
  flex-direction: column;
}

.message-log h3 {
  margin: 0 0 0.5rem 0;
  color: #e94560;
  font-size: 1rem;
}

.log-content {
  flex: 1;
  overflow-y: auto;
  font-size: 0.75rem;
  color: #aaa;
}

.log-item {
  padding: 0.25rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

/* 胜利弹窗 */
.victory-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.victory-content {
  background: linear-gradient(135deg, #1a1a2e, #16213e);
  padding: 2rem;
  border-radius: 1rem;
  max-width: 500px;
  text-align: center;
  border: 3px solid #ffd700;
}

.victory-content h2 {
  color: #ffd700;
  margin-bottom: 1rem;
}

.stars {
  font-size: 3rem;
  margin: 1rem 0;
}

.stars span {
  opacity: 0.3;
  margin: 0 0.25rem;
}

.stars span.earned {
  opacity: 1;
  animation: star-pop 0.5s ease-out;
}

@keyframes star-pop {
  0% { transform: scale(0); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
}

.pattern-summary {
  background: rgba(255, 255, 255, 0.1);
  padding: 1rem;
  border-radius: 0.5rem;
  text-align: left;
  margin: 1rem 0;
}

.pattern-summary h4 {
  color: #e94560;
  margin: 0 0 0.5rem 0;
}

.pattern-summary ul {
  margin: 0;
  padding-left: 1.25rem;
  font-size: 0.875rem;
}

.pattern-summary li {
  margin: 0.5rem 0;
}

.victory-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.victory-buttons button {
  padding: 0.75rem 2rem;
  background: linear-gradient(45deg, #e94560, #ff6b6b);
  color: #fff;
  font-weight: bold;
}
</style>
