<template>
  <div class="singleton-game">
    <header class="game-header">
      <div class="header-left">
        <button class="btn-back" @click="goBack">← 返回</button>
        <h1>🔮 魔法水晶球</h1>
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
        <strong>单例模式</strong>：确保一个类只有一个实例，并提供一个全局访问点。
        适用于需要全局唯一对象的场景，如配置管理、日志记录等。
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
      <div class="game-scene">
        <!-- 水晶球 -->
        <div class="crystal-container">
          <div class="crystal-ball" :class="{ active: crystalBall !== null }">
            <div class="crystal-glow"></div>
            <div class="crystal-icon">🔮</div>
            <div v-if="crystalBall" class="crystal-info">
              <div class="crystal-id">ID: {{ crystalBall.id.slice(0, 12) }}...</div>
              <div class="energy-display">
                <span>能量: {{ crystalBall.energy }}/100</span>
                <div class="energy-bar">
                  <div class="energy-fill" :style="{ width: crystalBall.energy + '%' }"></div>
                </div>
              </div>
              <div class="connected-count">
                已连接: {{ crystalBall.getConnectedWizards().length }} 位魔法师
              </div>
            </div>
            <div v-else class="crystal-placeholder">
              点击魔法师获取水晶球实例
            </div>
          </div>
          
          <div class="singleton-stats">
            <div class="stat-item">
              <span class="stat-label">getInstance() 调用次数:</span>
              <span class="stat-value">{{ creationAttempts }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">实际创建实例数:</span>
              <span class="stat-value highlight">{{ crystalBall ? 1 : 0 }}</span>
            </div>
          </div>
        </div>

        <!-- 连接线 -->
        <svg class="connection-lines" viewBox="0 0 100 100" preserveAspectRatio="none">
          <line 
            v-for="wizard in connectedWizards" 
            :key="wizard.id"
            x1="50" y1="25"
            :x2="getWizardPosition(wizard).x" 
            :y2="getWizardPosition(wizard).y"
            class="connection-line"
          />
        </svg>

        <!-- 魔法师列表 -->
        <div class="wizards-container">
          <div 
            v-for="(wizard, idx) in wizards" 
            :key="wizard.id"
            class="wizard-card"
            :class="{ connected: wizard.crystalReference !== null }"
            :style="{ '--wizard-index': idx }"
          >
            <div class="wizard-emoji">{{ wizard.emoji }}</div>
            <div class="wizard-name">{{ wizard.name }}</div>
            <div class="wizard-energy">
              能量: {{ wizard.energy }}/{{ wizard.maxEnergy }}
            </div>
            <div class="wizard-ref" v-if="wizard.crystalReference">
              引用: {{ wizard.crystalReference.id.slice(0, 8) }}...
            </div>
            <div class="wizard-actions">
              <button 
                @click="connectWizard(wizard)"
                :disabled="wizard.crystalReference !== null"
              >
                {{ wizard.crystalReference ? '已连接' : '获取水晶球' }}
              </button>
              <button 
                @click="drawEnergy(wizard)"
                :disabled="!wizard.crystalReference || wizard.energy >= wizard.maxEnergy"
                v-if="wizard.crystalReference"
              >
                获取能量
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 验证面板 -->
      <div class="verify-panel">
        <h3>🔍 单例验证</h3>
        <button 
          @click="verifySingleton"
          :disabled="connectedWizards.length < 2"
          class="btn-verify"
        >
          验证所有引用是否相同
        </button>
        <div v-if="verificationResult" class="verification-result" :class="verificationResult.success ? 'success' : 'fail'">
          {{ verificationResult.message }}
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
            <span>{{ isObjectiveCompleted(obj) ? '✅' : '⬜' }}</span>
            <span>{{ obj.description }}</span>
          </div>
        </div>
        <div class="stats">
          <div>已连接魔法师: {{ connectedWizards.length }}</div>
          <div>总获取能量: {{ totalEnergyDrawn }}</div>
          <div>验证次数: {{ verificationCount }}</div>
        </div>
        <button 
          class="btn-complete" 
          :disabled="!allObjectivesCompleted"
          @click="completeLevel"
        >
          {{ allObjectivesCompleted ? '🎉 完成关卡' : '完成所有目标' }}
        </button>
      </div>

      <!-- 消息日志 -->
      <div class="message-log">
        <h3>📜 消息记录</h3>
        <div class="log-content">
          <div v-for="(msg, idx) in messageLog.slice(-8)" :key="idx" class="log-item">
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
        <div class="pattern-summary">
          <h4>📚 单例模式要点</h4>
          <ul>
            <li><strong>私有构造函数</strong>：防止外部直接创建实例</li>
            <li><strong>静态实例变量</strong>：保存唯一的实例</li>
            <li><strong>getInstance()</strong>：全局访问点，返回唯一实例</li>
            <li><strong>应用场景</strong>：配置管理、日志、数据库连接池</li>
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
import { MagicCrystalBall, Wizard, SINGLETON_LEVELS } from './SingletonGame';

const emit = defineEmits(['back']);

const gamePhase = ref<'select' | 'playing'>('select');
const currentLevel = ref(1);
const maxUnlockedLevel = ref(1);
const score = ref(0);
const showStory = ref(true);
const showHint = ref(false);
const showVictory = ref(false);
const earnedStars = ref(0);

const crystalBall = ref<MagicCrystalBall | null>(null);
const wizards = ref<Wizard[]>([]);
const messageLog = ref<string[]>([]);
const totalEnergyDrawn = ref(0);
const verificationCount = ref(0);
const verificationResult = ref<{ success: boolean; message: string } | null>(null);
const creationAttempts = ref(0);

const levels = SINGLETON_LEVELS;
const currentLevelData = computed(() => levels.find(l => l.id === currentLevel.value));

const connectedWizards = computed(() => wizards.value.filter(w => w.crystalReference !== null));

const allObjectivesCompleted = computed(() => {
  if (!currentLevelData.value) return false;
  return currentLevelData.value.objectives.every(obj => isObjectiveCompleted(obj));
});

function goBack() {
  if (gamePhase.value === 'playing') {
    gamePhase.value = 'select';
    MagicCrystalBall.reset();
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
  MagicCrystalBall.reset();
  crystalBall.value = null;
  wizards.value = [];
  messageLog.value = [];
  totalEnergyDrawn.value = 0;
  verificationCount.value = 0;
  verificationResult.value = null;
  creationAttempts.value = 0;

  const level = currentLevelData.value;
  if (!level) return;

  level.wizards.forEach(w => {
    wizards.value.push(new Wizard(w.name, w.emoji));
  });

  addMessage(`🎮 第 ${level.id} 关开始！`);
}

function restartLevel() {
  showStory.value = true;
  showVictory.value = false;
  initLevel();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function connectWizard(wizard: any) {
  const result = wizard.connectToCrystal();
  crystalBall.value = MagicCrystalBall.getInstance();
  creationAttempts.value = MagicCrystalBall.getCreationAttempts();
  
  addMessage(result.message);
  if (result.isSameInstance) {
    addMessage('✨ 验证：获取的是同一个水晶球实例！');
    score.value += 10;
  }
  score.value += 15;
  
  // 强制更新
  wizards.value = [...wizards.value];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function drawEnergy(wizard: any) {
  const result = wizard.drawEnergy(10);
  if (result.success) {
    totalEnergyDrawn.value += result.amount;
    addMessage(result.message);
    score.value += 5;
  }
  // 强制更新水晶球状态
  crystalBall.value = MagicCrystalBall.getInstance();
  wizards.value = [...wizards.value];
}

function verifySingleton() {
  const refs = connectedWizards.value.map(w => w.crystalReference);
  const allSame = refs.every(ref => ref === refs[0]);
  
  verificationCount.value++;
  verificationResult.value = {
    success: allSame,
    message: allSame 
      ? `✅ 验证成功！所有 ${refs.length} 位魔法师引用的是同一个水晶球实例` 
      : '❌ 验证失败：发现不同的实例'
  };
  
  if (allSame) {
    score.value += 20;
    addMessage('🎯 单例验证通过！所有引用指向同一实例');
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getWizardPosition(wizard: any): { x: number; y: number } {
  const idx = wizards.value.findIndex(w => w.id === wizard.id);
  const total = wizards.value.length;
  const startX = 50 - (total - 1) * 12;
  return { x: startX + idx * 24, y: 75 };
}

function addMessage(msg: string) {
  const time = new Date().toLocaleTimeString();
  messageLog.value.push(`[${time}] ${msg}`);
}

function isObjectiveCompleted(obj: { type: string; target: number }): boolean {
  switch (obj.type) {
    case 'connect':
      return connectedWizards.value.length >= obj.target;
    case 'verify_singleton':
      return verificationCount.value >= obj.target && verificationResult.value?.success === true;
    case 'draw_energy':
      return totalEnergyDrawn.value >= obj.target;
    case 'all_same_ref':
      return connectedWizards.value.length > 0 && 
             connectedWizards.value.every(w => w.crystalReference === connectedWizards.value[0].crystalReference);
    default:
      return false;
  }
}

function completeLevel() {
  if (!allObjectivesCompleted.value) return;
  
  earnedStars.value = verificationCount.value >= 2 ? 3 : verificationCount.value >= 1 ? 2 : 1;
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
    initLevel();
  }
}

onMounted(() => {
  addMessage('🔮 欢迎来到魔法水晶球游戏！');
});
</script>

<style scoped>
.singleton-game {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a0a2e 0%, #2d1b4e 50%, #1a0a2e 100%);
  color: #fff;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: rgba(0, 0, 0, 0.3);
  border-bottom: 2px solid #9b59b6;
}

.header-left, .header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.game-header h1 {
  margin: 0;
  color: #9b59b6;
}

.level-badge {
  background: #9b59b6;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
}

.score-display {
  background: linear-gradient(45deg, #9b59b6, #8e44ad);
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
}

button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-back { background: transparent; color: #fff; border: 1px solid #fff; }
.btn-hint { background: #9b59b6; color: #fff; }
.btn-restart { background: #e74c3c; color: #fff; }

.level-select {
  padding: 2rem;
  max-width: 1000px;
  margin: 0 auto;
}

.level-select h2 {
  text-align: center;
  color: #9b59b6;
}

.pattern-intro {
  text-align: center;
  background: rgba(155, 89, 182, 0.2);
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 2rem;
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
  border: 2px solid transparent;
}

.level-card:hover:not(.locked) {
  border-color: #9b59b6;
  transform: translateY(-5px);
}

.level-card.locked { opacity: 0.5; cursor: not-allowed; }
.level-number { font-size: 2.5rem; color: #9b59b6; }
.level-name { font-size: 1.25rem; font-weight: bold; }
.level-desc { color: #aaa; font-size: 0.875rem; }

.game-main {
  display: grid;
  grid-template-columns: 1fr 280px;
  grid-template-rows: auto 1fr auto;
  gap: 1rem;
  padding: 1rem;
  min-height: calc(100vh - 80px);
}

.story-panel, .victory-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.story-content, .victory-content {
  background: linear-gradient(135deg, #1a0a2e, #2d1b4e);
  padding: 2rem;
  border-radius: 1rem;
  max-width: 500px;
  border: 2px solid #9b59b6;
}

.story-content h3 { color: #9b59b6; }
.objectives { background: rgba(255,255,255,0.1); padding: 1rem; border-radius: 0.5rem; margin: 1rem 0; }
.objectives h4 { color: #f1c40f; margin: 0 0 0.5rem 0; }

.btn-start, .btn-complete {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(45deg, #9b59b6, #8e44ad);
  color: #fff;
  font-size: 1.25rem;
}

.hint-panel {
  position: absolute;
  top: 100px;
  right: 20px;
  background: rgba(155, 89, 182, 0.95);
  padding: 1rem;
  border-radius: 0.5rem;
  max-width: 300px;
  z-index: 50;
}

.game-scene {
  grid-column: 1;
  grid-row: 1 / 3;
  background: radial-gradient(ellipse at center, #2d1b4e 0%, #1a0a2e 100%);
  border-radius: 1rem;
  position: relative;
  padding: 2rem;
  min-height: 400px;
}

.crystal-container {
  text-align: center;
  margin-bottom: 2rem;
}

.crystal-ball {
  display: inline-block;
  padding: 2rem;
  position: relative;
}

.crystal-ball.active .crystal-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle, rgba(155, 89, 182, 0.5) 0%, transparent 70%);
  animation: glow-pulse 2s ease-in-out infinite;
}

@keyframes glow-pulse {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.2); opacity: 0.8; }
}

.crystal-icon {
  font-size: 5rem;
  position: relative;
  z-index: 1;
}

.crystal-info {
  margin-top: 1rem;
  font-size: 0.875rem;
}

.crystal-id {
  font-family: monospace;
  background: rgba(0,0,0,0.3);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}

.energy-bar {
  height: 8px;
  background: rgba(255,255,255,0.2);
  border-radius: 4px;
  margin-top: 0.5rem;
  overflow: hidden;
}

.energy-fill {
  height: 100%;
  background: linear-gradient(90deg, #9b59b6, #e74c3c);
  transition: width 0.3s;
}

.singleton-stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 1rem;
}

.stat-item {
  background: rgba(0,0,0,0.3);
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
}

.stat-value.highlight {
  color: #2ecc71;
  font-weight: bold;
}

.connection-lines {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.connection-line {
  stroke: #9b59b6;
  stroke-width: 0.2;
  stroke-dasharray: 4 2;
}

.wizards-container {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  flex-wrap: wrap;
  margin-top: 3rem;
}

.wizard-card {
  background: rgba(255,255,255,0.1);
  padding: 1.5rem;
  border-radius: 1rem;
  text-align: center;
  min-width: 140px;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.wizard-card.connected {
  border-color: #2ecc71;
  background: rgba(46, 204, 113, 0.1);
}

.wizard-emoji { font-size: 3rem; }
.wizard-name { font-weight: bold; margin: 0.5rem 0; }
.wizard-energy { font-size: 0.875rem; color: #aaa; }
.wizard-ref { font-size: 0.75rem; font-family: monospace; color: #9b59b6; margin: 0.5rem 0; }

.wizard-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.wizard-actions button {
  font-size: 0.75rem;
  padding: 0.5rem;
  background: #9b59b6;
  color: #fff;
}

.wizard-actions button:disabled {
  background: #555;
  cursor: not-allowed;
}

.verify-panel {
  grid-column: 1;
  grid-row: 3;
  background: rgba(255,255,255,0.1);
  border-radius: 1rem;
  padding: 1rem;
  text-align: center;
}

.verify-panel h3 { color: #9b59b6; margin: 0 0 1rem 0; }

.btn-verify {
  background: linear-gradient(45deg, #3498db, #2980b9);
  color: #fff;
  padding: 0.75rem 2rem;
}

.verification-result {
  margin-top: 1rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
}

.verification-result.success { background: rgba(46, 204, 113, 0.3); }
.verification-result.fail { background: rgba(231, 76, 60, 0.3); }

.status-panel {
  grid-column: 2;
  grid-row: 1 / 2;
  background: rgba(255,255,255,0.1);
  border-radius: 1rem;
  padding: 1rem;
}

.status-panel h3 { color: #9b59b6; margin: 0 0 1rem 0; }

.objective-item {
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem;
  background: rgba(0,0,0,0.2);
  border-radius: 0.25rem;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.objective-item.completed { background: rgba(46, 204, 113, 0.2); }

.stats { font-size: 0.875rem; color: #aaa; margin: 1rem 0; }
.stats > div { padding: 0.25rem 0; }

.message-log {
  grid-column: 2;
  grid-row: 2 / 4;
  background: rgba(0,0,0,0.3);
  border-radius: 1rem;
  padding: 1rem;
}

.message-log h3 { color: #9b59b6; font-size: 1rem; margin: 0 0 0.5rem 0; }
.log-content { font-size: 0.75rem; color: #aaa; }
.log-item { padding: 0.25rem 0; border-bottom: 1px solid rgba(255,255,255,0.1); }

.victory-content h2 { color: #f1c40f; }
.stars { font-size: 3rem; margin: 1rem 0; }
.stars span { opacity: 0.3; }
.stars span.earned { opacity: 1; }

.pattern-summary {
  background: rgba(255,255,255,0.1);
  padding: 1rem;
  border-radius: 0.5rem;
  text-align: left;
  margin: 1rem 0;
}

.pattern-summary h4 { color: #9b59b6; margin: 0 0 0.5rem 0; }
.pattern-summary ul { margin: 0; padding-left: 1.25rem; font-size: 0.875rem; }

.victory-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.victory-buttons button {
  padding: 0.75rem 2rem;
  background: #9b59b6;
  color: #fff;
}
</style>
