<template>
  <div class="factory-game">
    <header class="game-header">
      <div class="header-left">
        <button class="btn-back" @click="goBack">← 返回</button>
        <h1>🏭 魔法武器锻造厂</h1>
        <span class="level-badge">第 {{ currentLevelData?.id }} 关</span>
      </div>
      <div class="header-right">
        <div class="gold-display">💰 {{ gold }} 金币</div>
        <button class="btn-hint" @click="showHint = !showHint">💡 提示</button>
        <button class="btn-restart" @click="restartLevel">🔄 重新开始</button>
      </div>
    </header>

    <!-- 关卡选择 -->
    <div v-if="gamePhase === 'select'" class="level-select">
      <h2>选择关卡</h2>
      <p class="pattern-intro">
        <strong>工厂模式</strong>：定义一个创建对象的接口，让子类决定实例化哪个类。
        工厂方法使一个类的实例化延迟到其子类。
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
          <button class="btn-start" @click="showStory = false">开始锻造</button>
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

      <!-- 订单区域 -->
      <div class="orders-section">
        <h3>📋 订单列表</h3>
        <div class="orders-grid">
          <div 
            v-for="order in orders" 
            :key="order.id"
            class="order-card"
            :class="{ fulfilled: order.fulfilled, selected: selectedOrder?.id === order.id }"
            @click="selectOrder(order)"
          >
            <div class="order-customer">
              <span class="customer-emoji">{{ order.customerEmoji }}</span>
              <span class="customer-name">{{ order.customerName }}</span>
            </div>
            <div class="order-requirement">
              <span class="weapon-emoji">{{ WEAPON_CONFIG[order.type].emoji }}</span>
              <span>{{ QUALITY_CONFIG[order.quality].name }}{{ WEAPON_CONFIG[order.type].name }}</span>
            </div>
            <div class="order-reward" :style="{ color: QUALITY_CONFIG[order.quality].color }">
              💰 {{ order.reward }} 金币
            </div>
            <div v-if="order.fulfilled" class="fulfilled-badge">✅ 已完成</div>
          </div>
        </div>
      </div>

      <!-- 锻造区域 -->
      <div class="forge-section">
        <h3>🔨 锻造工厂</h3>
        <div class="forge-controls">
          <div class="control-group">
            <label>武器类型：</label>
            <div class="type-buttons">
              <button 
                v-for="(config, type) in WEAPON_CONFIG" 
                :key="type"
                :class="{ active: selectedType === type }"
                @click="selectedType = type as WeaponType"
              >
                {{ config.emoji }} {{ config.name }}
              </button>
            </div>
          </div>
          <div class="control-group">
            <label>品质等级：</label>
            <div class="quality-buttons">
              <button 
                v-for="(config, quality) in QUALITY_CONFIG" 
                :key="quality"
                :class="{ active: selectedQuality === quality }"
                :style="{ borderColor: config.color }"
                @click="selectedQuality = quality as WeaponQuality"
              >
                {{ config.name }}
              </button>
            </div>
          </div>
          <button class="btn-forge" @click="forgeWeapon">
            🔥 使用工厂锻造
          </button>
        </div>

        <!-- 代码展示 -->
        <div class="code-display">
          <pre><code>// 工厂模式调用
const weapon = WeaponFactory.createWeapon(
  "{{ selectedType }}",
  "{{ selectedQuality }}"
);
// 工厂内部决定创建哪个具体类</code></pre>
        </div>
      </div>

      <!-- 已锻造武器 -->
      <div class="weapons-section">
        <h3>⚔️ 已锻造武器 ({{ createdWeapons.length }})</h3>
        <div class="weapons-grid">
          <div 
            v-for="weapon in createdWeapons" 
            :key="weapon.id"
            class="weapon-card"
            :style="{ borderColor: QUALITY_CONFIG[weapon.quality].color }"
          >
            <div class="weapon-emoji">{{ weapon.emoji }}</div>
            <div class="weapon-name" :style="{ color: QUALITY_CONFIG[weapon.quality].color }">
              {{ weapon.name }}
            </div>
            <div class="weapon-stats">
              <span>⚔️ {{ weapon.damage }}</span>
            </div>
          </div>
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
          <div>已完成订单: {{ fulfilledOrders.length }}/{{ orders.length }}</div>
          <div>锻造武器数: {{ createdWeapons.length }}</div>
          <div>总伤害值: {{ totalDamage }}</div>
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
        <h3>📜 锻造记录</h3>
        <div class="log-content">
          <div v-for="(msg, idx) in messageLog.slice(-8)" :key="idx" class="log-item">{{ msg }}</div>
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
          <h4>📚 工厂模式要点</h4>
          <ul>
            <li><strong>产品接口</strong>：定义产品的公共接口（IWeapon）</li>
            <li><strong>具体产品</strong>：实现接口的具体类（Sword, Staff...）</li>
            <li><strong>工厂类</strong>：封装创建逻辑，根据参数返回不同产品</li>
            <li><strong>优势</strong>：解耦创建逻辑，易于扩展新产品类型</li>
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
  WeaponFactory, 
  WEAPON_CONFIG, 
  QUALITY_CONFIG, 
  FACTORY_LEVELS,
  type WeaponType,
  type WeaponQuality,
  type IWeapon,
  type WeaponOrder
} from './FactoryGame';

const emit = defineEmits(['back']);

const gamePhase = ref<'select' | 'playing'>('select');
const currentLevel = ref(1);
const maxUnlockedLevel = ref(1);
const gold = ref(0);
const showStory = ref(true);
const showHint = ref(false);
const showVictory = ref(false);
const earnedStars = ref(0);

const orders = ref<WeaponOrder[]>([]);
const selectedOrder = ref<WeaponOrder | null>(null);
const createdWeapons = ref<IWeapon[]>([]);
const selectedType = ref<WeaponType>('sword');
const selectedQuality = ref<WeaponQuality>('common');
const messageLog = ref<string[]>([]);

const levels = FACTORY_LEVELS;
const currentLevelData = computed(() => levels.find(l => l.id === currentLevel.value));

const fulfilledOrders = computed(() => orders.value.filter(o => o.fulfilled));
const totalDamage = computed(() => createdWeapons.value.reduce((sum, w) => sum + w.damage, 0));

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
  WeaponFactory.reset();
  orders.value = [];
  createdWeapons.value = [];
  selectedOrder.value = null;
  messageLog.value = [];

  const level = currentLevelData.value;
  if (!level) return;

  level.orders.forEach((o, idx) => {
    orders.value.push({
      ...o,
      id: `order-${idx}`,
      fulfilled: false,
    });
  });

  addMessage(`🏭 第 ${level.id} 关开始！`);
}

function restartLevel() {
  showStory.value = true;
  showVictory.value = false;
  initLevel();
}

function selectOrder(order: WeaponOrder) {
  if (order.fulfilled) return;
  selectedOrder.value = order;
  selectedType.value = order.type;
  selectedQuality.value = order.quality;
  addMessage(`📋 选中订单：${order.customerName} 需要 ${QUALITY_CONFIG[order.quality].name}${WEAPON_CONFIG[order.type].name}`);
}

function forgeWeapon() {
  const weapon = WeaponFactory.createWeapon(selectedType.value, selectedQuality.value);
  createdWeapons.value.push(weapon);
  
  addMessage(`🔨 工厂创建了：${weapon.name}（伤害：${weapon.damage}）`);

  // 检查是否满足订单
  const matchingOrder = orders.value.find(
    o => !o.fulfilled && o.type === weapon.type && o.quality === weapon.quality
  );

  if (matchingOrder) {
    matchingOrder.fulfilled = true;
    gold.value += matchingOrder.reward;
    addMessage(`✅ 订单完成！${matchingOrder.customerEmoji} ${matchingOrder.customerName} 支付了 ${matchingOrder.reward} 金币`);
  }

  orders.value = [...orders.value];
}

function addMessage(msg: string) {
  const time = new Date().toLocaleTimeString();
  messageLog.value.push(`[${time}] ${msg}`);
}

function isObjectiveCompleted(obj: { type: string; target: number; quality?: WeaponQuality }): boolean {
  switch (obj.type) {
    case 'fulfill_orders':
      return fulfilledOrders.value.length >= obj.target;
    case 'create_weapons':
      return createdWeapons.value.length >= obj.target;
    case 'create_quality':
      return createdWeapons.value.filter(w => w.quality === obj.quality).length >= obj.target;
    case 'total_damage':
      return totalDamage.value >= obj.target;
    default:
      return false;
  }
}

function completeLevel() {
  if (!allObjectivesCompleted.value) return;
  
  earnedStars.value = gold.value >= 300 ? 3 : gold.value >= 150 ? 2 : 1;
  
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
  addMessage('🏭 欢迎来到魔法武器锻造厂！');
});
</script>

<style scoped>
.factory-game {
  min-height: 100vh;
  background: linear-gradient(135deg, #2c1810 0%, #4a2c17 50%, #2c1810 100%);
  color: #fff;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: rgba(0, 0, 0, 0.4);
  border-bottom: 2px solid #d35400;
}

.header-left, .header-right { display: flex; align-items: center; gap: 1rem; }
.game-header h1 { margin: 0; color: #e67e22; }
.level-badge { background: #d35400; padding: 0.25rem 0.75rem; border-radius: 1rem; }
.gold-display { background: linear-gradient(45deg, #f39c12, #d35400); padding: 0.5rem 1rem; border-radius: 0.5rem; font-weight: bold; }

button { padding: 0.5rem 1rem; border: none; border-radius: 0.5rem; cursor: pointer; transition: all 0.3s; }
.btn-back { background: transparent; color: #fff; border: 1px solid #fff; }
.btn-hint { background: #d35400; color: #fff; }
.btn-restart { background: #c0392b; color: #fff; }

.level-select { padding: 2rem; max-width: 1000px; margin: 0 auto; }
.level-select h2 { text-align: center; color: #e67e22; }
.pattern-intro { text-align: center; background: rgba(211, 84, 0, 0.2); padding: 1rem; border-radius: 0.5rem; margin-bottom: 2rem; }

.level-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; }
.level-card { background: rgba(255, 255, 255, 0.1); border-radius: 1rem; padding: 1.5rem; cursor: pointer; transition: all 0.3s; border: 2px solid transparent; }
.level-card:hover:not(.locked) { border-color: #e67e22; transform: translateY(-5px); }
.level-card.locked { opacity: 0.5; cursor: not-allowed; }
.level-number { font-size: 2.5rem; color: #e67e22; }
.level-name { font-size: 1.25rem; font-weight: bold; }
.level-desc { color: #aaa; font-size: 0.875rem; }

.game-main { display: grid; grid-template-columns: 1fr 1fr 280px; grid-template-rows: auto auto 1fr; gap: 1rem; padding: 1rem; min-height: calc(100vh - 80px); }

.story-panel, .victory-modal { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.8); display: flex; align-items: center; justify-content: center; z-index: 100; }
.story-content, .victory-content { background: linear-gradient(135deg, #2c1810, #4a2c17); padding: 2rem; border-radius: 1rem; max-width: 500px; border: 2px solid #d35400; }
.story-content h3 { color: #e67e22; }
.objectives { background: rgba(255,255,255,0.1); padding: 1rem; border-radius: 0.5rem; margin: 1rem 0; }
.objectives h4 { color: #f1c40f; margin: 0 0 0.5rem 0; }
.btn-start, .btn-complete { width: 100%; padding: 1rem; background: linear-gradient(45deg, #d35400, #e67e22); color: #fff; font-size: 1.25rem; }

.hint-panel { position: absolute; top: 100px; right: 20px; background: rgba(211, 84, 0, 0.95); padding: 1rem; border-radius: 0.5rem; max-width: 300px; z-index: 50; }

.orders-section { grid-column: 1; background: rgba(0,0,0,0.3); border-radius: 1rem; padding: 1rem; }
.orders-section h3 { color: #e67e22; margin: 0 0 1rem 0; }
.orders-grid { display: flex; flex-direction: column; gap: 0.75rem; }
.order-card { background: rgba(255,255,255,0.1); padding: 1rem; border-radius: 0.5rem; cursor: pointer; transition: all 0.3s; position: relative; border: 2px solid transparent; }
.order-card:hover:not(.fulfilled) { border-color: #e67e22; }
.order-card.selected { border-color: #2ecc71; background: rgba(46, 204, 113, 0.1); }
.order-card.fulfilled { opacity: 0.6; }
.order-customer { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; }
.customer-emoji { font-size: 1.5rem; }
.order-requirement { font-size: 0.875rem; }
.weapon-emoji { margin-right: 0.25rem; }
.order-reward { font-size: 0.875rem; margin-top: 0.5rem; }
.fulfilled-badge { position: absolute; top: 0.5rem; right: 0.5rem; color: #2ecc71; }

.forge-section { grid-column: 2; background: rgba(0,0,0,0.3); border-radius: 1rem; padding: 1rem; }
.forge-section h3 { color: #e67e22; margin: 0 0 1rem 0; }
.forge-controls { margin-bottom: 1rem; }
.control-group { margin-bottom: 1rem; }
.control-group label { display: block; margin-bottom: 0.5rem; color: #aaa; }
.type-buttons, .quality-buttons { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.type-buttons button, .quality-buttons button { font-size: 0.75rem; background: rgba(255,255,255,0.1); color: #fff; border: 2px solid transparent; }
.type-buttons button.active, .quality-buttons button.active { background: #d35400; border-color: #e67e22; }
.btn-forge { width: 100%; padding: 1rem; background: linear-gradient(45deg, #c0392b, #e74c3c); color: #fff; font-size: 1rem; margin-top: 1rem; }
.code-display { background: #1a1a1a; padding: 1rem; border-radius: 0.5rem; font-size: 0.75rem; overflow-x: auto; }
.code-display pre { margin: 0; }
.code-display code { color: #2ecc71; }

.weapons-section { grid-column: 1 / 3; background: rgba(0,0,0,0.3); border-radius: 1rem; padding: 1rem; }
.weapons-section h3 { color: #e67e22; margin: 0 0 1rem 0; }
.weapons-grid { display: flex; flex-wrap: wrap; gap: 0.75rem; }
.weapon-card { background: rgba(255,255,255,0.1); padding: 1rem; border-radius: 0.5rem; text-align: center; min-width: 100px; border: 2px solid; }
.weapon-emoji { font-size: 2rem; }
.weapon-name { font-size: 0.75rem; font-weight: bold; }
.weapon-stats { font-size: 0.75rem; color: #aaa; }

.status-panel { grid-column: 3; grid-row: 1 / 2; background: rgba(255,255,255,0.1); border-radius: 1rem; padding: 1rem; }
.status-panel h3 { color: #e67e22; margin: 0 0 1rem 0; }
.objective-item { display: flex; gap: 0.5rem; padding: 0.5rem; background: rgba(0,0,0,0.2); border-radius: 0.25rem; margin-bottom: 0.5rem; font-size: 0.875rem; }
.objective-item.completed { background: rgba(46, 204, 113, 0.2); }
.stats { font-size: 0.875rem; color: #aaa; margin: 1rem 0; }
.stats > div { padding: 0.25rem 0; }

.message-log { grid-column: 3; grid-row: 2 / 4; background: rgba(0,0,0,0.3); border-radius: 1rem; padding: 1rem; }
.message-log h3 { color: #e67e22; font-size: 1rem; margin: 0 0 0.5rem 0; }
.log-content { font-size: 0.75rem; color: #aaa; }
.log-item { padding: 0.25rem 0; border-bottom: 1px solid rgba(255,255,255,0.1); }

.victory-content h2 { color: #f1c40f; }
.stars { font-size: 3rem; margin: 1rem 0; text-align: center; }
.stars span { opacity: 0.3; }
.stars span.earned { opacity: 1; }
.pattern-summary { background: rgba(255,255,255,0.1); padding: 1rem; border-radius: 0.5rem; text-align: left; margin: 1rem 0; }
.pattern-summary h4 { color: #e67e22; margin: 0 0 0.5rem 0; }
.pattern-summary ul { margin: 0; padding-left: 1.25rem; font-size: 0.875rem; }
.victory-buttons { display: flex; gap: 1rem; justify-content: center; }
.victory-buttons button { padding: 0.75rem 2rem; background: #d35400; color: #fff; }
</style>
