<template>
  <div class="flex flex-col h-screen max-w-md mx-auto bg-gradient-to-b from-gray-50 to-gray-200 font-sans relative">
    
    <!-- ===== 顶部状态栏 ===== -->
    <div class="bg-white/90 backdrop-blur p-4 shadow-sm z-10 flex-shrink-0">
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-2">
          <span class="text-2xl">⚽</span>
          <span class="font-bold text-gray-800">选秀大会</span>
        </div>
        <div class="text-right">
          <span class="text-sm text-gray-500">已签</span>
          <span class="font-bold text-green-600 text-lg ml-1">{{ myTeam.length }}</span>
          <span class="text-gray-400 text-sm">/ {{ totalRounds }}</span>
        </div>
      </div>
      <!-- 进度条 -->
      <div class="w-full bg-gray-200 rounded-full h-2.5 mt-2">
        <div 
          class="bg-gradient-to-r from-green-400 to-emerald-500 h-2.5 rounded-full transition-all duration-500" 
          :style="{ width: (currentRound/totalRounds)*100 + '%' }"
        ></div>
      </div>
      <div class="flex justify-between text-xs text-gray-400 mt-1">
        <span>第 {{ currentRound }} 轮</span>
        <span>剩余 {{ availablePool.length }} 人</span>
      </div>
    </div>

    <!-- ===== 中部：表格列表 ===== -->
    <div class="flex-1 overflow-y-auto p-4">
      <div v-if="currentCandidates.length > 0" class="space-y-3">
        <!-- 表头 -->
        <div class="flex items-center text-xs text-gray-400 px-3 py-1">
          <span class="w-10">#</span>
          <span class="flex-1">球员</span>
          <span class="w-12 text-center">位置</span>
          <span class="w-12 text-center">评分</span>
          <span class="w-16 text-center">操作</span>
        </div>

        <!-- 球员行 -->
        <div 
          v-for="(player, idx) in currentCandidates" 
          :key="player.id"
          class="bg-white rounded-2xl shadow-md p-3 flex items-center gap-2 transition-all active:scale-[0.98]"
          :class="{ 'border-2 border-green-400': selectedId === player.id }"
          @click="selectedId = player.id"
        >
          <!-- 序号 -->
          <span class="w-6 text-sm font-bold text-gray-400">{{ idx + 1 }}</span>
          
          <!-- 头像（字母） -->
          <div class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
               :class="getColor(idx)">
            {{ player.name.charAt(0) }}
          </div>
          
          <!-- 姓名和位置 -->
          <div class="flex-1 min-w-0">
            <div class="font-bold text-gray-800 text-sm truncate">{{ player.name }}</div>
            <div class="text-xs text-gray-400">{{ player.position }}</div>
          </div>
          
          <!-- 评分 -->
          <div class="text-center w-10">
            <span class="font-bold text-green-600 text-lg">{{ player.rating }}</span>
          </div>
          
          <!-- 签约按钮 -->
          <button 
            @click.stop="signPlayer(player)"
            class="px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 flex-shrink-0"
            :class="selectedId === player.id ? 'bg-green-500 text-white shadow-md' : 'bg-gray-200 text-gray-500'"
          >
            签约
          </button>
        </div>

        <!-- 底部操作栏：跳过本轮 -->
        <div class="flex gap-3 mt-4">
          <button 
            @click="skipCurrent" 
            class="flex-1 py-3 bg-gray-200 rounded-2xl text-gray-700 font-bold active:bg-gray-300 transition-all active:scale-95"
          >
            ⏭ 跳过本轮（淘汰5人）
          </button>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="w-full text-center py-12">
        <div class="text-6xl mb-4">🎉</div>
        <h3 class="text-xl font-bold text-gray-700">选秀结束！</h3>
        <p class="text-gray-500 mt-2">你共签约了 {{ myTeam.length }} 名球员</p>
        <button 
          @click="restartGame" 
          class="mt-6 px-8 py-3 bg-green-500 text-white rounded-2xl font-bold shadow-lg active:scale-95 transition"
        >
          🔄 重新开始
        </button>
      </div>
    </div>

    <!-- ===== 底部：我的球队 ===== -->
    <div class="bg-white/90 backdrop-blur p-3 shadow-inner flex-shrink-0">
      <div 
        @click="showTeam = !showTeam"
        class="flex items-center justify-between cursor-pointer active:scale-95 transition"
      >
        <div class="flex items-center gap-2">
          <span class="text-xl">🏠</span>
          <span class="font-medium text-gray-700">我的球队</span>
          <span class="bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{{ myTeam.length }}</span>
        </div>
        <span class="text-gray-400 text-sm">{{ showTeam ? '收起 ▲' : '展开 ▼' }}</span>
      </div>
      
      <!-- 球队名单 -->
      <div v-if="showTeam && myTeam.length > 0" class="mt-2 max-h-32 overflow-y-auto space-y-1">
        <div v-for="(p, idx) in myTeam" :key="idx" class="flex items-center gap-2 p-2 bg-gray-50 rounded-xl text-sm">
          <span class="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">{{ p.name.charAt(0) }}</span>
          <span class="font-medium">{{ p.name }}</span>
          <span class="text-xs text-gray-400">{{ p.position }}</span>
          <span class="text-green-600 font-bold ml-auto">{{ p.rating }}</span>
        </div>
      </div>
      <div v-else-if="showTeam && myTeam.length === 0" class="mt-2 text-sm text-gray-400 text-center py-2">
        还没有签约任何球员
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// ==================== 模拟数据库（50名球员） ====================
const mockDatabase = [
  { id: 1, name: 'MAL', position: 'CM', rating: 82, stats: { 射门: 74, 速度: 76, 传球: 82, 防守: 70 } },
];

// ==================== 游戏状态 ====================
const totalRounds = 10;
const currentRound = ref(1);
const availablePool = ref([]);
const myTeam = ref([]);
const currentCandidates = ref([]);
const selectedId = ref(null);
const isSelecting = ref(false);
const showTeam = ref(false);

// ==================== 核心函数 ====================
// 洗牌函数
const shuffleArray = (arr) => {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// 抽取5名候选球员
const fetchCandidates = () => {
  if (availablePool.value.length === 0) {
    currentCandidates.value = [];
    return;
  }
  
  const shuffled = shuffleArray(availablePool.value);
  const count = Math.min(5, shuffled.length);
  currentCandidates.value = shuffled.slice(0, count);
  selectedId.value = currentCandidates.value.length > 0 ? currentCandidates.value[0].id : null;
};

// 签约
const signPlayer = (player) => {
  if (isSelecting.value) return;
  
  isSelecting.value = true;
  
  // 加入球队
  myTeam.value.push(player);
  
  // 从总池中移除本轮所有候选人
  const candidateIds = currentCandidates.value.map(p => p.id);
  availablePool.value = availablePool.value.filter(p => !candidateIds.includes(p.id));
  
  // 震动反馈（手机端生效）
  if (navigator.vibrate) navigator.vibrate(30);
  
  // 进入下一轮
  setTimeout(() => {
    currentRound.value += 1;
    isSelecting.value = false;
    
    if (currentRound.value > totalRounds || availablePool.value.length === 0) {
      currentCandidates.value = [];
    } else {
      fetchCandidates();
    }
  }, 300);
};

// 跳过本轮
const skipCurrent = () => {
  if (currentCandidates.value.length === 0 || isSelecting.value) return;
  
  isSelecting.value = true;
  const candidateIds = currentCandidates.value.map(p => p.id);
  availablePool.value = availablePool.value.filter(p => !candidateIds.includes(p.id));
  
  setTimeout(() => {
    currentRound.value += 1;
    isSelecting.value = false;
    
    if (currentRound.value > totalRounds || availablePool.value.length === 0) {
      currentCandidates.value = [];
    } else {
      fetchCandidates();
    }
  }, 300);
};

// 重新开始
const restartGame = () => {
  availablePool.value = shuffleArray([...mockDatabase]);
  myTeam.value = [];
  currentRound.value = 1;
  selectedId.value = null;
  showTeam.value = false;
  fetchCandidates();
};

// 头像颜色
const getColor = (index) => {
  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-red-500', 
    'bg-yellow-500', 'bg-purple-500'
  ];
  return colors[index % colors.length];
};

// ==================== 生命周期 ====================
onMounted(() => {
  availablePool.value = shuffleArray([...mockDatabase]);
  fetchCandidates();
});
</script>

<style scoped>
/* 滚动条美化 */
::-webkit-scrollbar {
  width: 4px;
}
::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 10px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
</style>