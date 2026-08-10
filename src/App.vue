<template>
  <div class="flex flex-col h-screen max-w-md mx-auto bg-gradient-to-b from-gray-50 to-gray-200 font-sans relative">
    
    <!-- ===== 顶部状态栏 ===== -->
    <div class="bg-white/90 backdrop-blur p-4 shadow-sm z-10">
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

    <!-- ===== 中部卡片区 ===== -->
    <div class="flex-1 overflow-hidden relative p-4 flex items-center">
      <!-- 当前展示球员卡片 -->
      <div 
        v-if="currentCandidates.length > 0" 
        class="w-full bg-white rounded-3xl shadow-2xl p-6 relative transform transition-all duration-300"
        :class="{ 'scale-95 opacity-50': isSelecting }"
      >
        <!-- 角标：位置 -->
        <span class="absolute top-4 right-4 text-xs font-bold bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full">
          {{ currentCandidates[currentIndex].position }}
        </span>
        
        <!-- 球员头像（用首字母+颜色模拟） -->
        <div class="w-28 h-28 mx-auto rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-5xl text-white shadow-lg mb-4">
          {{ currentCandidates[currentIndex].name.charAt(0) }}
        </div>
        
        <!-- 姓名和评分 -->
        <h2 class="text-2xl font-bold text-center text-gray-800">
          {{ currentCandidates[currentIndex].name }}
        </h2>
        <div class="flex justify-center items-center gap-2 mt-1">
          <span class="text-sm text-gray-400">综合评分</span>
          <span class="text-3xl font-extrabold text-green-600">{{ currentCandidates[currentIndex].rating }}</span>
        </div>

        <!-- 能力值条形图（更直观） -->
        <div class="mt-4 space-y-1.5">
          <div v-for="(value, key) in currentCandidates[currentIndex].stats" :key="key" class="flex items-center gap-2">
            <span class="text-xs text-gray-500 w-8">{{ key }}</span>
            <div class="flex-1 bg-gray-200 rounded-full h-2">
              <div class="bg-blue-500 h-2 rounded-full" :style="{ width: value + '%' }"></div>
            </div>
            <span class="text-xs font-semibold text-gray-600 w-6">{{ value }}</span>
          </div>
        </div>

        <!-- 缩略图导航（点选切换） -->
        <div class="flex justify-center gap-3 mt-5">
          <button 
            v-for="(player, idx) in currentCandidates" 
            :key="idx"
            @click="currentIndex = idx"
            class="w-10 h-10 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all"
            :class="idx === currentIndex ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-300 text-gray-400 hover:border-gray-400'"
          >
            {{ player.name.charAt(0) }}
          </button>
        </div>
        
        <!-- 滑动提示（左右箭头） -->
        <div class="absolute left-2 top-1/2 -translate-y-1/2 text-3xl text-gray-300 opacity-60 pointer-events-none">
          ‹
        </div>
        <div class="absolute right-2 top-1/2 -translate-y-1/2 text-3xl text-gray-300 opacity-60 pointer-events-none">
          ›
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="w-full text-center py-12">
        <div class="text-6xl mb-4">🎉</div>
        <h3 class="text-xl font-bold text-gray-700">选秀结束！</h3>
        <p class="text-gray-500 mt-2">你共签约了 {{ myTeam.length }} 名球员</p>
      </div>
    </div>

    <!-- ===== 底部操作区 ===== -->
    <div class="bg-white/90 backdrop-blur p-4 pb-6 shadow-inner flex gap-3">
      <!-- 跳过按钮 -->
      <button 
        @click="skipCurrent" 
        class="flex-1 py-4 bg-gray-200 rounded-2xl text-gray-700 font-bold active:bg-gray-300 transition-all active:scale-95"
        :disabled="isSelecting || currentCandidates.length === 0"
      >
        ⏭ 跳过
      </button>
      
      <!-- 签约按钮（主操作） -->
      <button 
        @click="signPlayer" 
        class="flex-[2] py-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl text-white font-bold text-lg shadow-lg active:scale-95 transition-all"
        :class="{ 'opacity-50 pointer-events-none': isSelecting || currentCandidates.length === 0 }"
      >
        ✅ 签约这名球员
      </button>
    </div>

    <!-- ===== 已签约名单（底部弹出，轻触查看） ===== -->
    <div 
      @click="showTeam = !showTeam"
      class="absolute bottom-20 right-4 bg-white rounded-full shadow-lg px-4 py-2 flex items-center gap-2 cursor-pointer active:scale-95 transition"
    >
      <span class="text-sm">🏠 我的球队</span>
      <span class="bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{{ myTeam.length }}</span>
    </div>

    <!-- 球队名单弹窗 -->
    <div 
      v-if="showTeam" 
      @click="showTeam = false"
      class="fixed inset-0 bg-black/50 flex items-end justify-center z-50"
    >
      <div @click.stop class="bg-white w-full max-w-md rounded-t-3xl p-6 max-h-[50vh] overflow-y-auto">
        <h3 class="font-bold text-lg mb-3">📋 我的球队（{{ myTeam.length }}人）</h3>
        <div class="space-y-2">
          <div v-for="(p, idx) in myTeam" :key="idx" class="flex items-center gap-3 p-2 bg-gray-50 rounded-xl">
            <span class="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">{{ p.name.charAt(0) }}</span>
            <span class="font-medium">{{ p.name }}</span>
            <span class="text-xs text-gray-400 ml-auto">{{ p.position }}</span>
            <span class="text-green-600 font-bold">{{ p.rating }}</span>
          </div>
        </div>
        <button @click="showTeam = false" class="w-full mt-4 py-3 bg-gray-200 rounded-xl font-bold">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// ==================== 模拟数据库（50名球员） ====================
const mockDatabase = [
  { id: 1, name: '梅西', position: 'CF', rating: 94, stats: { 射门: 95, 速度: 82, 传球: 91, 防守: 38 } },
  { id: 2, name: 'C罗', position: 'ST', rating: 92, stats: { 射门: 93, 速度: 85, 传球: 78, 防守: 45 } },
  { id: 3, name: '姆巴佩', position: 'LW', rating: 91, stats: { 射门: 89, 速度: 97, 传球: 80, 防守: 42 } },
  { id: 4, name: '哈兰德', position: 'ST', rating: 90, stats: { 射门: 94, 速度: 88, 传球: 70, 防守: 40 } },
  { id: 5, name: '维尼修斯', position: 'LW', rating: 89, stats: { 射门: 85, 速度: 95, 传球: 82, 防守: 35 } },
  { id: 6, name: '德布劳内', position: 'CM', rating: 93, stats: { 射门: 82, 速度: 76, 传球: 96, 防守: 60 } },
  { id: 7, name: '贝林厄姆', position: 'CM', rating: 88, stats: { 射门: 80, 速度: 82, 传球: 84, 防守: 72 } },
  { id: 8, name: '萨拉赫', position: 'RW', rating: 89, stats: { 射门: 90, 速度: 88, 传球: 78, 防守: 50 } },
  { id: 9, name: '莱万', position: 'ST', rating: 88, stats: { 射门: 92, 速度: 75, 传球: 72, 防守: 38 } },
  { id: 10, name: '内马尔', position: 'LW', rating: 87, stats: { 射门: 84, 速度: 88, 传球: 86, 防守: 32 } },
  { id: 11, name: '凯恩', position: 'ST', rating: 89, stats: { 射门: 91, 速度: 70, 传球: 82, 防守: 48 } },
  { id: 12, name: '孙兴慜', position: 'LW', rating: 86, stats: { 射门: 86, 速度: 90, 传球: 76, 防守: 45 } },
  { id: 13, name: '佩德里', position: 'CM', rating: 85, stats: { 射门: 72, 速度: 78, 传球: 90, 防守: 68 } },
  { id: 14, name: '加维', position: 'CM', rating: 84, stats: { 射门: 70, 速度: 80, 传球: 85, 防守: 74 } },
  { id: 15, name: '巴尔韦德', position: 'CM', rating: 86, stats: { 射门: 78, 速度: 84, 传球: 82, 防守: 76 } },
  { id: 16, name: '罗德里', position: 'CDM', rating: 87, stats: { 射门: 68, 速度: 70, 传球: 84, 防守: 88 } },
  { id: 17, name: '坎特', position: 'CDM', rating: 85, stats: { 射门: 62, 速度: 78, 传球: 76, 防守: 92 } },
  { id: 18, name: '范迪克', position: 'CB', rating: 89, stats: { 射门: 50, 速度: 74, 传球: 72, 防守: 94 } },
  { id: 19, name: '鲁本迪亚斯', position: 'CB', rating: 88, stats: { 射门: 48, 速度: 70, 传球: 74, 防守: 93 } },
  { id: 20, name: '阿利松', position: 'GK', rating: 89, stats: { 扑救: 92, 反应: 90, 传球: 70, 防守: 85 } },
  { id: 21, name: '库尔图瓦', position: 'GK', rating: 90, stats: { 扑救: 94, 反应: 88, 传球: 68, 防守: 86 } },
  { id: 22, name: '阿方索戴维斯', position: 'LB', rating: 84, stats: { 射门: 66, 速度: 92, 传球: 78, 防守: 80 } },
  { id: 23, name: '阿诺德', position: 'RB', rating: 86, stats: { 射门: 72, 速度: 80, 传球: 88, 防守: 76 } },
  { id: 24, name: '特奥', position: 'LB', rating: 83, stats: { 射门: 70, 速度: 90, 传球: 76, 防守: 78 } },
  { id: 25, name: '里斯詹姆斯', position: 'RB', rating: 84, stats: { 射门: 68, 速度: 82, 传球: 80, 防守: 82 } },
  { id: 26, name: '萨卡', position: 'RW', rating: 87, stats: { 射门: 82, 速度: 86, 传球: 84, 防守: 52 } },
  { id: 27, name: '福登', position: 'LW', rating: 86, stats: { 射门: 80, 速度: 84, 传球: 86, 防守: 48 } },
  { id: 28, name: '穆夏拉', position: 'CAM', rating: 85, stats: { 射门: 78, 速度: 82, 传球: 86, 防守: 44 } },
  { id: 29, name: '维尔茨', position: 'CAM', rating: 84, stats: { 射门: 76, 速度: 80, 传球: 88, 防守: 42 } },
  { id: 30, name: '奥斯梅恩', position: 'ST', rating: 86, stats: { 射门: 88, 速度: 84, 传球: 68, 防守: 36 } },
  { id: 31, name: '劳塔罗', position: 'ST', rating: 85, stats: { 射门: 86, 速度: 80, 传球: 72, 防守: 42 } },
  { id: 32, name: '弗拉霍维奇', position: 'ST', rating: 84, stats: { 射门: 84, 速度: 76, 传球: 70, 防守: 38 } },
  { id: 33, name: '克瓦拉茨赫利亚', position: 'LW', rating: 84, stats: { 射门: 78, 速度: 88, 传球: 80, 防守: 40 } },
  { id: 34, name: '多库', position: 'RW', rating: 82, stats: { 射门: 74, 速度: 94, 传球: 76, 防守: 36 } },
  { id: 35, name: '奥纳纳', position: 'GK', rating: 84, stats: { 扑救: 86, 反应: 84, 传球: 78, 防守: 80 } },
  { id: 36, name: '迈尼昂', position: 'GK', rating: 85, stats: { 扑救: 88, 反应: 86, 传球: 76, 防守: 82 } },
  { id: 37, name: '金玟哉', position: 'CB', rating: 84, stats: { 射门: 44, 速度: 72, 传球: 70, 防守: 90 } },
  { id: 38, name: '萨利巴', position: 'CB', rating: 85, stats: { 射门: 46, 速度: 76, 传球: 74, 防守: 91 } },
  { id: 39, name: '格瓦迪奥尔', position: 'CB', rating: 84, stats: { 射门: 52, 速度: 78, 传球: 76, 防守: 88 } },
  { id: 40, name: '帕瓦尔', position: 'RB', rating: 82, stats: { 射门: 64, 速度: 78, 传球: 78, 防守: 84 } },
  { id: 41, name: '戴尔', position: 'CB', rating: 78, stats: { 射门: 40, 速度: 66, 传球: 72, 防守: 82 } },
  { id: 42, name: '马奎尔', position: 'CB', rating: 80, stats: { 射门: 48, 速度: 60, 传球: 70, 防守: 84 } },
  { id: 43, name: '拉什福德', position: 'LW', rating: 83, stats: { 射门: 80, 速度: 88, 传球: 74, 防守: 42 } },
  { id: 44, name: '加纳乔', position: 'LW', rating: 80, stats: { 射门: 76, 速度: 86, 传球: 72, 防守: 38 } },
  { id: 45, name: '霍伊伦德', position: 'ST', rating: 81, stats: { 射门: 82, 速度: 80, 传球: 66, 防守: 34 } },
  { id: 46, name: '努涅斯', position: 'ST', rating: 82, stats: { 射门: 84, 速度: 82, 传球: 70, 防守: 36 } },
  { id: 47, name: '若塔', position: 'CF', rating: 83, stats: { 射门: 82, 速度: 78, 传球: 76, 防守: 52 } },
  { id: 48, name: '迪亚斯', position: 'LW', rating: 82, stats: { 射门: 78, 速度: 84, 传球: 76, 防守: 40 } },
  { id: 49, name: '索博斯洛伊', position: 'CM', rating: 83, stats: { 射门: 76, 速度: 80, 传球: 84, 防守: 66 } },
  { id: 50, name: '麦卡利斯特', position: 'CM', rating: 82, stats: { 射门: 74, 速度: 76, 传球: 82, 防守: 70 } },
];

// ==================== 游戏状态 ====================
const totalRounds = 10;
const currentRound = ref(1);
const availablePool = ref([]);
const myTeam = ref([]);
const currentCandidates = ref([]);
const currentIndex = ref(0);
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
  currentIndex.value = 0;
};

// 签约
const signPlayer = () => {
  if (currentCandidates.value.length === 0 || isSelecting.value) return;
  
  isSelecting.value = true;
  const selectedPlayer = currentCandidates.value[currentIndex.value];
  
  // 加入球队
  myTeam.value.push(selectedPlayer);
  
  // 从总池中移除本轮5名候选人
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

// 跳过
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

// ==================== 键盘快捷键（PC调试用） ====================
const handleKeydown = (e) => {
  if (e.key === 'ArrowLeft' && currentCandidates.value.length > 0) {
    currentIndex.value = (currentIndex.value - 1 + currentCandidates.value.length) % currentCandidates.value.length;
  } else if (e.key === 'ArrowRight' && currentCandidates.value.length > 0) {
    currentIndex.value = (currentIndex.value + 1) % currentCandidates.value.length;
  } else if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    signPlayer();
  } else if (e.key === 's' || e.key === 'S') {
    skipCurrent();
  }
};

// ==================== 生命周期 ====================
onMounted(() => {
  // 初始化球员池
  availablePool.value = shuffleArray([...mockDatabase]);
  fetchCandidates();
  
  // 监听键盘事件（PC端调试方便）
  window.addEventListener('keydown', handleKeydown);
});
</script>

<style scoped>
/* 卡片的入场动画 */
.fade-enter-active, .fade-leave-active {
  transition: all 0.3s ease;
}
.fade-enter-from {
  transform: translateY(20px);
  opacity: 0;
}
.fade-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}

/* 滚动条美化 */
::-webkit-scrollbar {
  width: 4px;
}
::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 10px;
}
</style>