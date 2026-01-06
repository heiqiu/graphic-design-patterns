<template>
  <div id="app">
    <!-- 主菜单 -->
    <div v-if="currentView === 'home'" class="home-screen">
      <header class="home-header">
        <div class="title-section">
          <h1 class="game-title">🎮 设计模式大冒险</h1>
          <p class="game-subtitle">Design Patterns Adventure</p>
          <p class="game-desc">在游戏中学习设计模式，成为编程高手！</p>
        </div>
      </header>

      <main class="pattern-selection">
        <h2>选择设计模式</h2>
        
        <!-- 行为型模式 -->
        <section class="pattern-category">
          <h3>🔄 行为型模式 (Behavioral)</h3>
          <div class="pattern-grid">
            <div class="pattern-card available" @click="selectPattern('observer')">
              <div class="pattern-icon">👁️</div>
              <div class="pattern-name">观察者模式</div>
              <div class="pattern-name-en">Observer</div>
              <div class="pattern-status">✅ 可游玩</div>
            </div>
            
            <div class="pattern-card available" @click="selectPattern('strategy')">
              <div class="pattern-icon">🎯</div>
              <div class="pattern-name">策略模式</div>
              <div class="pattern-name-en">Strategy</div>
              <div class="pattern-status">✅ 可游玩</div>
            </div>
            
            <div class="pattern-card locked">
              <div class="pattern-icon">📝</div>
              <div class="pattern-name">命令模式</div>
              <div class="pattern-name-en">Command</div>
              <div class="pattern-status">🔒 即将推出</div>
            </div>
          </div>
        </section>

        <!-- 创建型模式 -->
        <section class="pattern-category">
          <h3>🏭 创建型模式 (Creational)</h3>
          <div class="pattern-grid">
            <div class="pattern-card available" @click="selectPattern('singleton')">
              <div class="pattern-icon">🔮</div>
              <div class="pattern-name">单例模式</div>
              <div class="pattern-name-en">Singleton</div>
              <div class="pattern-status">✅ 可游玩</div>
            </div>
            
            <div class="pattern-card available" @click="selectPattern('factory')">
              <div class="pattern-icon">🏭</div>
              <div class="pattern-name">工厂模式</div>
              <div class="pattern-name-en">Factory</div>
              <div class="pattern-status">✅ 可游玩</div>
            </div>
            
            <div class="pattern-card locked">
              <div class="pattern-icon">🔨</div>
              <div class="pattern-name">建造者模式</div>
              <div class="pattern-name-en">Builder</div>
              <div class="pattern-status">🔒 即将推出</div>
            </div>
          </div>
        </section>

        <!-- 结构型模式 -->
        <section class="pattern-category">
          <h3>🏗️ 结构型模式 (Structural)</h3>
          <div class="pattern-grid">
            <div class="pattern-card available" @click="selectPattern('decorator')">
              <div class="pattern-icon">🎨</div>
              <div class="pattern-name">装饰器模式</div>
              <div class="pattern-name-en">Decorator</div>
              <div class="pattern-status">✅ 可游玩</div>
            </div>
            
            <div class="pattern-card locked">
              <div class="pattern-icon">🔌</div>
              <div class="pattern-name">适配器模式</div>
              <div class="pattern-name-en">Adapter</div>
              <div class="pattern-status">🔒 即将推出</div>
            </div>
            
            <div class="pattern-card locked">
              <div class="pattern-icon">🎭</div>
              <div class="pattern-name">代理模式</div>
              <div class="pattern-name-en">Proxy</div>
              <div class="pattern-status">🔒 即将推出</div>
            </div>
          </div>
        </section>
      </main>

      <footer class="home-footer">
        <p>💡 通过有趣的游戏来学习和理解设计模式</p>
        <p class="game-count">已开放 5 种设计模式游戏</p>
        <p class="copyright">Made with ❤️ for learning design patterns</p>
      </footer>
    </div>

    <!-- 观察者模式游戏 -->
    <ObserverGameView v-else-if="currentView === 'observer'" @back="currentView = 'home'" />
    
    <!-- 单例模式游戏 -->
    <SingletonGameView v-else-if="currentView === 'singleton'" @back="currentView = 'home'" />
    
    <!-- 工厂模式游戏 -->
    <FactoryGameView v-else-if="currentView === 'factory'" @back="currentView = 'home'" />
    
    <!-- 策略模式游戏 -->
    <StrategyGameView v-else-if="currentView === 'strategy'" @back="currentView = 'home'" />
    
    <!-- 装饰器模式游戏 -->
    <DecoratorGameView v-else-if="currentView === 'decorator'" @back="currentView = 'home'" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ObserverGameView from './games/observer/ObserverGameView.vue';
import SingletonGameView from './games/singleton/SingletonGameView.vue';
import FactoryGameView from './games/factory/FactoryGameView.vue';
import StrategyGameView from './games/strategy/StrategyGameView.vue';
import DecoratorGameView from './games/decorator/DecoratorGameView.vue';

type ViewType = 'home' | 'observer' | 'singleton' | 'factory' | 'strategy' | 'decorator';

const currentView = ref<ViewType>('home');

function selectPattern(pattern: string) {
  const validPatterns: ViewType[] = ['observer', 'singleton', 'factory', 'strategy', 'decorator'];
  if (validPatterns.includes(pattern as ViewType)) {
    currentView.value = pattern as ViewType;
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Microsoft YaHei', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
  min-height: 100vh;
  color: #fff;
}

#app {
  min-height: 100vh;
}
</style>

<style scoped>
.home-screen {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.home-header {
  text-align: center;
  padding: 3rem 2rem;
  background: linear-gradient(180deg, rgba(233, 69, 96, 0.3) 0%, transparent 100%);
}

.game-title {
  font-size: 3rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(45deg, #ff6b6b, #ffd93d, #6bcb77, #4d96ff);
  background-size: 300% 300%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradient-shift 5s ease infinite;
}

@keyframes gradient-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.game-subtitle {
  font-size: 1.25rem;
  color: #aaa;
  margin-bottom: 0.5rem;
}

.game-desc {
  font-size: 1rem;
  color: #888;
}

.pattern-selection {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.pattern-selection h2 {
  text-align: center;
  margin-bottom: 2rem;
  color: #e94560;
}

.pattern-category {
  margin-bottom: 2rem;
}

.pattern-category h3 {
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid rgba(233, 69, 96, 0.3);
  color: #fff;
}

.pattern-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
}

.pattern-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  padding: 1.5rem;
  text-align: center;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  position: relative;
  overflow: hidden;
}

.pattern-card.available {
  cursor: pointer;
  border-color: rgba(233, 69, 96, 0.5);
}

.pattern-card.available:hover {
  transform: translateY(-5px);
  border-color: #e94560;
  background: rgba(233, 69, 96, 0.2);
  box-shadow: 0 10px 30px rgba(233, 69, 96, 0.3);
}

.pattern-card.locked {
  opacity: 0.5;
  cursor: not-allowed;
}

.pattern-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.pattern-name {
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 0.25rem;
}

.pattern-name-en {
  font-size: 0.875rem;
  color: #888;
  margin-bottom: 0.75rem;
}

.pattern-status {
  font-size: 0.875rem;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  display: inline-block;
}

.pattern-card.available .pattern-status {
  background: rgba(46, 213, 115, 0.3);
  color: #2ed573;
}

.pattern-card.locked .pattern-status {
  background: rgba(255, 255, 255, 0.1);
  color: #888;
}

.home-footer {
  text-align: center;
  padding: 2rem;
  background: rgba(0, 0, 0, 0.2);
}

.home-footer p {
  margin: 0.5rem 0;
  color: #888;
}

.game-count {
  color: #2ed573 !important;
  font-weight: bold;
}

.copyright {
  font-size: 0.875rem;
}
</style>
