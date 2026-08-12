<template>
  <div class="flex flex-col h-screen max-w-md mx-auto bg-gradient-to-b from-gray-50 to-gray-200 font-sans relative">
    
    <!-- ===== 顶部状态栏 ===== -->
    <div v-if="!showHome && !showTactic && !showMentality && !showFormation && !showFormationResult" class="bg-white/90 backdrop-blur p-4 shadow-sm z-10 flex-shrink-0">
        <div class="flex justify-between items-center">
            <div class="flex items-center gap-2">
                <span class="text-2xl">⚽</span>
                <span class="text-xl font-bold text-transparent">　</span>
            </div>
            <!-- 进度提示 - 居中 -->
            <div class="text-center text-sm font-bold" :class="getStageHintClass()">
                {{ getStageHint() }}
            </div>
            <div class="text-right">
                <span class="text-sm text-gray-500">已选</span>
                <span class="font-bold text-green-600 text-lg ml-1">{{ myTeam.length }}</span>
                <span class="text-gray-400 text-sm">/ {{ totalRounds + gkRounds }}</span>
            </div>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2.5 mt-2">
            <div 
                class="h-2.5 rounded-full transition-all duration-500"
                :class="getProgressColor()"
                :style="{ width: getProgressWidth() }"
            ></div>
        </div>
        <div class="flex justify-between text-xs text-gray-400 mt-1">
            <span>未选/跳过的不会再抽到</span>
            <span>剩余 {{ getRemainingCount() }} 人</span>
        </div>
    </div>

    <!-- ===== 首页 ===== -->
    <div v-if="showHome && !isDraftFinished && !showTactic && !showMentality && !showFormation && !showFormationResult" class="flex-1 flex flex-col items-center justify-center p-6">
        <div class="text-6xl mb-6">⚽</div>
        <h1 class="text-3xl font-bold text-gray-800 mb-2"></h1>
        <div class="flex flex-col gap-4 w-full max-w-xs">
            <button 
                @click="startSimulation"
                class="w-full py-4 bg-green-500 text-white rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition"
            >
                模拟
            </button>
            <button 
                @click="showLogin = true"
                class="w-full py-4 bg-blue-500 text-white rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition"
            >
                对抗
            </button>
        </div>
    </div>

    <!-- ===== 登录弹窗 ===== -->
    <div v-if="showLogin" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="showLogin = false">
        <div class="bg-white rounded-2xl p-6 max-w-sm w-full mx-4">
            <h3 class="text-lg font-bold text-center text-gray-800 mb-2">⚔️ 对战模式</h3>
            <p class="text-xs text-center text-gray-400 mb-4">请输入用户名</p>
            <input 
                v-model="loginUsername"
                type="text"
                placeholder="请输入用户名"
                class="w-full px-4 py-3 border border-gray-300 rounded-xl text-center focus:outline-none focus:border-blue-500"
                @keyup.enter="confirmLogin"
            />
            <div v-if="loginError" class="text-red-500 text-xs text-center mt-2">{{ loginError }}</div>
            <div class="flex gap-3 mt-4">
                <button 
                    @click="showLogin = false; loginUsername = ''; loginError = ''"
                    class="flex-1 py-2 bg-gray-200 rounded-xl font-bold active:scale-95 transition"
                >
                    取消
                </button>
                <button 
                    @click="confirmLogin"
                    class="flex-1 py-2 bg-blue-500 text-white rounded-xl font-bold active:scale-95 transition"
                >
                    确认
                </button>
            </div>
        </div>
    </div>

    <!-- ===== 中部内容 ===== -->
    <div class="flex-1 overflow-y-auto p-4">

      <!-- ===== 选秀界面 ===== -->
      <div v-if="!showHome && !isDraftFinished && !showTactic && !showMentality && !showFormation && !showFormationResult">
          <!-- 常规球员选秀 -->
          <div v-if="!isGKRound && currentCandidates.length > 0">
              <!-- 球员表格 -->
              <div class="space-y-3">
                  <div class="flex items-center text-xs text-gray-400 px-3 py-1">
                      <span class="flex-1 pl-2">球员</span>
                      <span class="w-20 text-center">位置</span>
                      <span class="w-8 text-center"></span>
                  </div>

                  <div 
                      v-for="(player, idx) in currentCandidates" 
                      :key="player.id"
                      class="bg-white rounded-2xl shadow-md p-3 flex items-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
                      :class="{ 'border-2 border-green-400': selectedId === player.id }"
                      @click="selectedId = player.id"
                  >
                      <div class="flex-1 min-w-0 pl-2">
                          <div class="font-bold text-gray-800 text-sm truncate">{{ player.name }}</div>
                          <div class="text-xs text-gray-400 truncate">{{ player.club || '' }}</div>
                      </div>
                      <div class="w-20 text-center flex-shrink-0">
                          <span class="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{{ player.position }}</span>
                      </div>
                      <!-- ===== 带圈i按钮 ===== -->
                      <button 
                          @click.stop="openPlayerDetail(player)"
                          class="w-7 h-7 flex-shrink-0 rounded-full bg-gray-100 hover:bg-gray-200 transition flex items-center justify-center text-gray-500 hover:text-gray-700 text-sm font-bold"
                          title="查看球员详情"
                      >
                          <span class="text-xs font-serif font-bold">ⓘ</span>
                      </button>
                  </div>
              </div>

              <!-- 底部按钮 -->
              <div class="mt-4 flex justify-center gap-3">
                  <button 
                      @click="selectedId !== null ? signPlayer(currentCandidates.find(p => p.id === selectedId)) : null"
                      class="flex-1 py-3 rounded-2xl font-bold text-lg transition-all active:scale-95"
                      :class="selectedId !== null ? 'bg-green-500 text-white shadow-md' : 'bg-gray-200 text-gray-400 cursor-not-allowed'"
                  >
                      ✓ 
                  </button>
                  <button 
                      @click="skipRound"
                      :disabled="skipCount <= 0 || currentCandidates.length === 0"
                      class="px-4 py-3 rounded-2xl font-bold text-lg transition-all active:scale-95 flex items-center gap-1"
                      :class="skipCount > 0 && currentCandidates.length > 0 ? 'bg-orange-500 text-white shadow-md' : 'bg-gray-200 text-gray-400 cursor-not-allowed'"
                  >
                      跳过 ({{ skipCount }})
                  </button>
              </div>

              <div class="text-center text-xs text-gray-400 py-2">
                  点击球员查看详情，「✓」选择，「跳过」淘汰本轮5人
              </div>

              <!-- 雷达图 -->
              <div class="mt-4 bg-white rounded-2xl shadow-md p-3">
                  <div class="text-xs text-gray-400 text-center mb-1">————</div>
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
          </div>

          <!-- 门将选秀 -->
          <div v-else-if="isGKRound && gkCandidates.length > 0">
              <div class="text-center text-sm font-bold text-blue-600 mb-3"></div>
              <!-- 球员表格 -->
              <div class="space-y-3">
                  <div class="flex items-center text-xs text-gray-400 px-3 py-1">
                      <span class="flex-1 pl-2">门将</span>
                      <span class="w-20 text-center">位置</span>
                      <span class="w-8 text-center"></span>
                  </div>
                  <div 
                      v-for="(player, idx) in gkCandidates" 
                      :key="player.id"
                      class="bg-white rounded-2xl shadow-md p-3 flex items-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
                      :class="{ 'border-2 border-green-400': gkSelectedId === player.id }"
                      @click="gkSelectedId = player.id"
                  >
                      <div class="flex-1 min-w-0 pl-2">
                          <div class="font-bold text-gray-800 text-sm truncate">{{ player.name }}</div>
                          <div class="text-xs text-gray-400 truncate">{{ player.club || '' }}</div>
                      </div>
                      <div class="w-20 text-center flex-shrink-0">
                          <span class="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{{ player.position }}</span>
                      </div>
                      <!-- ===== 带圈i按钮 ===== -->
                      <button 
                          @click.stop="openPlayerDetail(player)"
                          class="w-7 h-7 flex-shrink-0 rounded-full bg-gray-100 hover:bg-gray-200 transition flex items-center justify-center text-gray-500 hover:text-gray-700 text-sm font-bold"
                          title="查看球员详情"
                      >
                          <span class="text-xs font-serif font-bold">ⓘ</span>
                      </button>
                  </div>
              </div>

              <!-- 底部按钮 -->
              <div class="mt-4 flex justify-center gap-3">
                  <button 
                      @click="gkSelectedId !== null ? signGK(gkCandidates.find(p => p.id === gkSelectedId)) : null"
                      class="flex-1 py-3 rounded-2xl font-bold text-lg transition-all active:scale-95"
                      :class="gkSelectedId !== null ? 'bg-green-500 text-white shadow-md' : 'bg-gray-200 text-gray-400 cursor-not-allowed'"
                  >
                      ✓ 
                  </button>
              </div>

              <div class="text-center text-xs text-gray-400 py-2">
                  点击门将查看详情，点击「✓」选择
              </div>

              <!-- 门将雷达图 -->
              <div class="mt-4 bg-white rounded-2xl shadow-md p-3">
                  <div class="text-xs text-gray-400 text-center mb-1">————</div>
                  <div class="w-full" style="height: 280px; position: relative;">
                      <Radar 
                          :data="gkRadarData" 
                          :options="radarOptions"
                      />
                  </div>
                  <div class="flex flex-wrap gap-2 justify-center mt-2">
                      <div 
                          v-for="(player, idx) in gkCandidates" 
                          :key="idx"
                          class="flex items-center gap-1 text-xs cursor-pointer px-2 py-1 rounded-full transition-all"
                          :class="gkSelectedId === player.id ? 'bg-green-100 font-bold' : 'hover:bg-gray-100 opacity-70'"
                          @click="gkSelectedId = player.id"
                      >
                          <span 
                              class="w-3 h-3 rounded-full" 
                              :style="{ backgroundColor: colors[idx % colors.length] }"
                          ></span>
                          <span :class="{ 'font-bold': gkSelectedId === player.id }">{{ player.name }}</span>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      <!-- ===== 战术风格选择 ===== -->
      <div v-else-if="showTactic" class="bg-white rounded-2xl shadow-md p-6">
        <h3 class="text-lg font-bold text-center text-gray-800 mb-2">📋 选择战术风格</h3>
        <p class="text-xs text-center text-gray-400 mb-4">选择球队的比赛风格</p>
        
        <div class="space-y-3 max-h-[420px] overflow-y-auto">
          <div 
            v-for="tactic in tactics" 
            :key="tactic.id"
            @click="selectedTactic = tactic.id"
            class="p-3 rounded-xl border-2 cursor-pointer transition-all active:scale-[0.98]"
            :class="selectedTactic === tactic.id ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'"
          >
            <div class="flex items-center justify-between">
              <span class="font-bold text-gray-800">{{ tactic.name }}</span>
              <span v-if="selectedTactic === tactic.id" class="text-green-500 text-lg">✅</span>
            </div>
            <p class="text-xs text-gray-500 mt-1">{{ tactic.description }}</p>
          </div>
        </div>
        
        <button 
          @click="confirmTactic"
          :disabled="!selectedTactic"
          class="w-full mt-4 py-3 bg-blue-500 text-white rounded-xl font-bold active:scale-95 transition disabled:opacity-50"
        >
          确认战术 →
        </button>
      </div>

      <!-- ===== 心态选择 ===== -->
      <div v-else-if="showMentality" class="bg-white rounded-2xl shadow-md p-6">
          <h3 class="text-lg font-bold text-center text-gray-800 mb-2">🎯 选择比赛心态</h3>
          <p class="text-xs text-center text-gray-400 mb-2">决定球队的整体比赛策略</p>
          <!-- 推荐心态提示 -->
          <div v-if="getRecommendedMentality()" class="mb-3 p-2 bg-blue-50 rounded-xl text-center">
              <span class="text-xs text-blue-600">推荐心态：</span>
              <span class="text-sm font-bold text-blue-700">{{ getRecommendedMentality() }}</span>
              <span class="text-xs text-gray-400 ml-2">（基于当前战术风格）</span>
          </div>
          <div class="space-y-3">
              <div 
                  v-for="mentality in mentalities" 
                  :key="mentality.id"
                  @click="selectedMentality = mentality.id"
                  class="p-3 rounded-xl border-2 cursor-pointer transition-all active:scale-[0.98]"
                  :class="[
                      selectedMentality === mentality.id ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300',
                      getRecommendedMentality() === mentality.name ? 'border-blue-400 bg-blue-50/50' : ''
                  ]"
              >
                  <div class="flex items-center justify-between">
                      <span class="font-bold text-gray-800">{{ mentality.name }}</span>
                      <span v-if="selectedMentality === mentality.id" class="text-green-500 text-lg">✅</span>
                      <span v-if="getRecommendedMentality() === mentality.name && selectedMentality !== mentality.id" class="text-xs text-blue-500">推荐</span>
                  </div>
                  <p class="text-xs text-gray-500 mt-1">{{ mentality.description }}</p>
              </div>
          </div>
          
          <div class="flex gap-3 mt-4">
              <button 
                  @click="showTactic = true; showMentality = false"
                  class="flex-1 py-3 bg-gray-200 rounded-xl font-bold active:scale-95 transition"
              >
                  ← 返回
              </button>
              <button 
                  @click="confirmMentality"
                  :disabled="!selectedMentality"
                  class="flex-1 py-3 bg-blue-500 text-white rounded-xl font-bold active:scale-95 transition disabled:opacity-50"
              >
                  确认心态 →
              </button>
          </div>
      </div>

      <!-- ===== 阵型设置界面 ===== -->
      <div v-else-if="showFormation && !showFormationResult" class="bg-white rounded-2xl shadow-md p-6">
        <h3 class="text-lg font-bold text-center text-gray-800 mb-4">📋 设置阵型</h3>
	
        <!-- ===== 推荐阵型按钮 ===== -->
        <div v-if="getRecommendedFormations().length > 0" class="mb-4">
          <p class="text-sm text-gray-500 mb-2">推荐阵型（点击直接应用）</p>
          <div class="flex flex-wrap gap-2">
                <button 
                    v-for="(fm, index) in getRecommendedFormations()" 
                    :key="index"
                    @click="applyFormation(fm.data)"
                    class="px-4 py-2.5 text-sm bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 transition active:scale-95"
                >
                    {{ fm.name }}
              </button>
          </div>
        </div>

        <p class="text-xs text-center text-gray-400 mb-4">步骤 {{ formationStep + 1 }} / 8</p>
        
        <div class="flex gap-3 mb-3">
          <button 
            @click="showMentality = true; showFormation = false"
            class="flex-1 py-2 bg-gray-200 rounded-xl font-bold text-sm active:scale-95 transition"
          >
            ← 返回心态
          </button>
        </div>
        
        <div class="space-y-4">
          <!-- 步骤0：中卫人数 -->
          <div v-if="formationStep === 0">
            <label class="block text-sm font-medium text-gray-700 mb-2">选择中卫人数</label>
            <div class="flex gap-3 justify-center">
              <button 
                v-for="n in [2, 3]" 
                :key="n"
                @click="formationData.cb = n"
                class="px-6 py-3 rounded-xl font-bold transition"
                :class="formationData.cb === n ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'"
              >
                {{ n }} 人
              </button>
            </div>
          </div>

          <!-- 步骤1：边卫类型 -->
          <div v-if="formationStep === 1">
            <label class="block text-sm font-medium text-gray-700 mb-2">选择边卫类型</label>
            <div class="flex flex-col gap-2">
              <button 
                v-for="type in ['边后卫', '边翼卫', '无']" 
                :key="type"
                @click="formationData.fullbackType = type; formationData.wingbackCount = type === '无' ? 0 : 2"
                class="px-6 py-3 rounded-xl font-bold transition"
                :class="formationData.fullbackType === type ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'"
              >
                {{ type }}
                <span v-if="type === '无'" class="text-xs font-normal text-gray-400 ml-2">（可选用边前卫）</span>
              </button>
            </div>
          </div>

          <!-- 步骤2：后腰人数 -->
          <div v-if="formationStep === 2">
            <label class="block text-sm font-medium text-gray-700 mb-2">选择后腰人数</label>
            <div class="flex gap-2 justify-center flex-wrap">
              <button 
                v-for="n in [0, 1, 2, 3]" 
                :key="n"
                @click="formationData.cdm = n"
                class="px-5 py-3 rounded-xl font-bold transition"
                :class="formationData.cdm === n ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'"
              >
                {{ n }}
              </button>
            </div>
          </div>

          <!-- 步骤3：边前卫人数 -->
          <div v-if="formationStep === 3">
            <label class="block text-sm font-medium text-gray-700 mb-2">选择边前卫人数</label>
            <div class="flex gap-3 justify-center">
              <button 
                v-for="n in [0, 2]" 
                :key="n"
                @click="formationData.lmrm = n"
                class="px-6 py-3 rounded-xl font-bold transition"
                :class="formationData.lmrm === n ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'"
              >
                {{ n === 0 ? '无' : '2人' }}
              </button>
            </div>
          </div>

          <!-- 步骤4：中场人数 -->
          <div v-if="formationStep === 4">
            <label class="block text-sm font-medium text-gray-700 mb-2">选择中场人数</label>
            <div class="flex gap-2 justify-center flex-wrap">
              <button 
                v-for="n in [0, 1, 2, 3]" 
                :key="n"
                @click="formationData.cm = n"
                class="px-5 py-3 rounded-xl font-bold transition"
                :class="formationData.cm === n ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'"
              >
                {{ n }}
              </button>
            </div>
          </div>

          <!-- 步骤5：前腰人数 -->
          <div v-if="formationStep === 5">
            <label class="block text-sm font-medium text-gray-700 mb-2">选择前腰人数</label>
            <div class="flex gap-2 justify-center flex-wrap">
              <button 
                v-for="n in [0, 1, 2, 3]" 
                :key="n"
                @click="formationData.cam = n"
                class="px-5 py-3 rounded-xl font-bold transition"
                :class="formationData.cam === n ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'"
              >
                {{ n }}
              </button>
            </div>
          </div>

          <!-- 步骤6：边锋 -->
          <div v-if="formationStep === 6">
            <label class="block text-sm font-medium text-gray-700 mb-2">选择边锋人数</label>
            <div class="flex gap-3 justify-center">
              <button 
                v-for="n in [0, 2]" 
                :key="n"
                @click="formationData.hasWingers = n"
                class="px-6 py-3 rounded-xl font-bold transition"
                :class="formationData.hasWingers === n ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'"
              >
                {{ n === 0 ? '无' : '2人' }}
              </button>
            </div>
          </div>

          <!-- 步骤7：中锋人数 -->
          <div v-if="formationStep === 7">
            <label class="block text-sm font-medium text-gray-700 mb-2">选择中锋人数</label>
            <div class="flex gap-3 justify-center">
              <button 
                v-for="n in [1, 2, 3]" 
                :key="n"
                @click="formationData.st = n"
                class="px-6 py-3 rounded-xl font-bold transition"
                :class="formationData.st === n ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'"
              >
                {{ n }} 人
              </button>
            </div>
          </div>

          <!-- 当前阵容预览 -->
          <div class="mt-4 p-3 bg-gray-50 rounded-xl">
            <p class="text-xs text-gray-500">当前阵容人数：{{ currentFormationTotal + 1 }} / 11（含门将和至少1中锋）</p>
            <div class="flex flex-wrap gap-1 mt-1">
              <span v-if="formationData.cb" class="text-xs bg-blue-100 px-2 py-0.5 rounded">CB×{{ formationData.cb }}</span>
              <span v-if="formationData.fullbackType && formationData.fullbackType !== '无'" class="text-xs bg-blue-100 px-2 py-0.5 rounded">{{ formationData.fullbackType }}×2</span>
              <span v-if="formationData.cdm" class="text-xs bg-cyan-100 px-2 py-0.5 rounded">CDM×{{ formationData.cdm }}</span>
              <span v-if="formationData.lmrm" class="text-xs bg-yellow-100 px-2 py-0.5 rounded">边前卫×{{ formationData.lmrm }}</span>
              <span v-if="formationData.cm" class="text-xs bg-yellow-100 px-2 py-0.5 rounded">CM×{{ formationData.cm }}</span>
              <span v-if="formationData.cam" class="text-xs bg-orange-100 px-2 py-0.5 rounded">CAM×{{ formationData.cam }}</span>
              <span v-if="formationData.hasWingers" class="text-xs bg-orange-100 px-2 py-0.5 rounded">边锋×{{ formationData.hasWingers }}</span>
              <span v-if="formationData.st" class="text-xs bg-red-100 px-2 py-0.5 rounded">ST×{{ formationData.st }}</span>
              <span class="text-xs bg-purple-100 px-2 py-0.5 rounded">GK×1</span>
            </div>
          </div>
        </div>

        <!-- 底部按钮 -->
        <div class="flex gap-3 mt-6">
          <button 
            v-if="formationStep > 0"
            @click="prevStep"
            class="flex-1 py-3 bg-gray-200 rounded-xl font-bold active:scale-95 transition"
          >
            ← 上一步
          </button>
          <button 
            v-if="formationStep < 7"
            @click="nextStep"
            :disabled="!canNext"
            class="flex-1 py-3 bg-blue-500 text-white rounded-xl font-bold active:scale-95 transition disabled:opacity-50"
          >
            下一步 →
          </button>
          <button 
            v-if="formationStep === 7"
            @click="finishFormation"
            :disabled="!canFinish"
            class="flex-1 py-3 bg-green-500 text-white rounded-xl font-bold active:scale-95 transition disabled:opacity-50"
          >
            ✅ 完成
          </button>
        </div>
        <p v-if="showError" class="text-red-500 text-xs text-center mt-2">{{ errorMessage }}</p>
      </div>

    <!-- ===== 最终结果 ===== -->
    <div v-else-if="showFormationResult" class="bg-white rounded-2xl shadow-md p-6">
        
        <!-- 战术风格 - 可点击重选 -->
        <div class="mb-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition" @click="showTacticSelector = true">
            <div class="flex items-center justify-between">
                <p class="text-xs text-gray-500">战术风格</p>
                <span class="text-xs text-blue-500">更换</span>
            </div>
            <p class="font-bold text-gray-800">{{ getTacticName() || '未选择' }}</p>
        </div>
        
        <!-- 心态 - 可点击重选 -->
        <div class="mb-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition" @click="showMentalitySelector = true">
            <div class="flex items-center justify-between">
                <p class="text-xs text-gray-500">比赛心态</p>
                <span class="text-xs text-blue-500">更换</span>
            </div>
            <p class="font-bold text-gray-800">{{ getMentalityName() || '未选择' }}</p>
        </div>
        
        <!-- 阵型图 -->
        <div class="mb-3 p-3 bg-gray-50 rounded-xl overflow-hidden">
            <p class="text-center font-bold text-[16px] text-gray-700 mb-2">选择首发</p>
            <div class="relative w-full aspect-[3/4] max-h-[380px] bg-gradient-to-b from-green-600 to-green-800 rounded-xl overflow-hidden">
                <div class="absolute inset-0 flex flex-col items-center justify-between py-2 px-1">
                    
                    <!-- 第1行：中锋（中路） -->
                    <div class="flex justify-center w-full">
                        <div class="flex justify-center gap-2" :class="formationData.st === 1 ? 'w-12' : formationData.st === 2 ? 'w-28' : 'w-40'">
                            <div v-for="(pos, idx) in getPositions(formationData.st, 'ST')" :key="'st-'+idx" 
                                 class="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg border-2 border-white/30 cursor-pointer"
                                 :class="getPositionColor('ST', idx)"
                                 @click="openPlayerSelect('ST', idx)"
                            >
                                {{ getPositionDisplay('ST', idx) }}
                            </div>
                        </div>
                    </div>
                    
                    <!-- 第2行：边锋（左/右）+ 前腰（中路） -->
                    <div class="flex justify-center items-center w-full gap-1 px-1">
                        <!-- 左路：边锋 -->
                        <div class="flex justify-center w-10 flex-shrink-0">
                            <div v-if="formationData.hasWingers >= 1" v-for="(pos, idx) in getPositions(1, 'AML')" :key="'w-left-'+idx" 
                                 class="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg border-2 border-white/30 cursor-pointer"
                                 :class="getPositionColor('AML', idx)"
                                 @click="openPlayerSelect('AML', idx)"
                            >
                                {{ getPositionDisplay('AML', idx) }}
                            </div>
                        </div>
                        <!-- 中路：前腰 -->
                        <div class="flex justify-center flex-1">
                            <div class="flex justify-center gap-2" :class="formationData.cam === 1 ? 'w-12' : formationData.cam === 2 ? 'w-28' : 'w-40'">
                                <div v-for="(pos, idx) in getPositions(formationData.cam, 'AMC')" :key="'cam-'+idx" 
                                     class="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg border-2 border-white/30 cursor-pointer"
                                     :class="getPositionColor('AMC', idx)"
                                     @click="openPlayerSelect('AMC', idx)"
                                >
                                    {{ getPositionDisplay('AMC', idx) }}
                                </div>
                            </div>
                        </div>
                        <!-- 右路：边锋 -->
                        <div class="flex justify-center w-10 flex-shrink-0">
                            <div v-if="formationData.hasWingers >= 2" v-for="(pos, idx) in getPositions(1, 'AMR')" :key="'w-right-'+idx" 
                                 class="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg border-2 border-white/30 cursor-pointer"
                                 :class="getPositionColor('AMR', idx)"
                                 @click="openPlayerSelect('AMR', idx)"
                            >
                                {{ getPositionDisplay('AMR', idx) }}
                            </div>
                        </div>
                    </div>
                    
                    <!-- 第3行：边前卫（左/右）+ 中场（中路） -->
                    <div class="flex justify-center items-center w-full gap-1 px-1">
                        <div class="flex justify-center w-10 flex-shrink-0">
                            <div v-if="formationData.lmrm >= 1" v-for="(pos, idx) in getPositions(1, 'ML')" :key="'lmrm-left-'+idx" 
                                 class="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg border-2 border-white/30 cursor-pointer"
                                 :class="getPositionColor('ML', idx)"
                                 @click="openPlayerSelect('ML', idx)"
                            >
                                {{ getPositionDisplay('ML', idx) }}
                            </div>
                        </div>
                        <div class="flex justify-center flex-1">
                            <div class="flex justify-center gap-2" :class="formationData.cm === 1 ? 'w-12' : formationData.cm === 2 ? 'w-28' : 'w-40'">
                                <div v-for="(pos, idx) in getPositions(formationData.cm, 'MC')" :key="'cm-'+idx" 
                                     class="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg border-2 border-white/30 cursor-pointer"
                                     :class="getPositionColor('MC', idx)"
                                     @click="openPlayerSelect('MC', idx)"
                                >
                                    {{ getPositionDisplay('MC', idx) }}
                                </div>
                            </div>
                        </div>
                        <div class="flex justify-center w-10 flex-shrink-0">
                            <div v-if="formationData.lmrm >= 2" v-for="(pos, idx) in getPositions(1, 'MR')" :key="'lmrm-right-'+idx" 
                                 class="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg border-2 border-white/30 cursor-pointer"
                                 :class="getPositionColor('MR', idx)"
                                 @click="openPlayerSelect('MR', idx)"
                            >
                                {{ getPositionDisplay('MR', idx) }}
                            </div>
                        </div>
                    </div>
                    
                    <!-- 第4行：边翼卫（左/右）+ 后腰（中路） -->
                    <div class="flex justify-center items-center w-full gap-1 px-1">
                        <div class="flex justify-center w-10 flex-shrink-0">
                            <div v-if="formationData.fullbackType === '边翼卫'" v-for="(pos, idx) in getPositions(1, 'WBL')" :key="'wb-left-'+idx" 
                                 class="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg border-2 border-white/30 cursor-pointer"
                                 :class="getPositionColor('WBL', idx)"
                                 @click="openPlayerSelect('WBL', idx)"
                            >
                                {{ getPositionDisplay('WBL', idx) }}
                            </div>
                        </div>
                        <div class="flex justify-center flex-1">
                            <div class="flex justify-center gap-2" :class="formationData.cdm === 1 ? 'w-12' : formationData.cdm === 2 ? 'w-28' : 'w-40'">
                                <div v-for="(pos, idx) in getPositions(formationData.cdm, 'DM')" :key="'cdm-'+idx" 
                                     class="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg border-2 border-white/30 cursor-pointer"
                                     :class="getPositionColor('DM', idx)"
                                     @click="openPlayerSelect('DM', idx)"
                                >
                                    {{ getPositionDisplay('DM', idx) }}
                                </div>
                            </div>
                        </div>
                        <div class="flex justify-center w-10 flex-shrink-0">
                            <div v-if="formationData.fullbackType === '边翼卫'" v-for="(pos, idx) in getPositions(1, 'WBR')" :key="'wb-right-'+idx" 
                                 class="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg border-2 border-white/30 cursor-pointer"
                                 :class="getPositionColor('WBR', idx)"
                                 @click="openPlayerSelect('WBR', idx)"
                            >
                                {{ getPositionDisplay('WBR', idx) }}
                            </div>
                        </div>
                    </div>
                    
                    <!-- 第5行：边后卫（左/右）+ 中卫（中路） -->
                    <div class="flex justify-center items-center w-full gap-1 px-1">
                        <div class="flex justify-center w-10 flex-shrink-0">
                            <div v-if="formationData.fullbackType === '边后卫'" v-for="(pos, idx) in getPositions(1, 'DL')" :key="'fb-left-'+idx" 
                                 class="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg border-2 border-white/30 cursor-pointer"
                                 :class="getPositionColor('DL', idx)"
                                 @click="openPlayerSelect('DL', idx)"
                            >
                                {{ getPositionDisplay('DL', idx) }}
                            </div>
                        </div>
                        <div class="flex justify-center flex-1">
                            <div class="flex justify-center gap-2" :class="formationData.cb === 2 ? 'w-28' : 'w-40'">
                                <div v-for="(pos, idx) in getPositions(formationData.cb, 'DC')" :key="'cb-'+idx" 
                                     class="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg border-2 border-white/30 cursor-pointer"
                                     :class="getPositionColor('DC', idx)"
                                     @click="openPlayerSelect('DC', idx)"
                                >
                                    {{ getPositionDisplay('DC', idx) }}
                                </div>
                            </div>
                        </div>
                        <div class="flex justify-center w-10 flex-shrink-0">
                            <div v-if="formationData.fullbackType === '边后卫'" v-for="(pos, idx) in getPositions(1, 'DR')" :key="'fb-right-'+idx" 
                                 class="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg border-2 border-white/30 cursor-pointer"
                                 :class="getPositionColor('DR', idx)"
                                 @click="openPlayerSelect('DR', idx)"
                            >
                                {{ getPositionDisplay('DR', idx) }}
                            </div>
                        </div>
                    </div>
                    
                    <!-- 门将 -->
                    <div class="flex justify-center w-full">
                        <div class="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg border-2 border-white/30 cursor-pointer"
                            :class="getPositionColor('GK', 0)"
                            @click="openPlayerSelect('GK', 0)"
                        >
                            {{ getPositionDisplay('GK', 0) }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- 操作按钮 -->
        <div class="flex gap-3 mt-4">
            <button 
                @click="resetFormation"
                class="flex-1 py-3 bg-blue-500 text-white rounded-xl font-bold active:scale-95 transition"
            >
                重选阵型
            </button>
            <button 
                v-if="!isBattleMode"
                @click="restartGame"
                class="flex-1 py-3 bg-green-500 text-white rounded-xl font-bold active:scale-95 transition"
            >
                首页
            </button>
            <div v-else class="flex-1 flex flex-col items-center">
                <p class="text-[13px] text-orange-500 font-bold mb-1 text-center">⚠️提交有延迟请勿重复点击</p>
                <button 
                    @click="submitTeam"
                    :disabled="isSubmitting"
                    class="w-full py-3 rounded-xl font-bold active:scale-95 transition"
                    :class="isSubmitting ? 'bg-gray-400 text-gray-600 cursor-not-allowed' : 'bg-purple-500 text-white'"
                >
                    {{ isSubmitting ? '提交中...' : '提交' }}
                </button>
            </div>
        </div>
    </div>

      <!-- ===== 选秀结束 ===== -->
      <div v-else-if="isDraftFinished && !showTactic && !showMentality && !showFormation && !showFormationResult" class="text-center py-12">
        <div class="text-6xl mb-4">完成</div>
        <h3 class="text-xl font-bold text-gray-700"></h3>
        <p class="text-gray-500 mt-2">共 {{ myTeam.length }} 名球员</p>
        <button 
          @click="showTactic = true"
          class="mt-6 px-6 py-3 bg-blue-500 text-white rounded-2xl font-bold shadow-lg active:scale-95 transition"
        >
          📋 阵型
        </button>
      </div>
    </div>

    <!-- ===== 球员选择弹出框 ===== -->
    <div v-if="showPlayerSelect" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="closePlayerSelect">
        <div class="bg-white rounded-2xl p-4 max-w-sm w-full mx-4 max-h-[70vh] overflow-y-auto">
            <h4 class="font-bold text-center text-gray-800 mb-3"> {{ currentPositionName }} 位置适应性</h4>
            <div class="space-y-2">
                <div 
                    v-for="player in availablePlayersForPosition" 
                    :key="player.id"
                    @click="assignPlayerToPosition(player)"
                    class="p-2 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition flex items-center justify-between"
                    :class="{ 'border-2 border-blue-400': isPlayerOnField(player.id) && !isCurrentPosition(player.id) }"
                >
                    <div>
                        <span class="font-medium text-sm">#{{ getPlayerIndex(player) }} {{ player.name }}</span>
                        <span class="text-xs text-gray-400 ml-2">{{ player.position }}</span>
                        <span v-if="isPlayerOnField(player.id) && !isCurrentPosition(player.id)" class="text-xs text-blue-600 font-bold ml-1">(已上阵)</span>
                    </div>
                    <span class="text-xs font-bold" :class="getValueColor(getPlayerPositionValue(player, currentPositionCode))">
                        {{ getPlayerPositionValue(player, currentPositionCode) }}
                    </span>
                </div>
                <div v-if="availablePlayersForPosition.length === 0" class="text-center text-gray-400 py-4">
                    没有合适的球员
                </div>
            </div>
            <button @click="closePlayerSelect" class="w-full mt-3 py-2 bg-gray-200 rounded-xl font-bold">关闭</button>
        </div>
    </div>

    <!-- ===== 球员详情弹出框（八维图 + 位置热力图） ===== -->
    <div v-if="showPlayerDetail" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="closePlayerDetail">
        <div class="bg-white rounded-2xl p-4 max-w-sm w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div class="flex items-center justify-between mb-3">
                <h4 class="font-bold text-gray-800">{{ detailPlayer?.name || '球员' }}</h4>
                <span class="text-xs text-gray-400">{{ detailPlayer?.position || '' }}</span>
            </div>
            
            <!-- ===== 雷达图标签页 ===== -->
            <div v-if="detailTab === 'radar'" class="w-full" style="height: 300px; position: relative;">
                <Radar 
                    :data="detailRadarData" 
                    :options="detailRadarOptions"
                    v-if="detailRadarData && detailRadarData.labels && detailRadarData.labels.length > 0"
                />
                <div v-else class="flex items-center justify-center h-full text-gray-400 text-sm">
                    暂无能力数据
                </div>
            </div>
            
            <!-- ===== 位置热图标签页 ===== -->
            <div v-if="detailTab === 'positions'" class="w-full">
                <p class="text-xs text-gray-400 text-center mb-2">位置适应性</p>
                <div class="relative w-full aspect-[3/4] max-h-[380px] bg-gradient-to-b from-green-600 to-green-800 rounded-xl overflow-hidden mx-auto">
                    <div class="absolute inset-0 flex flex-col items-center justify-between py-2 px-1">
                        
                        <!-- 第1行：中锋（中路） -->
                        <div class="flex justify-center w-full">
                            <div class="flex justify-center w-12">
                                <div v-for="(pos, idx) in getPositions(1, 'ST')" :key="'st-'+idx" 
                                     class="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg border-2 border-white/30"
                                     :class="getPositionHeatColor('ST')"
                                >
                                    ST
                                </div>
                            </div>
                        </div>
                        
                        <!-- 第2行：边锋（左/右）+ 前腰（中路） -->
                        <div class="flex justify-center items-center w-full gap-1 px-1">
                            <div class="flex justify-center w-10 flex-shrink-0">
                                <div v-for="(pos, idx) in getPositions(1, 'AML')" :key="'aml-'+idx" 
                                     class="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg border-2 border-white/30"
                                     :class="getPositionHeatColor('AML')"
                                >
                                    AML
                                </div>
                            </div>
                            <div class="flex justify-center flex-1">
                                <div class="flex justify-center w-12">
                                    <div v-for="(pos, idx) in getPositions(1, 'AMC')" :key="'amc-'+idx" 
                                         class="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg border-2 border-white/30"
                                         :class="getPositionHeatColor('AMC')"
                                    >
                                        AMC
                                    </div>
                                </div>
                            </div>
                            <div class="flex justify-center w-10 flex-shrink-0">
                                <div v-for="(pos, idx) in getPositions(1, 'AMR')" :key="'amr-'+idx" 
                                     class="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg border-2 border-white/30"
                                     :class="getPositionHeatColor('AMR')"
                                >
                                    AMR
                                </div>
                            </div>
                        </div>
                        
                        <!-- 第3行：边前卫（左/右）+ 中场（中路） -->
                        <div class="flex justify-center items-center w-full gap-1 px-1">
                            <div class="flex justify-center w-10 flex-shrink-0">
                                <div v-for="(pos, idx) in getPositions(1, 'ML')" :key="'ml-'+idx" 
                                     class="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg border-2 border-white/30"
                                     :class="getPositionHeatColor('ML')"
                                >
                                    ML
                                </div>
                            </div>
                            <div class="flex justify-center flex-1">
                                <div class="flex justify-center w-12">
                                    <div v-for="(pos, idx) in getPositions(1, 'MC')" :key="'mc-'+idx" 
                                         class="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg border-2 border-white/30"
                                         :class="getPositionHeatColor('MC')"
                                    >
                                        MC
                                    </div>
                                </div>
                            </div>
                            <div class="flex justify-center w-10 flex-shrink-0">
                                <div v-for="(pos, idx) in getPositions(1, 'MR')" :key="'mr-'+idx" 
                                     class="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg border-2 border-white/30"
                                     :class="getPositionHeatColor('MR')"
                                >
                                    MR
                                </div>
                            </div>
                        </div>
                        
                        <!-- 第4行：边翼卫（左/右）+ 后腰（中路） -->
                        <div class="flex justify-center items-center w-full gap-1 px-1">
                            <div class="flex justify-center w-10 flex-shrink-0">
                                <div v-for="(pos, idx) in getPositions(1, 'WBL')" :key="'wbl-'+idx" 
                                     class="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg border-2 border-white/30"
                                     :class="getPositionHeatColor('WBL')"
                                >
                                    WBL
                                </div>
                            </div>
                            <div class="flex justify-center flex-1">
                                <div class="flex justify-center w-12">
                                    <div v-for="(pos, idx) in getPositions(1, 'DM')" :key="'dm-'+idx" 
                                         class="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg border-2 border-white/30"
                                         :class="getPositionHeatColor('DM')"
                                    >
                                        DM
                                    </div>
                                </div>
                            </div>
                            <div class="flex justify-center w-10 flex-shrink-0">
                                <div v-for="(pos, idx) in getPositions(1, 'WBR')" :key="'wbr-'+idx" 
                                     class="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg border-2 border-white/30"
                                     :class="getPositionHeatColor('WBR')"
                                >
                                    WBR
                                </div>
                            </div>
                        </div>
                        
                        <!-- 第5行：边后卫（左/右）+ 中卫（中路） -->
                        <div class="flex justify-center items-center w-full gap-1 px-1">
                            <div class="flex justify-center w-10 flex-shrink-0">
                                <div v-for="(pos, idx) in getPositions(1, 'DL')" :key="'dl-'+idx" 
                                     class="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg border-2 border-white/30"
                                     :class="getPositionHeatColor('DL')"
                                >
                                    DL
                                </div>
                            </div>
                            <div class="flex justify-center flex-1">
                                <div class="flex justify-center w-12">
                                    <div v-for="(pos, idx) in getPositions(1, 'DC')" :key="'dc-'+idx" 
                                         class="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg border-2 border-white/30"
                                         :class="getPositionHeatColor('DC')"
                                    >
                                        DC
                                    </div>
                                </div>
                            </div>
                            <div class="flex justify-center w-10 flex-shrink-0">
                                <div v-for="(pos, idx) in getPositions(1, 'DR')" :key="'dr-'+idx" 
                                     class="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg border-2 border-white/30"
                                     :class="getPositionHeatColor('DR')"
                                >
                                    DR
                                </div>
                            </div>
                        </div>
                        
                        <!-- 门将 -->
                        <div class="flex justify-center w-full">
                            <div class="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg border-2 border-white/30"
                                 :class="getPositionHeatColor('GK')"
                            >
                                GK
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 图例 -->
                <div class="flex items-center justify-center gap-4 mt-3 text-xs">
                    <span class="text-gray-400">← 低</span>
                    <div class="flex h-3 rounded-full overflow-hidden">
                        <div class="w-5 bg-gray-400"></div>
                        <div class="w-5 bg-red-400"></div>
                        <div class="w-5 bg-orange-400"></div>
                        <div class="w-5 bg-yellow-400"></div>
                        <div class="w-5 bg-green-600"></div>
                        <div class="w-5 bg-green-400"></div>
                    </div>
                    <span class="text-gray-400">高 →</span>
                </div>
            </div>
            
            <!-- ===== 标签页切换（放在图下方，关闭按钮上方） ===== -->
            <div class="flex border-b border-gray-200 mb-3 mt-3">
                <button 
                    @click="detailTab = 'radar'"
                    class="flex-1 py-2 text-sm font-medium transition-all"
                    :class="detailTab === 'radar' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400 hover:text-gray-600'"
                >
                    能力
                </button>
                <button 
                    @click="detailTab = 'positions'"
                    class="flex-1 py-2 text-sm font-medium transition-all"
                    :class="detailTab === 'positions' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400 hover:text-gray-600'"
                >
                    位置
                </button>
            </div>
            
            <button @click="closePlayerDetail" class="w-full mt-3 py-2 bg-gray-200 rounded-xl font-bold">关闭</button>
        </div>
    </div>

    <!-- ===== 战术风格选择器（重选） ===== -->
    <div v-if="showTacticSelector" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="showTacticSelector = false">
        <div class="bg-white rounded-2xl p-4 max-w-sm w-full mx-4 max-h-[70vh] overflow-y-auto">
            <h3 class="text-lg font-bold text-center text-gray-800 mb-2">📋 选择战术风格</h3>
            <p class="text-xs text-center text-gray-400 mb-4">点击选择新的战术风格</p>
            <div class="space-y-2 max-h-[420px] overflow-y-auto">
                <div 
                    v-for="tactic in tactics" 
                    :key="tactic.id"
                    @click="selectedTactic = tactic.id; showTacticSelector = false"
                    class="p-3 rounded-xl border-2 cursor-pointer transition-all active:scale-[0.98]"
                    :class="selectedTactic === tactic.id ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'"
                >
                    <div class="flex items-center justify-between">
                        <span class="font-bold text-gray-800">{{ tactic.name }}</span>
                        <span v-if="selectedTactic === tactic.id" class="text-green-500 text-lg">✅</span>
                    </div>
                    <p class="text-xs text-gray-500 mt-1">{{ tactic.description }}</p>
                </div>
            </div>
            <button @click="showTacticSelector = false" class="w-full mt-3 py-2 bg-gray-200 rounded-xl font-bold">关闭</button>
        </div>
    </div>

    <!-- ===== 心态选择器（重选） ===== -->
    <div v-if="showMentalitySelector" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="showMentalitySelector = false">
        <div class="bg-white rounded-2xl p-4 max-w-sm w-full mx-4 max-h-[70vh] overflow-y-auto">
            <h3 class="text-lg font-bold text-center text-gray-800 mb-2">🎯 选择比赛心态</h3>
            <p class="text-xs text-center text-gray-400 mb-4">点击选择新的比赛心态</p>
            <div class="space-y-2">
                <div 
                    v-for="mentality in mentalities" 
                    :key="mentality.id"
                    @click="selectedMentality = mentality.id; showMentalitySelector = false"
                    class="p-3 rounded-xl border-2 cursor-pointer transition-all active:scale-[0.98]"
                    :class="selectedMentality === mentality.id ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'"
                >
                    <div class="flex items-center justify-between">
                        <span class="font-bold text-gray-800">{{ mentality.name }}</span>
                        <span v-if="selectedMentality === mentality.id" class="text-green-500 text-lg">✅</span>
                    </div>
                    <p class="text-xs text-gray-500 mt-1">{{ mentality.description }}</p>
                </div>
            </div>
            <button @click="showMentalitySelector = false" class="w-full mt-3 py-2 bg-gray-200 rounded-xl font-bold">关闭</button>
        </div>
    </div>

    <!-- ===== 底部：我的球队 ===== -->
    <div v-if="!showHome" 
      ref="teamSection"
      class="bg-white/90 backdrop-blur p-3 shadow-inner flex-shrink-0 transition-all duration-500 flex flex-col"
      :class="[
        myTeam.length === totalRounds ? 'border-t-4 border-green-500' : '',
        showTeam ? 'h-[45vh]' : 'h-auto'
      ]"
    >
      <div 
        @click="showTeam = !showTeam"
        class="flex items-center justify-between cursor-pointer active:scale-95 transition flex-shrink-0"
      >
        <div class="flex items-center gap-2">
          <span class="text-xl">🏠</span>
          <span class="font-medium text-gray-700">我的球队</span>
          <span class="bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{{ myTeam.length }}</span>
        </div>
        <!-- ===== 位置统计 ===== -->
        <div class="flex items-center gap-2 text-xs">
          <span class="flex items-center gap-0.5">
            <span class="text-blue-600 font-bold">{{ getPositionCount('defender') }}</span>
            <span class="text-gray-400">后卫</span>
          </span>
          <span class="text-gray-300">|</span>
          <span class="flex items-center gap-0.5">
            <span class="text-yellow-600 font-bold">{{ getPositionCount('midfielder') }}</span>
            <span class="text-gray-400">中场</span>
          </span>
          <span class="text-gray-300">|</span>
          <span class="flex items-center gap-0.5">
            <span class="text-red-600 font-bold">{{ getPositionCount('forward') }}</span>
            <span class="text-gray-400">前锋</span>
          </span>
        </div>
      </div>

      <!-- 球队名单 -->
      <div 
        v-if="showTeam && myTeam.length > 0" 
        class="mt-2 flex-1 overflow-y-auto space-y-1 min-h-0"
      >
        <div 
          v-for="(p, idx) in myTeam" 
          :key="idx" 
          class="flex items-center gap-2 p-2 bg-gray-50 rounded-xl text-sm cursor-pointer hover:bg-gray-100 transition"
          @click="openPlayerDetail(p)"
        >
          <span class="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">{{ idx + 1 }}</span>
          <span class="font-medium">{{ p.name }}</span>
          <span class="text-xs text-gray-400 flex-shrink-0">{{ p.position }}</span>
          <span v-if="isPlayerOnField(p.id)" class="text-xs text-green-600 font-bold ml-auto flex-shrink-0">上阵</span>
        </div>
      </div>
      <div v-else-if="showTeam && myTeam.length === 0" class="mt-2 text-sm text-gray-400 text-center py-4 flex-1">
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

import fieldPlayersData from './data/fieldPlayers.json';
import gkPlayersData from './data/gkPlayers.json';
import usersData from './data/users.json';

import emailjs from '@emailjs/browser';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

// ==================== 首页/对战状态 ====================
const showHome = ref(true);
const showLogin = ref(false);
const loginUsername = ref('');
const loginError = ref('');
const isBattleMode = ref(false);
const currentUser = ref('');

// ==================== 门将相关的游戏状态 ====================
const gkPool = ref([]);
const isGKRound = ref(false);  // 当前是否处于门将选择轮
const gkRounds = 2;  // 门将选择轮数
const gkSelectedCount = ref(0);  // 已选门将数
const gkCandidates = ref([]);  // 当前门将候选
const gkSelectedId = ref(null);

// ==================== 八维维度 ====================
const abilityKeys = ['防守', '身体', '速度', '创造', '进攻', '技术', '制空', '精神'];
const gkAbilityKeys = ['拦截射门', '身体', '速度', '精神', '指挥防守', '意外性', '制空', '大脚'];

const colors = ['#E60000', '#36A2EB', '#E8692E', '#4BC0C0', '#9966FF'];
const PLAYER_DATA = fieldPlayersData;

// ==================== 提交状态 ====================
const isSubmitting = ref(false);

// ==================== 雷达图配置 ====================
const radarOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    r: {
      min: 2,
      max: 18,
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

// ==================== 战术/心态数据 ====================
const tactics = [
  { id: 1, name: '控制球权', description: '旨在控制比赛节奏，耐心等待对方的破绽' },
  { id: 2, name: '高位压迫', description: '立即回抢球权，高强度的跑动' },
  { id: 3, name: '密集短传', description: '压倒性地控球，不停歇地紧逼，耐心等待对方的破绽' },
  { id: 4, name: '垂直密集短传', description: '压倒性地控球，不停歇地紧逼，更注重向前传导而不是两边传导' },
  { id: 5, name: '双翼齐飞', description: '以高质量传中冲击禁区，侧重于两翼进攻' },
  { id: 6, name: '长传冲吊', description: '快速转换，直传打法' },
  { id: 7, name: '灵活防反', description: '承受对方进攻压力，更自由和灵活的防守反击' },
  { id: 8, name: '快速防反', description: '承受对方进攻压力，快速并讲究队形的防守反击' },
  { id: 9, name: '链式防守', description: '试图完全扼杀对方的进攻威胁，极度严谨的防守策略' },
  { id: 10, name: '摆大巴', description: '靠后而严谨的防守队形，限制后场空间' }
];
const mentalities = [
  { id: 1, name: '全力防守', description: '这种心态的目的是以压缩空间，放慢节奏，保持控球，尽可能消耗时间的方式折磨对手并降低风险。不同于防守心态的是，球队反击时不求得分，只求不丢球。因为控球和消磨是首要目的，更多球员会保持在球后方。' },
  { id: 2, name: '防守', description: '如果预期会输掉比赛，并且防线将承受巨大压力，推荐采用该种心态。球队会以防守为主，通过限制本方半场的空间，破坏对手的进攻节奏。继而通过快速的传球在反击中寻找破门机会。' },
  { id: 3, name: '小心谨慎', description: '如果不能在比赛中保持控球，但能在反击中制造威胁，推荐采取该种心态。球队会保证防守时的站位，并在空当出现时，快速将球传给前场球员。这种战术的关键在于转移球的速度够快，才能够有效利用对手边后卫及边锋身后的空当。在机会不好的时候，球员大多会留在本方半场参与防守。' },
  { id: 4, name: '攻守平衡', description: '这毫无疑问是所有比赛心态中最重要的。通过仔细权衡得失，这将使主教练评估比赛和球队运行的状况，切换到更具针对性的战术的时机。这是大多数比赛中的理想的起始心态。通过仔细观察比赛后，主教练可以选择改成更具侵略性或者更谨慎的心态。如果情况良好，也可以保持原有心态。' },
  { id: 5, name: '积极进取', description: '如果对手实力较弱，但有一定的反击能力，推荐采取该种心态。在该种心态下，球队会通过耐心的传递制造空当并寻求将球打入禁区的机会。在保证防守的前提下，边后卫会不时下底包抄，并且中场球员也会前插，但在机会不好时，他们会留在防守位置上力争保持控球。' },
  { id: 6, name: '进攻', description: '这种比赛心态适用于球队被看好，并且在对手半场保持住球权的比赛。球队会在进攻中利用快速的节奏和更多的直传寻求对手后场的空当。如果球队在进攻中容易丢球，则需要改用多多倒球的战术保持球权。这一心态的重点在于让球员会抓住可能的机会找空当前插，并给他们施展才华的自由。' },
  { id: 7, name: '全力进攻', description: '这种比赛心态适用于球队孤注一掷需要取得进球时。球队会保持极高的节奏和极为直接的传递，以求持续向对手后场试压。防守中利用夺回球权的机会穿透防线。在进攻时，则寄希望于利用压到前场的人数优势找到空当破门得分。' }
];

// ==================== 阵型位置映射 ====================
const positionAbbrMap = {
    'GK': 'GK',
    'ST': 'ST',
    'AML': 'AML',
    'AMC': 'AMC',
    'AMR': 'AMR',
    'ML': 'ML',
    'MC': 'MC',
    'MR': 'MR',
    'WBL': 'WBL',
    'DM': 'DM',
    'WBR': 'WBR',
    'DL': 'DL',
    'DC': 'DC',
    'DR': 'DR'
};

const positionDisplayMap = {
    'GK': '门将',
    'ST': '中锋',
    'AML': '左边锋',
    'AMC': '前腰',
    'AMR': '右边锋',
    'ML': '左前卫',
    'MC': '中场',
    'MR': '右前卫',
    'WBL': '左边翼卫',
    'DM': '后腰',
    'WBR': '右边翼卫',
    'DL': '左后卫',
    'DC': '中卫',
    'DR': '右后卫'
};

// ==================== 当前选中位置名称 ====================
const currentPositionName = computed(() => {
    return positionDisplayMap[currentPositionCode.value] || currentPositionCode.value || '位置';
});

// ==================== 游戏状态 ====================
const totalRounds = 16;
const currentRound = ref(1);
const availablePool = ref([]);
const myTeam = ref([]);
const currentCandidates = ref([]);
const selectedId = ref(null);
const isSelecting = ref(false);
const showTeam = ref(false);
const isDraftFinished = ref(false);
const showTactic = ref(false);
const showMentality = ref(false);
const showFormation = ref(false);
const showFormationResult = ref(false);
const selectedTactic = ref(null);
const selectedMentality = ref(null);

// ==================== 阵型状态 ====================
const formationStep = ref(0);
const formationData = ref({
  cb: 2,
  fullbackType: '边后卫',
  wingbackCount: 2,
  cdm: 0,
  lmrm: 0,
  cm: 0,
  cam: 0,
  hasWingers: 0,
  st: 1
});

// ==================== 球员位置分配 ====================
const positionAssignments = ref({});
const showPlayerSelect = ref(false);
const currentPositionCode = ref('');
const currentPositionIdx = ref(0);

const showError = ref(false);
const errorMessage = ref('');

// ==================== 计算属性 ====================
const currentFormationTotal = computed(() => {
  let total = 0;
  total += formationData.value.cb || 0;
  total += formationData.value.fullbackType !== '无' ? 2 : 0;
  total += formationData.value.cdm || 0;
  total += formationData.value.lmrm || 0;
  total += formationData.value.cm || 0;
  total += formationData.value.cam || 0;
  total += formationData.value.hasWingers || 0;
  total += formationData.value.st || 0;
  return total;
});

const canNext = computed(() => {
  if (formationStep.value === 0 && formationData.value.cb === null) return false;
  if (formationStep.value === 1 && !formationData.value.fullbackType) return false;
  if (formationStep.value === 2 && formationData.value.cdm === null) return false;
  if (formationStep.value === 3 && formationData.value.lmrm === null) return false;
  if (formationStep.value === 4 && formationData.value.cm === null) return false;
  if (formationStep.value === 5 && formationData.value.cam === null) return false;
  if (formationStep.value === 6 && formationData.value.hasWingers === null) return false;
  if (formationStep.value === 7 && formationData.value.st === null) return false;
  
  if (currentFormationTotal.value + 1 > 11) {
    showError.value = true;
    errorMessage.value = `当前阵容 ${currentFormationTotal.value + 1} 人，不能超过11人`;
    return false;
  }
  showError.value = false;
  return true;
});

const canFinish = computed(() => {
  if (formationData.value.st === null) return false;
  if (currentFormationTotal.value + 1 !== 11) {
    showError.value = true;
    errorMessage.value = `当前阵容 ${currentFormationTotal.value + 1} 人，需要正好11人`;
    return false;
  }
  showError.value = false;
  return true;
});

// ==================== 位置颜色函数 ====================
const getPositionColor = (positionCode, idx) => {
    const key = `${positionCode}_${idx}`;
    const assignment = positionAssignments.value[key];
    if (!assignment) return 'bg-gray-500';
    
    const player = myTeam.value.find(p => p.id === assignment.playerId);
    if (!player) return 'bg-gray-500';
    
    // 直接从 detailed_pos 读取
    if (!player.detailed_pos) return 'bg-gray-500';
    const value = player.detailed_pos[positionCode] || 0;
    
    if (value >= 18) return 'bg-green-400';
    if (value >= 15) return 'bg-green-600';
    if (value >= 12) return 'bg-yellow-400';
    if (value >= 9) return 'bg-orange-400';
    if (value >= 4) return 'bg-red-400';
    return 'bg-gray-500';
};

const getValueColor = (value) => {
  if (value >= 18) return 'text-green-400';
  if (value >= 15) return 'text-green-600';
  if (value >= 12) return 'text-yellow-500';
  if (value >= 9) return 'text-orange-500';
  return 'text-red-400';
};

// ==================== 阵型位置显示 ====================
const getPositionDisplay = (positionCode, idx) => {
  const key = `${positionCode}_${idx}`;
  const assignment = positionAssignments.value[key];
  if (!assignment) return positionAbbrMap[positionCode] || positionCode;
  
  const player = myTeam.value.find(p => p.id === assignment.playerId);
  if (!player) return positionAbbrMap[positionCode] || positionCode;
  
  const playerIdx = myTeam.value.indexOf(player);
  // 只显示球员编号，不显示姓名首字母
  return `${playerIdx + 1}`;
};

// ==================== 获取球员在队伍中的序号 ====================
const getPlayerIndex = (player) => {
    if (!player || !myTeam.value) return 0;
    const index = myTeam.value.indexOf(player);
    return index >= 0 ? index + 1 : 0;
};

// ==================== 获取球员在指定位置的适应性值 ====================
const getPlayerPositionValue = (player, positionCode) => {
    // 优先使用 detailed_pos
    if (player.detailed_pos && player.detailed_pos[positionCode] !== undefined) {
        return player.detailed_pos[positionCode];
    }
    
    // 如果没有 detailed_pos，使用映射表作为备用
    const positionFitMap = {
        'GK': { GK: 20, ST: 2, AML: 2, AMC: 2, AMR: 2, ML: 2, MC: 2, MR: 2, WBL: 2, DM: 2, WBR: 2, DL: 2, DC: 2, DR: 2 },
        'ST': { ST: 18, AML: 12, AMC: 14, AMR: 12, ML: 6, MC: 10, MR: 6, WBL: 4, DM: 4, WBR: 4, DL: 4, DC: 4, DR: 4 },
        'CF': { ST: 16, AML: 10, AMC: 12, AMR: 10, ML: 6, MC: 8, MR: 6, WBL: 4, DM: 4, WBR: 4, DL: 4, DC: 4, DR: 4 },
        'LW': { ST: 10, AML: 18, AMC: 12, AMR: 14, ML: 12, MC: 8, MR: 10, WBL: 6, DM: 4, WBR: 6, DL: 4, DC: 4, DR: 4 },
        'RW': { ST: 10, AML: 14, AMC: 12, AMR: 18, ML: 10, MC: 8, MR: 12, WBL: 6, DM: 4, WBR: 6, DL: 4, DC: 4, DR: 4 },
        'AM': { ST: 12, AML: 14, AMC: 18, AMR: 14, ML: 10, MC: 12, MR: 10, WBL: 6, DM: 6, WBR: 6, DL: 4, DC: 4, DR: 4 },
        'CAM': { ST: 12, AML: 14, AMC: 18, AMR: 14, ML: 10, MC: 12, MR: 10, WBL: 6, DM: 6, WBR: 6, DL: 4, DC: 4, DR: 4 },
        'CM': { ST: 8, AML: 8, AMC: 12, AMR: 8, ML: 10, MC: 18, MR: 10, WBL: 6, DM: 10, WBR: 6, DL: 6, DC: 6, DR: 6 },
        'MC': { ST: 8, AML: 8, AMC: 12, AMR: 8, ML: 10, MC: 18, MR: 10, WBL: 6, DM: 10, WBR: 6, DL: 6, DC: 6, DR: 6 },
        'CDM': { ST: 4, AML: 4, AMC: 8, AMR: 4, ML: 6, MC: 12, MR: 6, WBL: 8, DM: 18, WBR: 8, DL: 6, DC: 8, DR: 6 },
        'LB': { ST: 4, AML: 8, AMC: 6, AMR: 8, ML: 10, MC: 8, MR: 10, WBL: 14, DM: 6, WBR: 10, DL: 18, DC: 10, DR: 10 },
        'RB': { ST: 4, AML: 8, AMC: 6, AMR: 8, ML: 10, MC: 8, MR: 10, WBL: 10, DM: 6, WBR: 14, DL: 10, DC: 10, DR: 18 },
        'CB': { ST: 4, AML: 4, AMC: 4, AMR: 4, ML: 4, MC: 6, MR: 4, WBL: 6, DM: 8, WBR: 6, DL: 10, DC: 18, DR: 10 }
    };
    // 删除了重复的 'GK' 条目
    
    const pos = player.position || '';
    const fit = positionFitMap[pos];
    if (!fit) return 0;
    return fit[positionCode] || 0;
};

// ==================== 可用的球员(下拉菜单) ====================
const availablePlayersForPosition = computed(() => {
    const positionCode = currentPositionCode.value;
    const assignedPlayerIds = new Set();
    
    // 收集已被其他位置占用的球员ID（当前选中位置除外）
    for (const [key, val] of Object.entries(positionAssignments.value)) {
        const [pos, idx] = key.split('_');
        if (pos === positionCode && parseInt(idx) === currentPositionIdx.value) {
            continue;
        }
        assignedPlayerIds.add(val.playerId);
    }
    
    // 过滤出可用的球员（不排除已被占用的）
    return myTeam.value.filter(p => {
        // 检查 detailed_pos
        if (!p.detailed_pos) return false;
        
        const value = p.detailed_pos[positionCode];
        
        // 值 >= 4 才显示
        return value !== undefined && value >= 4;
    });
});

// ==================== 球员选择弹出框 ====================
const openPlayerSelect = (positionCode, idx) => {
  currentPositionCode.value = positionCode;
  currentPositionIdx.value = idx;
  showPlayerSelect.value = true;
};

const closePlayerSelect = () => {
  showPlayerSelect.value = false;
};

const assignPlayerToPosition = (player) => {
  const key = `${currentPositionCode.value}_${currentPositionIdx.value}`;
  
  // 检查该球员是否已被其他位置占用
  let oldKey = null;
  for (const [k, val] of Object.entries(positionAssignments.value)) {
    if (val.playerId === player.id && k !== key) {
      oldKey = k;
      break;
    }
  }
  
  // 如果球员已被其他位置占用，从原位置移除
  if (oldKey) {
    delete positionAssignments.value[oldKey];
  }
  
  // 分配到新位置
  positionAssignments.value[key] = {
    playerId: player.id,
    positionCode: currentPositionCode.value
  };
  
  closePlayerSelect();
};

// ==================== 判断球员是否已上阵 ====================
const isPlayerOnField = (playerId) => {
  for (const [key, val] of Object.entries(positionAssignments.value)) {
    if (val.playerId === playerId) return true;
  }
  return false;
};

// ==================== 判断球员是否在当前编辑位置 ====================
const isCurrentPosition = (playerId) => {
    const key = `${currentPositionCode.value}_${currentPositionIdx.value}`;
    const assignment = positionAssignments.value[key];
    if (!assignment) return false;
    return assignment.playerId === playerId;
};

// ==================== 详情雷达图配置 ====================
const detailRadarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        r: {
            min: 2,
            max: 18,
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
            radius: 2,
            hoverRadius: 4
        }
    }
};

// ==================== 球员详情弹出框 ====================
const showPlayerDetail = ref(false);
const detailPlayer = ref(null);

// ==================== 详情雷达图数据 ====================
const detailRadarData = computed(() => {
    if (!detailPlayer.value) {
        return { labels: [], datasets: [] };
    }
    
    // 判断是否为门将（根据 position 字段或 isGK 标记）
    const isGK = detailPlayer.value.position === 'GK' || detailPlayer.value.isGK === true;
    
    // 选择对应的能力键和显示标签
    let labels, displayLabels;
    if (isGK) {
        labels = gkAbilityKeys;
        // 将 '制空2' 映射显示为 '制空'
        displayLabels = labels.map(key => key === '制空2' ? '制空' : key);
    } else {
        labels = abilityKeys;
        displayLabels = labels;
    }
    
    // 获取能力数据
    const data = labels.map(key => detailPlayer.value.abilities?.[key] || 0);
    
    return {
        labels: displayLabels,
        datasets: [{
            label: detailPlayer.value.name || '球员',
            data: data,
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: '#36A2EB',
            borderWidth: 2,
            pointBackgroundColor: '#36A2EB',
            pointRadius: 3
        }]
    };
});


// ==================== 详情颜色辅助 ====================
const getDetailValueColor = (value) => {
    if (value >= 16) return 'text-green-600';
    if (value >= 13) return 'text-green-400';
    if (value >= 10) return 'text-yellow-500';
    if (value >= 7) return 'text-orange-500';
    return 'text-red-500';
};

// ==================== 球员详情弹出框控制 ====================
const openPlayerDetail = (player) => {
    detailPlayer.value = player;
    detailTab.value = 'radar';  // 默认显示雷达图
    showPlayerDetail.value = true;
};

// ==================== 详情标签页 ====================
const detailTab = ref('radar');  // 'radar' 或 'positions'

// ==================== 位置热图颜色 ====================
const getPositionHeatColor = (positionCode) => {
    const player = detailPlayer.value;
    if (!player || !player.detailed_pos) return 'bg-gray-200 text-gray-400';
    
    const value = player.detailed_pos[positionCode];
    if (value === undefined || value < 4) return 'bg-gray-200 text-gray-400';
    if (value >= 18) return 'bg-green-400 text-white';
    if (value >= 15) return 'bg-green-600 text-white';
    if (value >= 12) return 'bg-yellow-400 text-white';
    if (value >= 9) return 'bg-orange-400 text-white';
    if (value >= 4) return 'bg-red-400 text-white';
    return 'bg-gray-200 text-gray-400';
};

// ==================== 位置热图数值 ====================
const getPositionHeatValue = (positionCode) => {
    const player = detailPlayer.value;
    if (!player || !player.detailed_pos) return '-';
    
    const value = player.detailed_pos[positionCode];
    if (value === undefined) return '-';
    return value;
};

const closePlayerDetail = () => {
    showPlayerDetail.value = false;
    detailPlayer.value = null;
};

// ==================== 解析 ability 字符串 ====================
const parseAbilityObject = (abilityStr) => {
    const result = {};
    if (!abilityStr) return result;
    
    if (typeof abilityStr === 'string' && abilityStr.includes(',')) {
        const pairs = abilityStr.split(',').map(s => s.trim());
        pairs.forEach(pair => {
            const parts = pair.split(' ');
            const key = parts.slice(0, -1).join(' ');
            const value = parseFloat(parts[parts.length - 1]);
            if (key && !isNaN(value)) {
                result[key] = value;
            }
        });
    } else if (typeof abilityStr === 'object') {
        Object.keys(abilityStr).forEach(key => {
            result[key] = abilityStr[key];
        });
    }
    return result;
};

// ==================== 重选选择器状态 ====================
const showTacticSelector = ref(false);
const showMentalitySelector = ref(false);

// ==================== 战术风格对应的推荐心态和阵型 ====================
const tacticRecommendations = {
  '控制球权': {
    mentality: '攻守平衡',
    formations: [
      { name: '4-2-3-1 后腰', data: { cb: 2, fullbackType: '边后卫', cdm: 2, lmrm: 0, cm: 0, cam: 1, hasWingers: 2, st: 1 } },
      { name: '4-3-3', data: { cb: 2, fullbackType: '边后卫', cdm: 1, lmrm: 0, cm: 2, cam: 0, hasWingers: 2, st: 1 } },
      { name: '5-2-3', data: { cb: 3, fullbackType: '边翼卫', cdm: 2, lmrm: 0, cm: 0, cam: 0, hasWingers: 2, st: 1 } }
    ]
  },
  '高位压迫': {
    mentality: '积极进取',
    formations: [
      { name: '4-2-3-1 后腰', data: { cb: 2, fullbackType: '边后卫', cdm: 2, lmrm: 0, cm: 0, cam: 1, hasWingers: 2, st: 1 } },
      { name: '4-3-3', data: { cb: 2, fullbackType: '边后卫', cdm: 1, lmrm: 0, cm: 2, cam: 0, hasWingers: 2, st: 1 } },
      { name: '4-2-4 后腰', data: { cb: 2, fullbackType: '边后卫', cdm: 2, lmrm: 0, cm: 0, cam: 0, hasWingers: 2, st: 2 } }
    ]
  },
  '密集短传': {
    mentality: '积极进取',
    formations: [
      { name: '4-2-3-1 后腰', data: { cb: 2, fullbackType: '边后卫', cdm: 2, lmrm: 0, cm: 0, cam: 1, hasWingers: 2, st: 1 } },
      { name: '4-3-3', data: { cb: 2, fullbackType: '边后卫', cdm: 1, lmrm: 0, cm: 2, cam: 0, hasWingers: 2, st: 1 } },
      { name: '5-2-3', data: { cb: 3, fullbackType: '边翼卫', cdm: 2, lmrm: 0, cm: 0, cam: 0, hasWingers: 2, st: 1 } }
    ]
  },
  '垂直密集短传': {
    mentality: '攻守平衡',
    formations: [
      { name: '4-2-3-1 后腰', data: { cb: 2, fullbackType: '边后卫', cdm: 2, lmrm: 0, cm: 0, cam: 1, hasWingers: 2, st: 1 } },
      { name: '4-3-3', data: { cb: 2, fullbackType: '边后卫', cdm: 1, lmrm: 0, cm: 2, cam: 0, hasWingers: 2, st: 1 } },
      { name: '4-4-2 菱形', data: { cb: 2, fullbackType: '边后卫', cdm: 1, lmrm: 0, cm: 2, cam: 1, hasWingers: 0, st: 2 } }
    ]
  },
  '双翼齐飞': {
    mentality: '攻守平衡',
    formations: [
      { name: '4-4-2', data: { cb: 2, fullbackType: '边后卫', cdm: 0, lmrm: 2, cm: 2, cam: 0, hasWingers: 0, st: 2 } },
      { name: '4-3-3', data: { cb: 2, fullbackType: '边后卫', cdm: 1, lmrm: 0, cm: 2, cam: 0, hasWingers: 2, st: 1 } },
      { name: '5-2-3', data: { cb: 3, fullbackType: '边翼卫', cdm: 2, lmrm: 0, cm: 0, cam: 0, hasWingers: 2, st: 1 } }
    ]
  },
  '长传冲吊': {
    mentality: '攻守平衡',
    formations: [
      { name: '4-4-2', data: { cb: 2, fullbackType: '边后卫', cdm: 0, lmrm: 2, cm: 2, cam: 0, hasWingers: 0, st: 2 } },
      { name: '4-3-3', data: { cb: 2, fullbackType: '边后卫', cdm: 1, lmrm: 0, cm: 2, cam: 0, hasWingers: 2, st: 1 } },
      { name: '5-3-2', data: { cb: 3, fullbackType: '边翼卫', cdm: 1, lmrm: 0, cm: 2, cam: 0, hasWingers: 0, st: 2 } }
    ]
  },
  '灵活防反': {
    mentality: '小心谨慎',
    formations: [
      { name: '4-2-3-1 后腰', data: { cb: 2, fullbackType: '边后卫', cdm: 2, lmrm: 0, cm: 0, cam: 1, hasWingers: 2, st: 1 } },
      { name: '4-3-3', data: { cb: 2, fullbackType: '边后卫', cdm: 1, lmrm: 0, cm: 2, cam: 0, hasWingers: 2, st: 1 } },
      { name: '5-3-2', data: { cb: 3, fullbackType: '边翼卫', cdm: 1, lmrm: 0, cm: 2, cam: 0, hasWingers: 0, st: 2 } }
    ]
  },
  '快速防反': {
    mentality: '小心谨慎',
    formations: [
      { name: '4-4-2', data: { cb: 2, fullbackType: '边后卫', cdm: 0, lmrm: 2, cm: 2, cam: 0, hasWingers: 0, st: 2 } },
      { name: '4-3-3', data: { cb: 2, fullbackType: '边后卫', cdm: 1, lmrm: 0, cm: 2, cam: 0, hasWingers: 2, st: 1 } },
      { name: '5-2-3', data: { cb: 3, fullbackType: '边翼卫', cdm: 2, lmrm: 0, cm: 0, cam: 0, hasWingers: 2, st: 1 } }
    ]
  },
  '链式防守': {
    mentality: '防守',
    formations: [
      { name: '5-2-3', data: { cb: 3, fullbackType: '边翼卫', cdm: 2, lmrm: 0, cm: 0, cam: 0, hasWingers: 2, st: 1 } },
      { name: '5-2-1-2', data: { cb: 3, fullbackType: '边翼卫', cdm: 2, lmrm: 0, cm: 0, cam: 1, hasWingers: 0, st: 2 } },
      { name: '5-2-2-1', data: { cb: 3, fullbackType: '边翼卫', cdm: 2, lmrm: 0, cm: 0, cam: 2, hasWingers: 0, st: 1 } }
    ]
  },
  '摆大巴': {
    mentality: '防守',
    formations: [
      { name: '4-4-2', data: { cb: 2, fullbackType: '边后卫', cdm: 0, lmrm: 2, cm: 2, cam: 0, hasWingers: 0, st: 2 } },
      { name: '4-3-3', data: { cb: 2, fullbackType: '边后卫', cdm: 1, lmrm: 0, cm: 2, cam: 0, hasWingers: 2, st: 1 } },
      { name: '4-2-4 后腰', data: { cb: 2, fullbackType: '边后卫', cdm: 2, lmrm: 0, cm: 0, cam: 0, hasWingers: 2, st: 2 } }
    ]
  }
};

// ==================== 跳过次数 ====================
const maxSkipCount = 6;
const skipCount = ref(maxSkipCount);

// ==================== 跳过本轮 ====================
const skipRound = () => {
    if (skipCount.value <= 0) {
        alert('已无跳过次数！');
        return;
    }
    
    if (currentCandidates.value.length === 0) {
        return;
    }
    
    // 从可用池中移除本轮候选人
    const candidateIds = currentCandidates.value.map(p => p.id);
    availablePool.value = availablePool.value.filter(p => !candidateIds.includes(p.id));
    
    // 减少跳过次数
    skipCount.value -= 1;
    
   // 重新抽取候选人（不增加轮次）
    if (availablePool.value.length === 0) {
        currentCandidates.value = [];
        isDraftFinished.value = true;
        showTeam.value = true;
        setTimeout(() => {
            scrollToTeam();
        }, 300);
    } else {
        fetchCandidates();
    }
};

// ==================== 位置统计 ====================
const getPositionCount = (type) => {
    if (myTeam.value.length === 0) return 0;
    
    const positionGroups = {
        defender: ['DL', 'DC', 'DR', 'WBL', 'WBR'],
        midfielder: ['DM', 'MC', 'ML', 'MR', 'AMC'],
        forward: ['AML', 'ST', 'AMR']
    };
    
    const targetPositions = positionGroups[type] || [];
    
    // 统计球员：一个球员在某个组中只要有一个位置值 >= 15 就计数
    let count = 0;
    const countedPlayers = new Set();
    
    myTeam.value.forEach(player => {
        // 检查球员是否有 detailed_pos
        if (!player.detailed_pos) return;
        
        // 检查该球员是否在目标位置中有值 >= 15
        let matched = false;
        for (const pos of targetPositions) {
            if (player.detailed_pos[pos] && player.detailed_pos[pos] >= 15) {
                matched = true;
                break;
            }
        }
        
        if (matched && !countedPlayers.has(player.id)) {
            countedPlayers.add(player.id);
            count++;
        }
    });
    
    return count;
};

// ==================== 门将相关函数 ====================
// 获取门将候选
const fetchGKCandidates = () => {
    if (gkPool.value.length === 0) {
        gkCandidates.value = [];
        return;
    }
    
    // 根据门将选择轮次确定 rating 过滤范围
    let filtered = [];
    if (gkSelectedCount.value === 0) {
        // 第一个门将：rating >= 146
        filtered = gkPool.value.filter(p => p.rating >= 146);
    } else {
        // 第二个门将：125 <= rating <= 145
        filtered = gkPool.value.filter(p => p.rating >= 125 && p.rating <= 145);
    }
    
    // 如果过滤后没有球员，放宽限制（防止卡死）
    if (filtered.length === 0) {
        filtered = gkPool.value;
        console.warn('没有符合条件的门将，已放宽限制');
    }
    
    const shuffled = shuffleArray(filtered);
    const count = Math.min(3, shuffled.length);
    gkCandidates.value = shuffled.slice(0, count).map((player, idx) => ({
        ...player,
        color: colors[idx % colors.length]
    }));
    gkSelectedId.value = gkCandidates.value.length > 0 ? gkCandidates.value[0].id : null;
};

// 选择门将
const signGK = (player) => {
    if (isSelecting.value) return;
    isSelecting.value = true;
    myTeam.value.push(player);
    
    const candidateIds = gkCandidates.value.map(p => p.id);
    gkPool.value = gkPool.value.filter(p => !candidateIds.includes(p.id));
    
    gkSelectedCount.value += 1;
    
    if (navigator.vibrate) navigator.vibrate(30);
    
    setTimeout(() => {
        isSelecting.value = false;
        if (gkSelectedCount.value >= gkRounds || gkPool.value.length === 0) {
            // 门将选择完成，进入阵型设置
            isGKRound.value = false;
            gkCandidates.value = [];
            isDraftFinished.value = true;
            showTeam.value = true;
            setTimeout(() => {
                scrollToTeam();
            }, 300);
        } else {
            fetchGKCandidates();
        }
    }, 300);
};

// ==================== 进度条辅助函数 ====================
// 获取进度宽度（百分比）
const getProgressWidth = () => {
    // 总轮数 = 常规球员16轮 + 门将2轮 = 18轮
    const total = totalRounds + gkRounds;
    const selected = myTeam.value.length;
    return Math.min((selected / total) * 100, 100) + '%';
};

// 获取进度条颜色
const getProgressColor = () => {
    const total = totalRounds + gkRounds;
    const selected = myTeam.value.length;
    const progress = selected / total;
    
    // 0-10轮：绿色，11-16轮：蓝色，17-18轮：黄色
    if (selected <= 9) {
        return 'bg-green-500';
    } else if (selected <= 15) {
        return 'bg-blue-500';
    } else {
        return 'bg-yellow-500';
    }
};

// 获取剩余人数
const getRemainingCount = () => {
    const total = totalRounds + gkRounds;
    const selected = myTeam.value.length;
    // 计算剩余球员 = 总球员数 - 已选球员数
    return Math.max(availablePool.value.length + gkPool.value.length, 0);
};

// ==================== 选秀阶段提示 ====================
const getStageHint = () => {
    const total = totalRounds + gkRounds;
    const selected = myTeam.value.length;
    
    // 门将选择阶段
    if (isGKRound.value) {
        if (gkSelectedCount.value === 0) {
            return '选择主力门将';
        } else {
            return '选择替补门将';
        }
    }
    
    // 常规选秀阶段
    if (selected < 10) {
        return '选择主力球员';
    } else if (selected < 16) {
        return '选择替补球员';
    }
    return '';
};

// ==================== 提示颜色 ====================
const getStageHintClass = () => {
    const selected = myTeam.value.length;
    
    if (isGKRound.value) {
        if (gkSelectedCount.value === 0) {
            return 'bg-purple-100 text-purple-700';
        } else {
            return 'bg-yellow-100 text-yellow-700';
        }
    }
    
    if (selected < 10) {
        return 'bg-green-100 text-green-700';
    } else if (selected < 16) {
        return 'bg-blue-100 text-blue-700';
    }
    return 'bg-gray-100 text-gray-700';
};

// ==================== 首页函数 ====================
const startSimulation = () => {
    isBattleMode.value = false;
    showHome.value = false;
    // 初始化选秀
    const initialPlayers = PLAYER_DATA.map(p => ({ ...p }));
    availablePool.value = shuffleArray(initialPlayers);
    fetchCandidates();
};

const confirmLogin = () => {
    const name = loginUsername.value.trim();
    if (!name) {
        loginError.value = '请输入用户名';
        return;
    }
    // 检查用户名是否在允许列表中
    if (!usersData.includes(name)) {
        loginError.value = '用户名不存在，请重新输入';
        return;
    }
    loginError.value = '';
    currentUser.value = name;
    showLogin.value = false;
    isBattleMode.value = true;
    showHome.value = false;
    // 初始化选秀
    const initialPlayers = PLAYER_DATA.map(p => ({ ...p }));
    availablePool.value = shuffleArray(initialPlayers);
    fetchCandidates();
};

// ==================== 提交阵容 ====================
const submitTeam = async () => {
    // 防止重复点击
    if (isSubmitting.value) {
        alert('正在提交中，请勿重复点击！');
        return;
    }
    
    isSubmitting.value = true;
    
    try {
        // 收集球员信息
        const teamInfo = myTeam.value.map(p => ({
            name: p.name,
            position: p.position,
            rating: p.rating
        }));
        
        // 收集阵型位置分配
        const formationAssignments = [];
        let totalRating = 0;
        let positionCount = 0;
        
        for (const [key, val] of Object.entries(positionAssignments.value)) {
            const [pos, idx] = key.split('_');
            const player = myTeam.value.find(p => p.id === val.playerId);
            if (player) {
                formationAssignments.push({
                    position: pos,
                    player: player.name,
                    playerId: val.playerId,
                    rating: player.rating
                });
                totalRating += player.rating;
                positionCount++;
            }
        }
        
        // ===== 按指定顺序排序 =====
        const positionOrder = ['GK', 'DC', 'DL', 'DR', 'WBL', 'WBR', 'DM', 'MC', 'ML', 'MR', 'AMC', 'AML', 'AMR', 'ST'];

        formationAssignments.sort((a, b) => {
            const indexA = positionOrder.indexOf(a.position);
            const indexB = positionOrder.indexOf(b.position);
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
        });

        // 计算平均评分
        const avgRating = positionCount > 0 ? (totalRating / positionCount).toFixed(1) : 'N/A';
        
        // 生成复制文本
        let text = '═══════════════════════════════════\n';
        text += `  阵容提交\n`;
        text += `  用户: ${currentUser.value || '模拟模式'}\n`;
        text += `  ${new Date().toLocaleString()}\n`;
        text += '═══════════════════════════════════\n\n';
        
        text += '球员名单:\n';
        text += '─────────────────────────────────\n';
        teamInfo.forEach((p, idx) => {
            text += `  ${idx + 1}. ${p.name}  |  ${p.position} \n`;
        });
        text += `  共 ${teamInfo.length} 名球员\n\n`;
        
        text += '战术与心态:\n';
        text += '─────────────────────────────────\n';
        text += `  战术风格: ${getTacticName() || '未选择'}\n`;
        text += `  比赛心态: ${getMentalityName() || '未选择'}\n\n`;
        
        text += '阵型与首发:\n';
        text += `  平均CA: ${avgRating}\n`;
        text += '─────────────────────────────────\n';
        if (formationAssignments.length > 0) {
            formationAssignments.forEach(item => {
                text += `  ${item.position}: ${item.player}\n`;
            });
        } else {
            text += '  暂未分配位置\n';
        }
        text += '\n';
        text += '═══════════════════════════════════\n';
        
        // ===== 1. 复制到剪贴板 =====
        try {
            await navigator.clipboard.writeText(text);
        } catch (err) {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
        }
        
        // ===== 2. 发送邮件 =====
        let emailSuccess = false;
        try {
            emailjs.init(EMAILJS_CONFIG.publicKey);
            
            const result = await emailjs.send(
                EMAILJS_CONFIG.serviceId,
                EMAILJS_CONFIG.templateId,
                {
                    to_email: EMAILJS_CONFIG.toEmail,
                    user_name: currentUser.value || '模拟模式',
                    time: new Date().toLocaleString(),
                    message: text,
                    team_count: teamInfo.length,
                    avg_rating: avgRating
                }
            );
            
            if (result.status === 200) {
                emailSuccess = true;
            }
        } catch (error) {
            console.error('邮件发送失败:', error);
        }
        
        // ===== 3. 提示用户 =====
        if (emailSuccess) {
            alert('阵容已提交并复制到剪贴板\n\n请勿重复提交');
        } else {
            alert('阵容已复制到剪贴板\n\n提交失败，请检查网络后重试');
        }
        
    } catch (error) {
        console.error('提交阵容失败:', error);
        alert('提交失败，请重试');
    } finally {
        // 3秒后解除锁定
        setTimeout(() => {
            isSubmitting.value = false;
        }, 3000);
    }
};

// ==================== EmailJS 配置 ====================
const EMAILJS_CONFIG = {
    publicKey: '-ZziNJYQCXfh9wdxX',
    serviceId: 'service_goqag7b',
    templateId: 'template_j7qr79p',
    toEmail: 'yzythe9th@126.com'
};

// ==================== 工具函数 ====================
const hexToRgba = (hex, opacity) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

const shuffleArray = (arr) => {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const getPositions = (count, label) => {
    if (count === 0) return [];
    const result = [];
    if (count === 1) {
        result.push('center');
    } else if (count === 2) {
        result.push('left', 'right');
    } else if (count >= 3) {
        result.push('left', 'center', 'right');
        for (let i = 3; i < count; i++) {
            result.push('center-' + i);
        }
    }
    return result;
};

// ==================== 获取当前战术风格名称 ====================
const getTacticName = () => {
  const tactic = tactics.find(t => t.id === selectedTactic.value);
  return tactic ? tactic.name : '';
};

// ==================== 获取推荐心态 ====================
const getRecommendedMentality = () => {
  const tacticName = getTacticName();
  const rec = tacticRecommendations[tacticName];
  return rec ? rec.mentality : '';
};

// ==================== 心态确认 ====================
const confirmMentality = () => {
    if (!selectedMentality.value) return;
    showMentality.value = false;
    showFormation.value = true;
};

// ==================== 获取推荐阵型列表 ====================
const getRecommendedFormations = () => {
    const tacticName = getTacticName();
    const rec = tacticRecommendations[tacticName];
    return rec ? rec.formations : [];
};

// ==================== 应用推荐阵型 ====================
const applyFormation = (fmData) => {
    // 应用阵型数据
    formationData.value.cb = fmData.cb;
    formationData.value.fullbackType = fmData.fullbackType;
    formationData.value.cdm = fmData.cdm;
    formationData.value.lmrm = fmData.lmrm || 0;
    formationData.value.cm = fmData.cm;
    formationData.value.cam = fmData.cam || 0;
    formationData.value.hasWingers = fmData.hasWingers;
    formationData.value.st = fmData.st;
    
    // 直接跳转到最终结果
    showFormation.value = false;
    showFormationResult.value = true;
};

const getTacticDescription = () => {
  const tactic = tactics.find(t => t.id === selectedTactic.value);
  return tactic ? tactic.description : '';
};

const getMentalityName = () => {
  const mentality = mentalities.find(m => m.id === selectedMentality.value);
  return mentality ? mentality.name : '';
};

const getMentalityDescription = () => {
  const mentality = mentalities.find(m => m.id === selectedMentality.value);
  return mentality ? mentality.description : '';
};

// ==================== 核心函数 ====================
const fetchCandidates = () => {
    if (availablePool.value.length === 0) {
        currentCandidates.value = [];
        return;
    }

    // 如果还没开始选秀，不执行
    if (showHome.value) return;
    
    // 根据当前选秀阶段确定 rating 过滤范围
    const selected = myTeam.value.length;
    let filtered = [];
    
    if (selected < 10) {
        // 主力阶段：rating >= 146
        filtered = availablePool.value.filter(p => p.rating >= 146);
    } else if (selected < 16) {
        // 替补阶段：130 <= rating <= 145
        filtered = availablePool.value.filter(p => p.rating >= 130 && p.rating <= 145);
    } else {
        // 常规选秀结束，不应进入此分支
        filtered = availablePool.value;
    }
    
    // 如果过滤后没有球员，放宽限制（防止卡死）
    if (filtered.length === 0) {
        filtered = availablePool.value;
        console.warn('没有符合条件的球员，已放宽限制');
    }
    
    const shuffled = shuffleArray(filtered);
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
            // 常规选秀结束，进入门将选择
            currentCandidates.value = [];
            // 初始化门将池
            const gkPlayers = gkPlayersData.map(p => ({ ...p, isGK: true }));
            gkPool.value = shuffleArray(gkPlayers);
            isGKRound.value = true;
            gkSelectedCount.value = 0;
            fetchGKCandidates();
        } else {
            fetchCandidates();
        }
    }, 300);
};

// ==================== 门将雷达图数据 ====================
const gkRadarData = computed(() => {
    const labels = gkAbilityKeys.map(key => key === '制空2' ? '制空' : key);
    
    const allDatasets = gkCandidates.value.map((player, idx) => {
        const isSelected = player.id === gkSelectedId.value;
        const color = colors[idx % colors.length];
        const data = gkAbilityKeys.map(key => player.abilities?.[key] || 0);
        return {
            label: player.name,
            data: data,
            backgroundColor: 'rgba(0,0,0,0)',
            borderColor: isSelected ? color : hexToRgba(color, 0.6),
            borderWidth: isSelected ? 4 : 2,
            pointBackgroundColor: isSelected ? color : hexToRgba(color, 0.6),
            pointRadius: isSelected ? 2 : 0,
            pointBorderColor: isSelected ? color : hexToRgba(color, 0.6),
            pointBorderWidth: isSelected ? 2 : 1,
            fill: false,
            _playerId: player.id
        };
    });

    if (gkSelectedId.value) {
        const selectedIndex = allDatasets.findIndex(d => d._playerId === gkSelectedId.value);
        if (selectedIndex !== -1) {
            const [selectedItem] = allDatasets.splice(selectedIndex, 1);
            allDatasets.push(selectedItem);
        }
    }
    return { labels, datasets: allDatasets };
});

// ==================== 雷达图数据 ====================
const radarData = computed(() => {
    // 判断当前候选是否门将
    const isGK = currentCandidates.value.length > 0 && currentCandidates.value[0]?.isGK === true;
    const labels = isGK ? gkAbilityKeys : abilityKeys;
    // 如果是门将，需要映射制空2显示为制空
    const displayLabels = isGK ? labels.map(key => key === '制空2' ? '制空' : key) : labels;
    
    const allDatasets = currentCandidates.value.map((player, idx) => {
        const isSelected = player.id === selectedId.value;
        const color = colors[idx % colors.length];
        const data = labels.map(key => player.abilities?.[key] || 0);
        return {
            label: player.name,
            data: data,
            backgroundColor: 'rgba(0,0,0,0)',
            borderColor: isSelected ? color : hexToRgba(color, 0.6),
            borderWidth: isSelected ? 4 : 2,
            pointBackgroundColor: isSelected ? color : hexToRgba(color, 0.6),
            pointRadius: isSelected ? 2 : 0,
            pointBorderColor: isSelected ? color : hexToRgba(color, 0.6),
            pointBorderWidth: isSelected ? 2 : 1,
            fill: false,
            _playerId: player.id
        };
    });

    if (selectedId.value) {
        const selectedIndex = allDatasets.findIndex(d => d._playerId === selectedId.value);
        if (selectedIndex !== -1) {
            const [selectedItem] = allDatasets.splice(selectedIndex, 1);
            allDatasets.push(selectedItem);
        }
    }
    return { labels: displayLabels, datasets: allDatasets };
});

// ==================== 滚动 ====================
const teamSection = ref(null);
const scrollToTeam = () => {
  nextTick(() => {
    const container = document.querySelector('.flex-1.overflow-y-auto');
    if (container && teamSection.value) {
      const bottomOffset = teamSection.value.offsetTop;
      container.scrollTo({ top: bottomOffset, behavior: 'smooth' });
    }
  });
};

// ==================== 战术/心态确认 ====================
const confirmTactic = () => {
  if (!selectedTactic.value) return;
  showTactic.value = false;
  showMentality.value = true;
};

// ==================== 阵型函数 ====================
const nextStep = () => {
    if (!canNext.value) return;
    formationStep.value += 1;
    showError.value = false;
};

const prevStep = () => {
    if (formationStep.value <= 0) return;
    
    // ===== 重置当前步骤为默认值 =====
    const defaultValues = {
        0: { cb: 2 },
        1: { fullbackType: '边后卫', wingbackCount: 2 },
        2: { cdm: 0 },
        3: { lmrm: 0 },
        4: { cm: 0 },
        5: { cam: 0 },
        6: { hasWingers: 0 },
        7: { st: 1 }
    };
    
    const defaults = defaultValues[formationStep.value];
    if (defaults) {
        Object.keys(defaults).forEach(key => {
            formationData.value[key] = defaults[key];
        });
    }
    
    formationStep.value -= 1;
    showError.value = false;
    errorMessage.value = '';
};

const finishFormation = () => {
  if (!canFinish.value) return;
  showFormation.value = false;
  showFormationResult.value = true;
};

const resetFormation = () => {
  showFormationResult.value = false;
  showFormation.value = true;
  formationStep.value = 0;
  positionAssignments.value = {};
  formationData.value = {
    cb: 2,
    fullbackType: '边后卫',
    wingbackCount: 2,
    cdm: 0,
    lmrm: 0,
    cm: 0,
    cam: 0,
    hasWingers: 0,
    st: 1
  };
  showError.value = false;
  errorMessage.value = '';
};

// ==================== 重新开始 ====================
const restartGame = () => {
    // 重置所有状态
    const resetPlayers = PLAYER_DATA.map(p => ({ ...p }));
    availablePool.value = shuffleArray(resetPlayers);
    myTeam.value = [];
    currentRound.value = 1;
    selectedId.value = null;
    isSelecting.value = false;
    isDraftFinished.value = false;
    showTactic.value = false;
    showMentality.value = false;
    showFormation.value = false;
    showFormationResult.value = false;
    selectedTactic.value = null;
    selectedMentality.value = null;
    formationStep.value = 0;
    positionAssignments.value = {};
    formationData.value = {
        cb: 2,
        fullbackType: '边后卫',
        wingbackCount: 2,
        cdm: 0,
        lmrm: 0,
        cm: 0,
        cam: 0,
        hasWingers: 0,
        st: 1
    };
    showError.value = false;
    errorMessage.value = '';
    showTeam.value = false;
    skipCount.value = maxSkipCount;
    isGKRound.value = false;
    gkPool.value = [];
    gkCandidates.value = [];
    gkSelectedCount.value = 0;
    currentCandidates.value = [];
    
    // 返回首页
    showHome.value = true;
    isBattleMode.value = false;
    currentUser.value = '';
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