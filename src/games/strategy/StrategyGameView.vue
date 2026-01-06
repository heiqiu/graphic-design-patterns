<template>
  <div class="strategy-game">
    <header class="game-header">
      <div class="header-left">
        <button class="btn-back" @click="goBack">← 返回</button>
        <h1>⚔️ 魔法战斗竞技场</h1>
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
        <strong>策略模式</strong>：定义一系列算法，把它们封装起来，并且使它们可以相互替换。
        策略模式让算法独立于使用它的客户端而变化。
      </p>
      <div class="strategy-guide">
        <h4>🎯 克制关系</h4>
        <div class="relation-chart">
          <span>⚔️ 猛攻 → ✨ 魔法 → 🛡️ 防御 → ⚔️ 猛攻</span>
        </div>
      </div>
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
        </div>
      </div>
    </div>

    <!-- 游戏主界面 -->
    <div v-else-if="gamePhase === 'playing'" class="game-main">
      <!-- 故事面板 -->
      <div v-if="showStory" class="story-panel">
        <div class="story-content">
          <h3>📜 {{ currentLevelData?.name }}</h3>
          <p>{{ currentLevelData?.story }}</p>
          <div class="objectives">
            <h4>🎯 目标：</h4>
            <ul>
              <li v-for="(obj, idx) in currentLevelData?.objectives" :key="idx">{{ obj.description }}</li>
            </ul>
          </div>
          <button class="btn-start" @click="startBattle">开始战斗</button>
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

      <!-- 战斗区域 -->
      <div class="battle-arena">
        <!-- 玩家 -->
        <div class="fighter-section player-section">
          <div class="fighter-card player" :class="{ damaged: playerDamaged }">
            <div class="fighter-emoji">🦸</div>
            <div class="fighter-name">勇者</div>
            <div class="fighter-hp">
              <div class="hp-bar">
                <div class="hp-fill" :style="{ width: (player.hp / player.maxHp * 100) + '%' }"></div>
              </div>
              <span>{{ player.hp }}/{{ player.maxHp }}</span>
            </div>
            <div class="fighter-stats">
              ⚔️ {{ player.attack }} | 🛡️ {{ player.defense }}
            </div>
            <div v-if="player.strategy" class="current-strategy">
              当前策略: {{ player.strategy.emoji }} {{ player.strategy.name }}
            </div>
          </div>
        </div>

        <!-- VS -->
        <div class="vs-section">
          <div class="vs-text">VS</div>
          <div v-if="lastBattleResult" class="battle-result" :class="lastBattleResult.effectiveness">
            {{ lastBattleResult.message }}
          </div>
        </div>

        <!-- 敌人 -->
        <div class="fighter-section enemy-section">
          <div v-if="currentEnemy" class="fighter-card enemy" :class="{ damaged: enemyDamaged }">
            <div class="fighter-emoji">{{ currentEnemy.emoji }}</div>
            <div class="fighter-name">{{ currentEnemy.name }}</div>
            <div class="fighter-hp">
              <div class="hp-bar enemy-hp">
                <div class="hp-fill" :style="{ width: (enemyHp / currentEnemy.hp * 100) + '%' }"></div>
              </div>
              <span>{{ enemyHp }}/{{ currentEnemy.hp }}</span>
            </div>
            <div class="fighter-stats">
              ⚔️ {{ currentEnemy.attack }} | 🛡️ {{ currentEnemy.defense }}
            </div>
            <div class="enemy-hint">{{ currentEnemy.description }}</div>
            <div v-if="enemyLastStrategy" class="last-strategy">
              上次使用: {{ enemyLastStrategy.emoji }} {{ enemyLastStrategy.name }}
            </div>
          </div>
          <div v-else class="victory-placeholder">
            <div class="victory-emoji">🏆</div>
            <div>所有敌人已击败！</div>
          </div>
        </div>
      </div>

      <!-- 策略选择 -->
      <div class="strategy-section">
        <h3>🎯 选择战斗策略</h3>
        <div class="strategy-cards">
          <div 
            v-for="strategy in availableStrategies" 
            :key="strategy.name"
            class="strategy-card"
            :class="{ selected: selectedStrategy?.name === strategy.name }"
            @click="selectStrategy(strategy)"
          >
            <div class="strategy-emoji">{{ strategy.emoji }}</div>
            <div class="strategy-name">{{ strategy.name }}</div>
            <div class="strategy-desc">{{ strategy.description }}</div>
          </div>
        </div>
        <button 
          class="btn-attack" 
          :disabled="!selectedStrategy || !currentEnemy || isBattling"
          @click="executeBattle"
        >
          {{ isBattling ? '战斗中...' : '⚡ 发起攻击' }}
        </button>

        <!-- 代码展示 -->
        <div class="code-display">
          <pre><code>// 策略模式：运行时切换策略
context.setStrategy(new {{ selectedStrategy?.name || '???' }}Strategy());
context.executeStrategy(battleData);</code></pre>
        </div>
      </div>

      <!-- 状态面板 -->
      <div class="status-panel">
        <h3>📊 战斗统计</h3>
        <div class="objectives-status">
          <div 
            v-for="(obj, idx) in currentLevelData?.objectives" 
            :key="idx"
            class="objective-item"
            :class="{ completed: isObjectiveCompleted(obj) }"
          >
            <span>{{ isObjectiveCompleted(obj) ? '✅' : '⬜' }}</span>
            <span>{{ obj.description }}</span>
          </div>
        </div>
        <div class="stats">
          <div>击败敌人: {{ defeatedEnemies }}/{{ totalEnemies }}</div>
          <div>克制次数: {{ superEffectiveCount }}</div>
          <div>策略使用: {{ strategyUsageDisplay }}</div>
        </div>
        <button 
          class="btn-complete" 
          :disabled="!allObjectivesCompleted"
          @click="completeLevel"
        >
          {{ allObjectivesCompleted ? '🎉 完成关卡' : '完成所有目标' }}
        </button>
      </div>

      <!-- 战斗日志 -->
      <div class="battle-log">
        <h3>📜 战斗记录</h3>
        <div class="log-content">
          <div v-for="(msg, idx) in battleLog.slice(-10)" :key="idx" class="log-item" :class="msg.type">
            {{ msg.text }}
          </div>
        </div>
      </div>
    </div>

    <!-- 过关弹窗 -->
    <div v-if="showVictory" class="victory-modal">
      <div class="victory-content">
        <h2>🎉 战斗胜利！</h2>
        <div class="stars">
          <span v-for="i in 3" :key="i" :class="{ earned: i <= earnedStars }">⭐</span>
        </div>
        <div class="pattern-summary">
          <h4>📚 策略模式要点</h4>
          <ul>
            <li><strong>策略接口</strong>：定义算法的公共接口</li>
            <li><strong>具体策略</strong>：实现不同的算法（攻击、防御、魔法）</li>
            <li><strong>上下文</strong>：持有策略引用，可在运行时切换</li>
            <li><strong>优势</strong>：算法可独立变化，客户端可动态切换策略</li>
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
import { ref, computed, reactive, onMounted } from 'vue';
import { 
  AVAILABLE_STRATEGIES, 
  ENEMIES, 
  STRATEGY_LEVELS,
  type IBattleStrategy,
  type Fighter,
  type BattleResult
} from './StrategyGame';

const emit = defineEmits(['back']);

const gamePhase = ref<'select' | 'playing'>('select');
const currentLevel = ref(1);
const maxUnlockedLevel = ref(1);
const score = ref(0);
const showStory = ref(true);
const showHint = ref(false);
const showVictory = ref(false);
const earnedStars = ref(0);

const player = reactive<Fighter>({
  name: '勇者',
  emoji: '🦸',
  hp: 100,
  maxHp: 100,
  attack: 15,
  defense: 10,
  strategy: null
});

const currentEnemyIndex = ref(0);
const enemyHp = ref(0);
const enemyLastStrategy = ref<IBattleStrategy | null>(null);
const selectedStrategy = ref<IBattleStrategy | null>(null);
const lastBattleResult = ref<BattleResult | null>(null);
const isBattling = ref(false);
const playerDamaged = ref(false);
const enemyDamaged = ref(false);

const battleLog = ref<{ text: string; type: string }[]>([]);
const strategyUsage = ref<Record<string, number>>({});
const superEffectiveCount = ref(0);
const defeatedEnemies = ref(0);

const levels = STRATEGY_LEVELS;
const currentLevelData = computed(() => levels.find(l => l.id === currentLevel.value));
const availableStrategies = AVAILABLE_STRATEGIES;

const enemyList = computed(() => {
  if (!currentLevelData.value) return [];
  return currentLevelData.value.enemies.map(idx => ENEMIES[idx]);
});

const totalEnemies = computed(() => enemyList.value.length);

const currentEnemy = computed(() => {
  if (currentEnemyIndex.value >= enemyList.value.length) return null;
  return enemyList.value[currentEnemyIndex.value];
});

const strategyUsageDisplay = computed(() => {
  return Object.entries(strategyUsage.value)
    .map(([name, count]) => `${name}:${count}`)
    .join(' | ') || '暂无';
});

const allObjectivesCompleted = computed(() => {
  if (!currentLevelData.value) return false;
  return currentLevelData.value.objectives.every(obj => isObjectiveCompleted(obj));
});

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
}

function startBattle() {
  showStory.value = false;
  initLevel();
}

function initLevel() {
  const level = currentLevelData.value;
  if (!level) return;

  player.hp = level.playerHp;
  player.maxHp = level.playerHp;
  player.attack = level.playerAttack;
  player.defense = level.playerDefense;
  player.strategy = null;

  currentEnemyIndex.value = 0;
  if (currentEnemy.value) {
    enemyHp.value = currentEnemy.value.hp;
  }
  enemyLastStrategy.value = null;
  selectedStrategy.value = null;
  lastBattleResult.value = null;

  battleLog.value = [];
  strategyUsage.value = {};
  superEffectiveCount.value = 0;
  defeatedEnemies.value = 0;

  addLog(`⚔️ 战斗开始！面对 ${currentEnemy.value?.emoji} ${currentEnemy.value?.name}`, 'info');
}

function restartLevel() {
  showStory.value = true;
  showVictory.value = false;
}

function selectStrategy(strategy: IBattleStrategy) {
  selectedStrategy.value = strategy;
  player.strategy = strategy;
  addLog(`🎯 选择策略：${strategy.emoji} ${strategy.name}`, 'info');
}

async function executeBattle() {
  if (!selectedStrategy.value || !currentEnemy.value || isBattling.value) return;

  isBattling.value = true;
  
  // 记录策略使用
  const strategyName = selectedStrategy.value.name;
  strategyUsage.value[strategyName] = (strategyUsage.value[strategyName] || 0) + 1;

  // 玩家攻击
  const enemyFighter: Fighter = {
    name: currentEnemy.value.name,
    emoji: currentEnemy.value.emoji,
    hp: enemyHp.value,
    maxHp: currentEnemy.value.hp,
    attack: currentEnemy.value.attack,
    defense: currentEnemy.value.defense,
    strategy: enemyLastStrategy.value
  };

  const playerResult = selectedStrategy.value.execute(player, enemyFighter);
  lastBattleResult.value = playerResult;
  
  if (playerResult.effectiveness === 'super') {
    superEffectiveCount.value++;
    score.value += 20;
  }
  
  enemyDamaged.value = true;
  setTimeout(() => enemyDamaged.value = false, 300);
  
  enemyHp.value = Math.max(0, enemyHp.value - playerResult.damage);
  addLog(playerResult.message, playerResult.effectiveness);

  await delay(800);

  // 检查敌人是否被击败
  if (enemyHp.value <= 0) {
    defeatedEnemies.value++;
    score.value += 50;
    addLog(`💀 ${currentEnemy.value.name} 被击败！`, 'success');

    currentEnemyIndex.value++;
    if (currentEnemy.value) {
      enemyHp.value = currentEnemy.value.hp;
      enemyLastStrategy.value = null;
      addLog(`⚔️ 新的敌人出现：${currentEnemy.value.emoji} ${currentEnemy.value.name}`, 'info');
    }
    
    isBattling.value = false;
    return;
  }

  // 敌人反击
  await delay(500);
  
  const enemy = currentEnemy.value;
  const enemyStrategyIdx = Math.floor(Math.random() * enemy.preferredStrategies.length);
  const enemyStrategyName = enemy.preferredStrategies[enemyStrategyIdx];
  const enemyStrategy = availableStrategies.find(s => s.name === enemyStrategyName) || availableStrategies[0];
  
  enemyLastStrategy.value = enemyStrategy;

  const enemyAttacker: Fighter = {
    ...enemyFighter,
    strategy: enemyStrategy
  };

  const enemyResult = enemyStrategy.execute(enemyAttacker, player);
  
  playerDamaged.value = true;
  setTimeout(() => playerDamaged.value = false, 300);
  
  player.hp = Math.max(0, player.hp - enemyResult.damage);
  addLog(`${enemy.emoji} ${enemy.name} 使用 ${enemyStrategy.emoji} ${enemyStrategy.name}！对你造成 ${enemyResult.damage} 点伤害`, 'enemy');

  // 检查玩家是否被击败
  if (player.hp <= 0) {
    addLog('💔 你被击败了...', 'fail');
  }

  isBattling.value = false;
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function addLog(text: string, type: string) {
  battleLog.value.push({ text, type });
}

function isObjectiveCompleted(obj: { type: string; target: number; strategyName?: string }): boolean {
  switch (obj.type) {
    case 'win_battles':
      return defeatedEnemies.value >= obj.target;
    case 'use_strategy':
      return (strategyUsage.value[obj.strategyName || ''] || 0) >= obj.target;
    case 'super_effective':
      return superEffectiveCount.value >= obj.target;
    default:
      return false;
  }
}

function completeLevel() {
  if (!allObjectivesCompleted.value) return;
  
  earnedStars.value = player.hp > player.maxHp * 0.7 ? 3 : player.hp > player.maxHp * 0.3 ? 2 : 1;
  score.value += earnedStars.value * 50;
  
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
  }
}

onMounted(() => {
  addLog('⚔️ 欢迎来到魔法战斗竞技场！', 'info');
});
</script>

<style scoped>
.strategy-game {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a0a0a 0%, #2d1515 50%, #1a0a0a 100%);
  color: #fff;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: rgba(0, 0, 0, 0.4);
  border-bottom: 2px solid #c0392b;
}

.header-left, .header-right { display: flex; align-items: center; gap: 1rem; }
.game-header h1 { margin: 0; color: #e74c3c; }
.level-badge { background: #c0392b; padding: 0.25rem 0.75rem; border-radius: 1rem; }
.score-display { background: linear-gradient(45deg, #c0392b, #e74c3c); padding: 0.5rem 1rem; border-radius: 0.5rem; }

button { padding: 0.5rem 1rem; border: none; border-radius: 0.5rem; cursor: pointer; transition: all 0.3s; }
.btn-back { background: transparent; color: #fff; border: 1px solid #fff; }
.btn-hint { background: #c0392b; color: #fff; }
.btn-restart { background: #8e44ad; color: #fff; }

.level-select { padding: 2rem; max-width: 1000px; margin: 0 auto; }
.level-select h2 { text-align: center; color: #e74c3c; }
.pattern-intro { text-align: center; background: rgba(192, 57, 43, 0.2); padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem; }
.strategy-guide { text-align: center; background: rgba(255,255,255,0.1); padding: 1rem; border-radius: 0.5rem; margin-bottom: 2rem; }
.strategy-guide h4 { margin: 0 0 0.5rem 0; color: #f1c40f; }
.relation-chart { font-size: 1.25rem; }

.level-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; }
.level-card { background: rgba(255, 255, 255, 0.1); border-radius: 1rem; padding: 1.5rem; cursor: pointer; transition: all 0.3s; border: 2px solid transparent; }
.level-card:hover:not(.locked) { border-color: #e74c3c; transform: translateY(-5px); }
.level-card.locked { opacity: 0.5; cursor: not-allowed; }

.game-main { display: grid; grid-template-columns: 1fr 280px; grid-template-rows: auto auto 1fr; gap: 1rem; padding: 1rem; }

.story-panel, .victory-modal { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.85); display: flex; align-items: center; justify-content: center; z-index: 100; }
.story-content, .victory-content { background: linear-gradient(135deg, #1a0a0a, #2d1515); padding: 2rem; border-radius: 1rem; max-width: 500px; border: 2px solid #c0392b; }
.btn-start, .btn-complete { width: 100%; padding: 1rem; background: linear-gradient(45deg, #c0392b, #e74c3c); color: #fff; font-size: 1.25rem; }

.hint-panel { position: absolute; top: 100px; right: 20px; background: rgba(192, 57, 43, 0.95); padding: 1rem; border-radius: 0.5rem; max-width: 300px; z-index: 50; }

.battle-arena { grid-column: 1; display: grid; grid-template-columns: 1fr auto 1fr; gap: 2rem; background: rgba(0,0,0,0.3); border-radius: 1rem; padding: 2rem; align-items: center; }

.fighter-card { background: rgba(255,255,255,0.1); padding: 1.5rem; border-radius: 1rem; text-align: center; transition: all 0.3s; }
.fighter-card.damaged { animation: shake 0.3s; background: rgba(231, 76, 60, 0.3); }
@keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-10px); } 75% { transform: translateX(10px); } }
.fighter-card.player { border: 2px solid #3498db; }
.fighter-card.enemy { border: 2px solid #e74c3c; }
.fighter-emoji { font-size: 4rem; }
.fighter-name { font-size: 1.25rem; font-weight: bold; margin: 0.5rem 0; }
.hp-bar { height: 12px; background: rgba(255,255,255,0.2); border-radius: 6px; overflow: hidden; margin-bottom: 0.5rem; }
.hp-fill { height: 100%; background: linear-gradient(90deg, #2ecc71, #27ae60); transition: width 0.3s; }
.enemy-hp .hp-fill { background: linear-gradient(90deg, #e74c3c, #c0392b); }
.fighter-stats { color: #aaa; font-size: 0.875rem; }
.current-strategy, .last-strategy { margin-top: 0.5rem; font-size: 0.875rem; color: #f1c40f; }
.enemy-hint { font-size: 0.75rem; color: #aaa; margin-top: 0.5rem; }

.vs-section { text-align: center; }
.vs-text { font-size: 2rem; font-weight: bold; color: #e74c3c; }
.battle-result { margin-top: 1rem; padding: 0.5rem 1rem; border-radius: 0.5rem; font-size: 0.875rem; }
.battle-result.super { background: rgba(46, 204, 113, 0.3); color: #2ecc71; }
.battle-result.normal { background: rgba(255,255,255,0.1); }
.battle-result.weak { background: rgba(231, 76, 60, 0.3); color: #e74c3c; }

.victory-placeholder { text-align: center; padding: 2rem; }
.victory-emoji { font-size: 4rem; }

.strategy-section { grid-column: 1; background: rgba(0,0,0,0.3); border-radius: 1rem; padding: 1rem; }
.strategy-section h3 { color: #e74c3c; margin: 0 0 1rem 0; }
.strategy-cards { display: flex; gap: 1rem; margin-bottom: 1rem; }
.strategy-card { flex: 1; background: rgba(255,255,255,0.1); padding: 1rem; border-radius: 0.5rem; cursor: pointer; transition: all 0.3s; border: 2px solid transparent; text-align: center; }
.strategy-card:hover { border-color: #e74c3c; }
.strategy-card.selected { border-color: #2ecc71; background: rgba(46, 204, 113, 0.2); }
.strategy-emoji { font-size: 2rem; }
.strategy-name { font-weight: bold; margin: 0.5rem 0; }
.strategy-desc { font-size: 0.75rem; color: #aaa; }
.btn-attack { width: 100%; padding: 1rem; background: linear-gradient(45deg, #e74c3c, #c0392b); color: #fff; font-size: 1.25rem; }
.btn-attack:disabled { background: #555; cursor: not-allowed; }
.code-display { background: #1a1a1a; padding: 1rem; border-radius: 0.5rem; font-size: 0.75rem; margin-top: 1rem; }
.code-display code { color: #2ecc71; }

.status-panel { grid-column: 2; grid-row: 1 / 2; background: rgba(255,255,255,0.1); border-radius: 1rem; padding: 1rem; }
.status-panel h3 { color: #e74c3c; margin: 0 0 1rem 0; }
.objective-item { display: flex; gap: 0.5rem; padding: 0.5rem; background: rgba(0,0,0,0.2); border-radius: 0.25rem; margin-bottom: 0.5rem; font-size: 0.875rem; }
.objective-item.completed { background: rgba(46, 204, 113, 0.2); }
.stats { font-size: 0.875rem; color: #aaa; margin: 1rem 0; }

.battle-log { grid-column: 2; grid-row: 2 / 4; background: rgba(0,0,0,0.3); border-radius: 1rem; padding: 1rem; max-height: 400px; overflow-y: auto; }
.battle-log h3 { color: #e74c3c; font-size: 1rem; margin: 0 0 0.5rem 0; }
.log-content { font-size: 0.75rem; }
.log-item { padding: 0.25rem 0; border-bottom: 1px solid rgba(255,255,255,0.1); }
.log-item.super { color: #2ecc71; }
.log-item.weak { color: #e74c3c; }
.log-item.success { color: #f1c40f; }
.log-item.enemy { color: #e74c3c; }

.victory-content h2 { color: #f1c40f; text-align: center; }
.stars { font-size: 3rem; margin: 1rem 0; text-align: center; }
.stars span { opacity: 0.3; }
.stars span.earned { opacity: 1; }
.pattern-summary { background: rgba(255,255,255,0.1); padding: 1rem; border-radius: 0.5rem; margin: 1rem 0; }
.pattern-summary h4 { color: #e74c3c; margin: 0 0 0.5rem 0; }
.victory-buttons { display: flex; gap: 1rem; justify-content: center; }
.victory-buttons button { padding: 0.75rem 2rem; background: #c0392b; color: #fff; }
</style>
