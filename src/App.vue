<template>
  <div class="flex flex-col h-screen max-w-md mx-auto bg-gradient-to-b from-gray-50 to-gray-200 font-sans relative">
    
    <!-- ===== 顶部状态栏 ===== -->
    <div class="bg-white/90 backdrop-blur p-4 shadow-sm z-10 flex-shrink-0">
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-2">
          <span class="text-2xl">⚽</span>
          <span class="text-xl font-bold text-transparent">　</span>
        </div>
        <div class="text-right">
          <span class="text-sm text-gray-500">已签</span>
          <span class="font-bold text-green-600 text-lg ml-1">{{ myTeam.length }}</span>
          <span class="text-gray-400 text-sm">/ {{ totalRounds }}</span>
        </div>
      </div>
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

    <!-- ===== 中部：表格 + 雷达图 ===== -->
    <div class="flex-1 overflow-y-auto p-4">
      <div v-if="currentCandidates.length > 0">
        <!-- 球员表格 -->
        <div class="space-y-3">
          <div class="flex items-center text-xs text-gray-400 px-3 py-1">
            <span class="w-8 text-center">#</span>
            <span class="flex-1">球员</span>
            <span class="w-14 text-center">位置</span>
            <span class="w-12 text-center">评分</span>
            <span class="w-12 text-center">操作</span>
          </div>

          <div 
            v-for="(player, idx) in currentCandidates" 
            :key="player.id"
            class="bg-white rounded-2xl shadow-md p-3 flex items-center gap-2 transition-all active:scale-[0.98]"
            :class="{ 'border-2 border-green-400': selectedId === player.id }"
            @click="selectedId = player.id"
          >
            <span class="w-8 text-center text-sm font-bold text-gray-400">{{ idx + 1 }}</span>
            <div class="flex-1 min-w-0">
              <div class="font-bold text-gray-800 text-sm truncate">{{ player.name }}</div>
            </div>
            <div class="w-14 text-center">
              <span class="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{{ player.position }}</span>
            </div>
            <div class="w-12 text-center">
              <span class="font-bold text-green-600 text-lg">{{ player.rating }}</span>
            </div>
            <button 
              @click.stop="signPlayer(player)"
              class="w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold transition-all active:scale-95 flex-shrink-0"
              :class="selectedId === player.id ? 'bg-green-500 text-white shadow-md' : 'bg-gray-200 text-gray-400'"
            >
              ✓
            </button>
          </div>
        </div>

        <!-- ===== 雷达图 ===== -->
        <div class="mt-4 bg-white rounded-2xl shadow-md p-3">
          <div class="text-xs text-gray-400 text-center mb-1">—— 能力雷达图（五人对比） ——</div>
          <div class="w-full" style="height: 280px; position: relative;">
            <Radar 
              :data="radarData" 
              :options="radarOptions"
            />
          </div>
          <div class="flex flex-wrap gap-2 justify-center mt-2">
            <div 
              v-for="(player, idx) in currentCandidates" 
              :key="idx"
              class="flex items-center gap-1 text-xs cursor-pointer px-2 py-1 rounded-full transition-all"
              :class="selectedId === player.id ? 'bg-green-100 font-bold' : 'hover:bg-gray-100 opacity-70'"
              @click="selectedId = player.id"
            >
              <span 
                class="w-3 h-3 rounded-full" 
                :style="{ backgroundColor: colors[idx % colors.length] }"
              ></span>
              <span :class="{ 'font-bold': selectedId === player.id }">{{ player.name }}</span>
            </div>
          </div>
        </div>

        <div class="text-center text-xs text-gray-400 py-2">
          点击球员查看详情，点击 ✓ 签约
        </div>
      </div>

      <!-- ===== 空状态（选秀结束） ===== -->
      <div v-else class="w-full text-center py-12">
        <div class="text-6xl mb-4">🎉</div>
        <h3 class="text-xl font-bold text-gray-700">完成</h3>
        <p class="text-gray-500 mt-2">你共有 {{ myTeam.length }} 名球员</p>
        <!-- 查看完整球队按钮（手机端友好） -->
        <button 
          @click="showTeam = true; scrollToTeam()"
          class="mt-4 px-6 py-2 bg-blue-500 text-white rounded-xl font-bold shadow-lg active:scale-95 transition"
        >
          📋 
        </button>
        <button 
          @click="restartGame" 
          class="mt-4 px-6 py-2 bg-green-500 text-white rounded-xl font-bold shadow-lg active:scale-95 transition ml-2"
        >
          🔄 
        </button>
      </div>
    </div>

    <!-- ===== 底部：我的球队（选秀结束后自动展开） ===== -->
    <div 
      ref="teamSection"
      class="bg-white/90 backdrop-blur p-3 shadow-inner flex-shrink-0 transition-all duration-500"
      :class="myTeam.length === totalRounds ? 'border-t-4 border-green-500' : ''"
    >
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
        <div 
          v-for="(p, idx) in myTeam" 
          :key="idx" 
          class="flex items-center gap-2 p-2 bg-gray-50 rounded-xl text-sm"
        >
          <span class="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-bold">{{ idx + 1 }}</span>
          <span class="font-medium">{{ p.name }}</span>
          <span class="text-xs text-gray-400">{{ p.position }}</span>
          <span class="text-green-600 font-bold ml-auto">{{ p.rating }}</span>
        </div>
      </div>
      <div v-else-if="showTeam && myTeam.length === 0" class="mt-2 text-sm text-gray-400 text-center py-2">
        还没有任何球员
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue';
import { Radar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';

// 注册 Chart.js 组件
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

// ==================== 雷达图配置 ====================
const radarOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    r: {
      min: 4,
      max: 20,
      ticks: {
        stepSize: 4,
        font: { size: 10 },
        backdropColor: 'transparent'
      },
      pointLabels: {
        font: { size: 12 }
      },
      grid: {
        color: 'rgba(0,0,0,0.1)'
      },
      angleLines: {
        color: 'rgba(0,0,0,0.08)'
      }
    }
  },
  plugins: {
    legend: {
      display: false
    }
  },
  elements: {
    line: {
      tension: 0,
      borderWidth: 2
    },
    point: {
      radius: 1,
      hoverRadius: 2
    }
  }
};

// ==================== 颜色方案 ====================
const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'];

// ==================== 八维维度 ====================
const abilityKeys = ['防守', '身体', '速度', '创造', '进攻', '技术', '制空', '精神'];

// ================================================================
// ===== 在这里手动输入每个球员的 8 项能力值（范围 0-100） =====
// ================================================================
const PLAYER_DATA = [
  {
    id: 1,
    name: '肖哥1',
    position: 'ST',
    rating: 94,
    abilities: {
      防守: 11,
      身体: 12.5,
      速度: 10.5,
      创造: 9.7,
      进攻: 13.3,
      技术: 12,
      制空: 13,
      精神: 15.6
    }
  },
  {
    id: 2,
    name: '肖哥2',
    position: 'DM',
    rating: 92,
    abilities: {
      防守: 13,
      身体: 13,
      速度: 12,
      创造: 11,
      进攻: 5,
      技术: 11,
      制空: 12,
      精神: 11
    }
  },
  {
    id: 3,
    name: '肖哥3',
    position: 'MC',
    rating: 91,
    abilities: {
      防守: 12,
      身体: 12,
      速度: 13,
      创造: 13,
      进攻: 13,
      技术: 13,
      制空: 13,
      精神: 13
    }
  },
  {
    id: 4,
    name: '肖哥4',
    position: 'DL',
    rating: 90,
    abilities: {
      防守: 14,
      身体: 15,
      速度: 14,
      创造: 8,
      进攻: 10,
      技术: 11,
      制空: 11,
      精神: 13
    }
  },
  {
    id: 5,
    name: '肖哥5',
    position: 'AMR',
    rating: 89,
    abilities: {
      防守: 5,
      身体: 13.5,
      速度: 16.5,
      创造: 14,
      进攻: 14,
      技术: 13,
      制空: 5,
      精神: 11
    }
  },
  {
    id: 6,
    name: '肖哥6',
    position: 'DC',
    rating: 93,
    abilities: {
      防守: 15,
      身体: 15,
      速度: 9,
      创造: 6,
      进攻: 8,
      技术: 11,
      制空: 15,
      精神: 13
    }
  },
  {
    id: 7,
    name: '肖哥7',
    position: 'ST',
    rating: 88,
    abilities: {
      防守: 5,
      身体: 10,
      速度: 14,
      创造: 12,
      进攻: 14,
      技术: 14,
      制空: 10,
      精神: 14
    }
  },
  {
    id: 8,
    name: '肖哥8',
    position: 'AMC',
    rating: 89,
    abilities: {
      防守: 7,
      身体: 9,
      速度: 13,
      创造: 16,
      进攻: 14.3,
      技术: 15,
      制空: 7,
      精神: 12
    }
  },
  {
    id: 9,
    name: '肖哥9',
    position: 'DR',
    rating: 88,
    abilities: {
      防守: 13,
      身体: 16,
      速度: 13,
      创造: 13,
      进攻: 12,
      技术: 12,
      制空: 5,
      精神: 11
    }
  },
  {
    id: 10,
    name: '肖哥10',
    position: 'MC',
    rating: 87,
    abilities: {
      防守: 11,
      身体: 11.5,
      速度: 13.5,
      创造: 9.7,
      进攻: 13.3,
      技术: 12,
      制空: 13,
      精神: 16
    }
  }
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

// ==================== 工具函数：颜色透明度转换 ====================
const hexToRgba = (hex, opacity) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// ==================== 滚动到底部（查看球队） ====================
const scrollToTeam = () => {
  nextTick(() => {
    if (teamSection.value) {
      teamSection.value.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  });
};

// ==================== 雷达图数据（核心：选中球员置顶 + 透明度控制） ====================
const radarData = computed(() => {
  const labels = abilityKeys;
  
  // 先构建所有球员的 dataset
  const allDatasets = currentCandidates.value.map((player, idx) => {
    const isSelected = player.id === selectedId.value;
    const color = colors[idx % colors.length];
    
    return {
      label: player.name,
      data: abilityKeys.map(key => player.abilities?.[key] || 0),
      backgroundColor: 'rgba(0,0,0,0)',
      // ===== 关键：未选中球员透明度 0.7，选中球员完全不透明 =====
      borderColor: isSelected ? color : hexToRgba(color, 0.6),
      borderWidth: isSelected ? 4 : 2,  // 选中球员线条加粗
      pointBackgroundColor: isSelected ? color : hexToRgba(color, 0.6),
      pointRadius: isSelected ? 2 : 0,  // 选中球员点稍大
      pointBorderColor: isSelected ? color : hexToRgba(color, 0.6),
      pointBorderWidth: isSelected ? 2 : 1,
      fill: false,
      _playerId: player.id
    };
  });

  // 将选中的球员移到数组最后（最上层）
  if (selectedId.value) {
    const selectedIndex = allDatasets.findIndex(d => d._playerId === selectedId.value);
    if (selectedIndex !== -1) {
      const [selectedItem] = allDatasets.splice(selectedIndex, 1);
      allDatasets.push(selectedItem);
    }
  }
  
  return {
    labels: labels,
    datasets: allDatasets
  };
});

// ==================== 核心函数 ====================
const shuffleArray = (arr) => {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const fetchCandidates = () => {
  if (availablePool.value.length === 0) {
    currentCandidates.value = [];
    return;
  }
  const shuffled = shuffleArray(availablePool.value);
  const count = Math.min(5, shuffled.length);
  currentCandidates.value = shuffled.slice(0, count).map((player, idx) => ({
    ...player,
    color: colors[idx % colors.length]
  }));
  selectedId.value = currentCandidates.value.length > 0 ? currentCandidates.value[0].id : null;
};

const signPlayer = (player) => {
  if (isSelecting.value) return;
  isSelecting.value = true;
  myTeam.value.push(player);
  const candidateIds = currentCandidates.value.map(p => p.id);
  availablePool.value = availablePool.value.filter(p => !candidateIds.includes(p.id));
  if (navigator.vibrate) navigator.vibrate(30);
  setTimeout(() => {
    currentRound.value += 1;
    isSelecting.value = false;
    if (currentRound.value > totalRounds || availablePool.value.length === 0) {
      currentCandidates.value = [];
      // ===== 选秀结束，自动展开我的球队并滚动到底部 =====
      showTeam.value = true;
      setTimeout(() => {
        scrollToTeam();
      }, 300);
    } else {
      fetchCandidates();
    }
  }, 300);
};

const restartGame = () => {
  const resetPlayers = PLAYER_DATA.map(p => ({ ...p }));
  availablePool.value = shuffleArray(resetPlayers);
  myTeam.value = [];
  currentRound.value = 1;
  selectedId.value = null;
  showTeam.value = false;
  fetchCandidates();
};

// ==================== 生命周期 ====================
onMounted(() => {
  const initialPlayers = PLAYER_DATA.map(p => ({ ...p }));
  availablePool.value = shuffleArray(initialPlayers);
  fetchCandidates();
});
</script>

<style scoped>
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