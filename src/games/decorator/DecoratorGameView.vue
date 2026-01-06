<template>
  <div class="decorator-game">
    <header class="game-header">
      <div class="header-left">
        <button class="btn-back" @click="goBack">← 返回</button>
        <h1>🎨 魔法装备强化</h1>
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
        <strong>装饰器模式</strong>：动态地给对象添加额外的职责。装饰器提供了比继承更灵活的功能扩展方式。
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
              <li v-for="(obj, idx) in currentLevelData?.objectives" :key="idx">{{ obj.description }}</li>
            </ul>
          </div>
          <button class="btn-start" @click="showStory = false">开始强化</button>
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

      <!-- 装备选择 -->
      <div class="equipment-section">
        <h3>🗡️ 选择基础装备</h3>
        <div class="equipment-grid">
          <div 
            v-for="equip in availableEquipments" 
            :key="equip.id"
            class="equipment-card"
            :class="{ selected: selectedBaseEquipment?.id === equip.id }"
            @click="selectBaseEquipment(equip)"
          >
            <div class="equip-emoji">{{ equip.emoji }}</div>
            <div class="equip-name">{{ equip.name }}</div>
            <div class="equip-stats">
              <span v-if="equip.stats.attack">⚔️{{ equip.stats.attack }}</span>
              <span v-if="equip.stats.defense">🛡️{{ equip.stats.defense }}</span>
              <span v-if="equip.stats.magic">✨{{ equip.stats.magic }}</span>
              <span v-if="equip.stats.speed">💨{{ equip.stats.speed }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 附魔区域 -->
      <div class="enchant-section">
        <h3>🔮 选择附魔</h3>
        <div class="enchant-grid">
          <div 
            v-for="(config, type) in availableEnchantments" 
            :key="type"
            class="enchant-card"
            :style="{ borderColor: config?.color || '#fff' }"
            @click="applyEnchantment(type as EnchantmentType)"
          >
            <div class="enchant-emoji">{{ config?.emoji }}</div>
            <div class="enchant-name">{{ config?.name }}附魔</div>
            <div class="enchant-desc">{{ config?.description }}</div>
          </div>
        </div>
        <button 
          class="btn-reset-enchant" 
          @click="resetEnchantments"
          :disabled="!currentEquipment || enchantCount === 0"
        >
          🔄 重置附魔
        </button>
      </div>

      <!-- 当前装备展示 -->
      <div class="current-equipment">
        <h3>⚔️ 当前装备</h3>
        <div v-if="currentEquipment" class="equipment-display">
          <div class="display-header">
            <span class="display-emoji">{{ getEquipmentEmoji() }}</span>
            <span class="display-name">{{ currentEquipment.getName() }}</span>
          </div>
          <div class="display-description">{{ currentEquipment.getDescription() }}</div>
          
          <div class="stats-display">
            <div class="stat-item">
              <span class="stat-label">⚔️ 攻击</span>
              <span class="stat-value">{{ currentEquipment.getStats().attack }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">🛡️ 防御</span>
              <span class="stat-value">{{ currentEquipment.getStats().defense }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">✨ 魔法</span>
              <span class="stat-value">{{ currentEquipment.getStats().magic }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">💨 速度</span>
              <span class="stat-value">{{ currentEquipment.getStats().speed }}</span>
            </div>
          </div>

          <div class="enhancements-list" v-if="currentEquipment.getEnhancements().length > 0">
            <h4>附魔层级 ({{ enchantCount }}层):</h4>
            <div v-for="(enh, idx) in currentEquipment.getEnhancements()" :key="idx" class="enhancement-item">
              {{ enh }}
            </div>
          </div>

          <div class="total-power">
            属性总和: {{ totalStats }}
          </div>
        </div>
        <div v-else class="no-equipment">
          请先选择基础装备
        </div>

        <!-- 代码展示 -->
        <div class="code-display" v-if="currentEquipment">
          <pre><code>// 装饰器模式：层层包装
let equipment = new BaseEquipment("{{ selectedBaseEquipment?.name }}");
{{ enchantmentCode }}</code></pre>
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
          <div>附魔次数: {{ totalEnchantments }}</div>
          <div>当前层级: {{ enchantCount }}</div>
          <div>最大攻击: {{ maxAttack }}</div>
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
        <h3>📜 强化记录</h3>
        <div class="log-content">
          <div v-for="(msg, idx) in messageLog.slice(-8)" :key="idx" class="log-item">{{ msg }}</div>
        </div>
      </div>
    </div>

    <!-- 过关弹窗 -->
    <div v-if="showVictory" class="victory-modal">
      <div class="victory-content">
        <h2>🎉 锻造完成！</h2>
        <div class="stars">
          <span v-for="i in 3" :key="i" :class="{ earned: i <= earnedStars }">⭐</span>
        </div>
        <div class="pattern-summary">
          <h4>📚 装饰器模式要点</h4>
          <ul>
            <li><strong>组件接口</strong>：定义对象的基本接口（IEquipment）</li>
            <li><strong>具体组件</strong>：被装饰的原始对象（BaseEquipment）</li>
            <li><strong>装饰器基类</strong>：持有组件引用，实现相同接口</li>
            <li><strong>具体装饰器</strong>：添加额外功能（FireEnchantment等）</li>
            <li><strong>优势</strong>：动态添加功能，可无限叠加，比继承更灵活</li>
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
  BaseEquipment,
  ENCHANTMENT_CONFIG,
  BASE_EQUIPMENTS,
  DECORATOR_LEVELS,
  type IEquipment,
  type EnchantmentType,
  type BaseEquipmentConfig
} from './DecoratorGame';

const emit = defineEmits(['back']);

const gamePhase = ref<'select' | 'playing'>('select');
const currentLevel = ref(1);
const maxUnlockedLevel = ref(1);
const score = ref(0);
const showStory = ref(true);
const showHint = ref(false);
const showVictory = ref(false);
const earnedStars = ref(0);

const selectedBaseEquipment = ref<BaseEquipmentConfig | null>(null);
const currentEquipment = ref<IEquipment | null>(null);
const appliedEnchantments = ref<EnchantmentType[]>([]);
const messageLog = ref<string[]>([]);
const totalEnchantments = ref(0);
const maxAttack = ref(0);

const levels = DECORATOR_LEVELS;
const currentLevelData = computed(() => levels.find(l => l.id === currentLevel.value));

const availableEquipments = computed(() => {
  if (!currentLevelData.value) return [];
  return BASE_EQUIPMENTS.filter(e => currentLevelData.value!.availableEquipments.includes(e.id));
});

const availableEnchantments = computed(() => {
  if (!currentLevelData.value) return {};
  const result: Partial<typeof ENCHANTMENT_CONFIG> = {};
  currentLevelData.value.availableEnchantments.forEach(type => {
    result[type] = ENCHANTMENT_CONFIG[type];
  });
  return result;
});

const enchantCount = computed(() => appliedEnchantments.value.length);

const totalStats = computed(() => {
  if (!currentEquipment.value) return 0;
  const stats = currentEquipment.value.getStats();
  return stats.attack + stats.defense + stats.magic + stats.speed;
});

const enchantmentCode = computed(() => {
  return appliedEnchantments.value
    .map(type => `equipment = new ${ENCHANTMENT_CONFIG[type].name}Enchantment(equipment);`)
    .join('\n');
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
  initLevel();
}

function initLevel() {
  selectedBaseEquipment.value = null;
  currentEquipment.value = null;
  appliedEnchantments.value = [];
  messageLog.value = [];
  totalEnchantments.value = 0;
  maxAttack.value = 0;

  addMessage(`🎨 第 ${currentLevelData.value?.id} 关开始！`);
}

function restartLevel() {
  showStory.value = true;
  showVictory.value = false;
  initLevel();
}

function selectBaseEquipment(equip: BaseEquipmentConfig) {
  selectedBaseEquipment.value = equip;
  currentEquipment.value = new BaseEquipment(equip.name, equip.description, equip.stats, equip.emoji);
  appliedEnchantments.value = [];
  addMessage(`⚔️ 选择了基础装备：${equip.emoji} ${equip.name}`);
  updateMaxAttack();
}

function applyEnchantment(type: EnchantmentType) {
  if (!currentEquipment.value) {
    addMessage('❌ 请先选择基础装备！');
    return;
  }

  const config = ENCHANTMENT_CONFIG[type];
  const DecoratorClass = config.decorator;
  currentEquipment.value = new DecoratorClass(currentEquipment.value);
  appliedEnchantments.value.push(type);
  totalEnchantments.value++;
  score.value += 20;

  addMessage(`${config.emoji} 添加了${config.name}附魔！装备变为：${currentEquipment.value.getName()}`);
  updateMaxAttack();
}

function resetEnchantments() {
  if (!selectedBaseEquipment.value) return;
  
  const equip = selectedBaseEquipment.value;
  currentEquipment.value = new BaseEquipment(equip.name, equip.description, equip.stats, equip.emoji);
  appliedEnchantments.value = [];
  addMessage('🔄 已重置所有附魔');
}

function updateMaxAttack() {
  if (currentEquipment.value) {
    const attack = currentEquipment.value.getStats().attack;
    if (attack > maxAttack.value) {
      maxAttack.value = attack;
    }
  }
}

function getEquipmentEmoji(): string {
  return selectedBaseEquipment.value?.emoji || '❓';
}

function addMessage(msg: string) {
  const time = new Date().toLocaleTimeString();
  messageLog.value.push(`[${time}] ${msg}`);
}

function isObjectiveCompleted(obj: { type: string; target: number; stat?: string; enchantType?: EnchantmentType }): boolean {
  switch (obj.type) {
    case 'total_stat':
      if (!currentEquipment.value || !obj.stat) return false;
      return (currentEquipment.value.getStats() as any)[obj.stat] >= obj.target;
    case 'enchant_count':
      return totalEnchantments.value >= obj.target;
    case 'specific_enchant':
      return appliedEnchantments.value.includes(obj.enchantType!);
    case 'multi_enchant':
      return enchantCount.value >= obj.target;
    default:
      return false;
  }
}

function completeLevel() {
  if (!allObjectivesCompleted.value) return;
  
  earnedStars.value = totalStats.value >= 100 ? 3 : totalStats.value >= 60 ? 2 : 1;
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
  addMessage('🎨 欢迎来到魔法装备强化屋！');
});
</script>

<style scoped>
.decorator-game {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a1628 0%, #1a2a4a 50%, #0a1628 100%);
  color: #fff;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: rgba(0, 0, 0, 0.4);
  border-bottom: 2px solid #3498db;
}

.header-left, .header-right { display: flex; align-items: center; gap: 1rem; }
.game-header h1 { margin: 0; color: #3498db; }
.level-badge { background: #3498db; padding: 0.25rem 0.75rem; border-radius: 1rem; }
.score-display { background: linear-gradient(45deg, #3498db, #2980b9); padding: 0.5rem 1rem; border-radius: 0.5rem; }

button { padding: 0.5rem 1rem; border: none; border-radius: 0.5rem; cursor: pointer; transition: all 0.3s; }
.btn-back { background: transparent; color: #fff; border: 1px solid #fff; }
.btn-hint { background: #3498db; color: #fff; }
.btn-restart { background: #e74c3c; color: #fff; }

.level-select { padding: 2rem; max-width: 1000px; margin: 0 auto; }
.level-select h2 { text-align: center; color: #3498db; }
.pattern-intro { text-align: center; background: rgba(52, 152, 219, 0.2); padding: 1rem; border-radius: 0.5rem; margin-bottom: 2rem; }

.level-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; }
.level-card { background: rgba(255, 255, 255, 0.1); border-radius: 1rem; padding: 1.5rem; cursor: pointer; transition: all 0.3s; border: 2px solid transparent; }
.level-card:hover:not(.locked) { border-color: #3498db; transform: translateY(-5px); }
.level-card.locked { opacity: 0.5; cursor: not-allowed; }

.game-main { display: grid; grid-template-columns: 1fr 1fr 280px; grid-template-rows: auto auto 1fr; gap: 1rem; padding: 1rem; }

.story-panel, .victory-modal { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.85); display: flex; align-items: center; justify-content: center; z-index: 100; }
.story-content, .victory-content { background: linear-gradient(135deg, #0a1628, #1a2a4a); padding: 2rem; border-radius: 1rem; max-width: 500px; border: 2px solid #3498db; }
.btn-start, .btn-complete { width: 100%; padding: 1rem; background: linear-gradient(45deg, #3498db, #2980b9); color: #fff; font-size: 1.25rem; }

.hint-panel { position: absolute; top: 100px; right: 20px; background: rgba(52, 152, 219, 0.95); padding: 1rem; border-radius: 0.5rem; max-width: 300px; z-index: 50; }

.equipment-section { grid-column: 1; background: rgba(0,0,0,0.3); border-radius: 1rem; padding: 1rem; }
.equipment-section h3 { color: #3498db; margin: 0 0 1rem 0; }
.equipment-grid { display: flex; flex-wrap: wrap; gap: 0.75rem; }
.equipment-card { background: rgba(255,255,255,0.1); padding: 1rem; border-radius: 0.5rem; cursor: pointer; transition: all 0.3s; border: 2px solid transparent; text-align: center; min-width: 100px; }
.equipment-card:hover { border-color: #3498db; }
.equipment-card.selected { border-color: #2ecc71; background: rgba(46, 204, 113, 0.2); }
.equip-emoji { font-size: 2rem; }
.equip-name { font-weight: bold; margin: 0.5rem 0; }
.equip-stats { font-size: 0.75rem; color: #aaa; display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; }

.enchant-section { grid-column: 2; background: rgba(0,0,0,0.3); border-radius: 1rem; padding: 1rem; }
.enchant-section h3 { color: #3498db; margin: 0 0 1rem 0; }
.enchant-grid { display: flex; flex-wrap: wrap; gap: 0.75rem; }
.enchant-card { background: rgba(255,255,255,0.1); padding: 1rem; border-radius: 0.5rem; cursor: pointer; transition: all 0.3s; border: 2px solid; text-align: center; flex: 1; min-width: 100px; }
.enchant-card:hover { transform: scale(1.05); }
.enchant-emoji { font-size: 1.5rem; }
.enchant-name { font-weight: bold; font-size: 0.875rem; margin: 0.5rem 0; }
.enchant-desc { font-size: 0.75rem; color: #aaa; }
.btn-reset-enchant { margin-top: 1rem; background: #e74c3c; color: #fff; width: 100%; }

.current-equipment { grid-column: 1 / 3; background: rgba(0,0,0,0.3); border-radius: 1rem; padding: 1rem; }
.current-equipment h3 { color: #3498db; margin: 0 0 1rem 0; }
.equipment-display { background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 0.5rem; }
.display-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem; }
.display-emoji { font-size: 2.5rem; }
.display-name { font-size: 1.5rem; font-weight: bold; color: #f1c40f; }
.display-description { color: #aaa; font-size: 0.875rem; margin-bottom: 1rem; }
.stats-display { display: flex; gap: 1.5rem; margin-bottom: 1rem; }
.stat-item { background: rgba(0,0,0,0.3); padding: 0.5rem 1rem; border-radius: 0.5rem; text-align: center; }
.stat-label { display: block; font-size: 0.75rem; color: #aaa; }
.stat-value { font-size: 1.25rem; font-weight: bold; color: #2ecc71; }
.enhancements-list { background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem; }
.enhancements-list h4 { margin: 0 0 0.5rem 0; color: #f1c40f; }
.enhancement-item { padding: 0.25rem 0; font-size: 0.875rem; }
.total-power { text-align: center; font-size: 1.25rem; color: #e74c3c; font-weight: bold; }
.no-equipment { text-align: center; color: #aaa; padding: 2rem; }
.code-display { background: #1a1a1a; padding: 1rem; border-radius: 0.5rem; font-size: 0.75rem; margin-top: 1rem; overflow-x: auto; }
.code-display code { color: #2ecc71; white-space: pre-wrap; }

.status-panel { grid-column: 3; grid-row: 1 / 2; background: rgba(255,255,255,0.1); border-radius: 1rem; padding: 1rem; }
.status-panel h3 { color: #3498db; margin: 0 0 1rem 0; }
.objective-item { display: flex; gap: 0.5rem; padding: 0.5rem; background: rgba(0,0,0,0.2); border-radius: 0.25rem; margin-bottom: 0.5rem; font-size: 0.875rem; }
.objective-item.completed { background: rgba(46, 204, 113, 0.2); }
.stats { font-size: 0.875rem; color: #aaa; margin: 1rem 0; }

.message-log { grid-column: 3; grid-row: 2 / 4; background: rgba(0,0,0,0.3); border-radius: 1rem; padding: 1rem; }
.message-log h3 { color: #3498db; font-size: 1rem; margin: 0 0 0.5rem 0; }
.log-content { font-size: 0.75rem; color: #aaa; }
.log-item { padding: 0.25rem 0; border-bottom: 1px solid rgba(255,255,255,0.1); }

.victory-content h2 { color: #f1c40f; text-align: center; }
.stars { font-size: 3rem; margin: 1rem 0; text-align: center; }
.stars span { opacity: 0.3; }
.stars span.earned { opacity: 1; }
.pattern-summary { background: rgba(255,255,255,0.1); padding: 1rem; border-radius: 0.5rem; margin: 1rem 0; }
.pattern-summary h4 { color: #3498db; margin: 0 0 0.5rem 0; }
.victory-buttons { display: flex; gap: 1rem; justify-content: center; }
.victory-buttons button { padding: 0.75rem 2rem; background: #3498db; color: #fff; }
</style>
