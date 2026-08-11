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
          <span class="text-sm text-gray-500">已选</span>
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

    <!-- ===== 中部内容 ===== -->
    <div class="flex-1 overflow-y-auto p-4">
      
      <!-- ===== 选秀界面 ===== -->
      <div v-if="!isDraftFinished && !showTactic && !showMentality && !showFormation && !showFormationResult">
        <div v-if="currentCandidates.length > 0">
          <!-- 球员表格 -->
          <div class="space-y-3">
            <div class="flex items-center text-xs text-gray-400 px-3 py-1">
              <span class="w-8 text-center">#</span>
              <span class="flex-1">球员</span>
              <span class="w-20 text-center">位置</span>
              <span class="w-12 text-center">评分</span>
            </div>

            <div 
              v-for="(player, idx) in currentCandidates" 
              :key="player.id"
              class="bg-white rounded-2xl shadow-md p-3 flex items-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
              :class="{ 'border-2 border-green-400': selectedId === player.id }"
              @click="selectedId = player.id"
            >
              <span class="w-8 text-center text-sm font-bold text-gray-400">{{ idx + 1 }}</span>
              <div class="flex-1 min-w-0">
                <div class="font-bold text-gray-800 text-sm truncate">{{ player.name }}</div>
                <div class="text-xs text-gray-400 truncate">{{ player.club || '' }}</div>
              </div>
              <div class="w-20 text-center flex-shrink-0">
                <span class="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{{ player.position }}</span>
              </div>
              <div class="w-12 text-center flex-shrink-0">
                <span class="font-bold text-green-600 text-lg">{{ player.rating }}</span>
              </div>
            </div>
          </div>
          
          <!-- ===== 底部确认按钮 ===== -->
          <div class="mt-4 flex justify-center">
            <button 
              @click="selectedId !== null ? signPlayer(currentCandidates.find(p => p.id === selectedId)) : null"
              class="w-full py-3 rounded-2xl font-bold text-lg transition-all active:scale-95"
              :class="selectedId !== null ? 'bg-green-500 text-white shadow-md' : 'bg-gray-200 text-gray-400 cursor-not-allowed'"
            >
              ✓ 
            </button>
          </div>
          
          <div class="text-center text-xs text-gray-400 py-2">
            点击球员查看详情，点击「✓」选择
          </div>

          <!-- ===== 雷达图 ===== -->
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
        <p class="text-xs text-center text-gray-400 mb-4">决定球队的整体比赛策略</p>
        
        <div class="space-y-3">
          <div 
            v-for="mentality in mentalities" 
            :key="mentality.id"
            @click="selectedMentality = mentality.id"
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
            <p class="text-xs text-gray-500">当前阵容人数：{{ currentFormationTotal + 1 }} / 11（含门将）</p>
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
            @click="formationStep--"
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
        <h3 class="text-lg font-bold text-center text-gray-800 mb-4">📊 </h3>
        
        <!-- 战术风格 -->
        <div class="mb-3 p-3 bg-gray-50 rounded-xl">
            <p class="text-xs text-gray-500">战术风格</p>
            <p class="font-bold text-gray-800">{{ getTacticName() }}</p>
            <p class="text-xs text-gray-500 mt-1">{{ getTacticDescription() }}</p>
        </div>
        
        <!-- 心态 -->
        <div class="mb-3 p-3 bg-gray-50 rounded-xl">
            <p class="text-xs text-gray-500">比赛心态</p>
            <p class="font-bold text-gray-800">{{ getMentalityName() }}</p>
            <p class="text-xs text-gray-500 mt-1">{{ getMentalityDescription() }}</p>
        </div>
        
        <!-- 阵型图 -->
        <div class="mb-3 p-3 bg-gray-50 rounded-xl">
            <p class="text-xs text-gray-500 text-center mb-2"></p>
            <div class="relative w-full h-[420px] bg-gradient-to-b from-green-600 to-green-800 rounded-xl overflow-hidden">
                <div class="absolute inset-0 flex flex-col items-center justify-between py-6 px-4">
                    
                    <!-- 第1行：中锋（中路） -->
                    <div class="flex justify-center w-full">
                        <div class="flex justify-center gap-6" :class="formationData.st === 1 ? 'w-20' : formationData.st === 2 ? 'w-48' : 'w-72'">
                            <div v-for="(pos, idx) in getPositions(formationData.st, '中锋')" :key="'st-'+idx" 
                                 class="w-11 h-11 rounded-full bg-red-500 flex items-center justify-center text-[10px] font-bold text-white shadow-lg border-2 border-white/30">
                                
                            </div>
                        </div>
                    </div>
                    
                    <!-- 第2行：边锋（左/右）+ 前腰（中路） -->
                    <div class="flex justify-between items-center w-full">
                        <!-- 左路：边锋 -->
                        <div class="flex justify-center w-[72px]">
                            <div v-if="formationData.hasWingers >= 1" v-for="(pos, idx) in getPositions(formationData.hasWingers === 2 ? 1 : 0, '边锋')" :key="'w-left-'+idx" 
                                 class="w-10 h-10 rounded-full bg-orange-400 flex items-center justify-center text-[9px] font-bold text-white shadow-lg border-2 border-white/30">
                                
                            </div>
                        </div>
                        <!-- 中路：前腰 -->
                        <div class="flex justify-center flex-1">
                            <div class="flex justify-center gap-6" :class="formationData.cam === 1 ? 'w-20' : formationData.cam === 2 ? 'w-48' : 'w-72'">
                                <div v-for="(pos, idx) in getPositions(formationData.cam, '前腰')" :key="'cam-'+idx" 
                                     class="w-10 h-10 rounded-full bg-orange-400 flex items-center justify-center text-[9px] font-bold text-white shadow-lg border-2 border-white/30">
                                    
                                </div>
                            </div>
                        </div>
                        <!-- 右路：边锋 -->
                        <div class="flex justify-center w-[72px]">
                            <div v-if="formationData.hasWingers >= 2" v-for="(pos, idx) in getPositions(formationData.hasWingers === 2 ? 1 : 0, '边锋')" :key="'w-right-'+idx" 
                                 class="w-10 h-10 rounded-full bg-orange-400 flex items-center justify-center text-[9px] font-bold text-white shadow-lg border-2 border-white/30">
                                
                            </div>
                        </div>
                    </div>
                    
                    <!-- 第3行：边前卫（左/右）+ 中场（中路） -->
                    <div class="flex justify-between items-center w-full">
                        <div class="flex justify-center w-[72px]">
                            <div v-if="formationData.lmrm >= 1" v-for="(pos, idx) in getPositions(formationData.lmrm === 2 ? 1 : 0, '边前卫')" :key="'lmrm-left-'+idx" 
                                 class="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-[9px] font-bold text-white shadow-lg border-2 border-white/30">
                                
                            </div>
                        </div>
                        <div class="flex justify-center flex-1">
                            <div class="flex justify-center gap-6" :class="formationData.cm === 1 ? 'w-20' : formationData.cm === 2 ? 'w-48' : 'w-72'">
                                <div v-for="(pos, idx) in getPositions(formationData.cm, '中场')" :key="'cm-'+idx" 
                                     class="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-[9px] font-bold text-white shadow-lg border-2 border-white/30">
                                    
                                </div>
                            </div>
                        </div>
                        <div class="flex justify-center w-[72px]">
                            <div v-if="formationData.lmrm >= 2" v-for="(pos, idx) in getPositions(formationData.lmrm === 2 ? 1 : 0, '边前卫')" :key="'lmrm-right-'+idx" 
                                 class="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-[9px] font-bold text-white shadow-lg border-2 border-white/30">
                                
                            </div>
                        </div>
                    </div>
                    
                    <!-- 第4行：边翼卫（左/右）+ 后腰（中路） -->
                    <div class="flex justify-between items-center w-full">
                        <div class="flex justify-center w-[72px]">
                            <div v-if="formationData.fullbackType === '边翼卫'" v-for="(pos, idx) in getPositions(1, '边翼卫')" :key="'wb-left-'+idx" 
                                 class="w-10 h-10 rounded-full bg-cyan-400 flex items-center justify-center text-[9px] font-bold text-white shadow-lg border-2 border-white/30">
                                
                            </div>
                        </div>
                        <div class="flex justify-center flex-1">
                            <div class="flex justify-center gap-6" :class="formationData.cdm === 1 ? 'w-20' : formationData.cdm === 2 ? 'w-48' : 'w-72'">
                                <div v-for="(pos, idx) in getPositions(formationData.cdm, '后腰')" :key="'cdm-'+idx" 
                                     class="w-10 h-10 rounded-full bg-cyan-400 flex items-center justify-center text-[9px] font-bold text-white shadow-lg border-2 border-white/30">
                                    
                                </div>
                            </div>
                        </div>
                        <div class="flex justify-center w-[72px]">
                            <div v-if="formationData.fullbackType === '边翼卫'" v-for="(pos, idx) in getPositions(1, '边翼卫')" :key="'wb-right-'+idx" 
                                 class="w-10 h-10 rounded-full bg-cyan-400 flex items-center justify-center text-[9px] font-bold text-white shadow-lg border-2 border-white/30">
                                
                            </div>
                        </div>
                    </div>
                    
                    <!-- 第5行：边后卫（左/右）+ 中卫（中路） -->
                    <div class="flex justify-between items-center w-full">
                        <div class="flex justify-center w-[72px]">
                            <div v-if="formationData.fullbackType === '边后卫'" v-for="(pos, idx) in getPositions(1, '边后卫')" :key="'fb-left-'+idx" 
                                 class="w-10 h-10 rounded-full bg-blue-400 flex items-center justify-center text-[9px] font-bold text-white shadow-lg border-2 border-white/30">
                                
                            </div>
                        </div>
                        <div class="flex justify-center flex-1">
                            <div class="flex justify-center gap-6" :class="formationData.cb === 2 ? 'w-48' : 'w-72'">
                                <div v-for="(pos, idx) in getPositions(formationData.cb, '中卫')" :key="'cb-'+idx" 
                                     class="w-10 h-10 rounded-full bg-blue-400 flex items-center justify-center text-[9px] font-bold text-white shadow-lg border-2 border-white/30">
                                    
                                </div>
                            </div>
                        </div>
                        <div class="flex justify-center w-[72px]">
                            <div v-if="formationData.fullbackType === '边后卫'" v-for="(pos, idx) in getPositions(1, '边后卫')" :key="'fb-right-'+idx" 
                                 class="w-10 h-10 rounded-full bg-blue-400 flex items-center justify-center text-[9px] font-bold text-white shadow-lg border-2 border-white/30">
                                
                            </div>
                        </div>
                    </div>
                    
                    <!-- 门将 -->
                    <div class="flex justify-center w-full">
                        <div class="w-12 h-12 rounded-full bg-purple-400 flex items-center justify-center text-[10px] font-bold text-white shadow-lg border-2 border-white/30">
                            
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
                🔄 阵型
            </button>
            <button 
                @click="restartGame"
                class="flex-1 py-3 bg-green-500 text-white rounded-xl font-bold active:scale-95 transition"
            >
                🔄 选人
            </button>
        </div>
    </div>

      <!-- ===== 选秀结束 ===== -->
      <div v-else-if="isDraftFinished && !showTactic && !showMentality && !showFormation && !showFormationResult" class="text-center py-12">
        <div class="text-6xl mb-4">🎉</div>
        <h3 class="text-xl font-bold text-gray-700">完成</h3>
        <p class="text-gray-500 mt-2">共 {{ myTeam.length }} 名球员</p>
        <button 
          @click="showTactic = true"
          class="mt-6 px-6 py-3 bg-blue-500 text-white rounded-2xl font-bold shadow-lg active:scale-95 transition"
        >
          📋 阵型
        </button>
      </div>
    </div>

    <!-- ===== 底部：我的球队 ===== -->
    <div 
      ref="teamSection"
      class="bg-white/90 backdrop-blur p-3 shadow-inner flex-shrink-0 transition-all duration-500 flex flex-col"
      :class="[
        myTeam.length === totalRounds ? 'border-t-4 border-green-500' : '',
        showTeam ? 'h-[35vh]' : 'h-auto'
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
        <span class="text-gray-400 text-sm">{{ showTeam ? '收起 ▲' : '展开 ▼' }}</span>
      </div>
  
      <!-- 球队名单 - 这个容器会占满剩余空间并滚动 -->
      <div 
        v-if="showTeam && myTeam.length > 0" 
        class="mt-2 flex-1 overflow-y-auto space-y-1 min-h-0"
      >
        <div 
          v-for="(p, idx) in myTeam" 
          :key="idx" 
          class="flex items-center gap-2 p-2 bg-gray-50 rounded-xl text-sm"
        >
          <span class="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">{{ idx + 1 }}</span>
          <span class="font-medium">{{ p.name }}</span>
          <span class="text-xs text-gray-400 flex-shrink-0">{{ p.position }}</span>
          <span class="text-green-600 font-bold ml-auto flex-shrink-0">{{ p.rating }}</span>
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

// ===== 导入球员数据 =====
import fieldPlayersData from './data/fieldPlayers.json';

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

// ===== 从 JSON 文件读取球员数据 =====
const PLAYER_DATA = fieldPlayersData;

// ==================== 战术风格数据 ====================
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

// ==================== 心态数据 ====================
const mentalities = [
  { id: 1, name: '全力防守', description: '这种心态的目的是以压缩空间，放慢节奏，保持控球，尽可能消耗时间的方式折磨对手并降低风险。不同于防守心态的是，球队反击时不求得分，只求不丢球。因为控球和消磨是首要目的，更多球员会保持在球后方。' },
  { id: 2, name: '防守', description: '如果预期会输掉比赛，并且防线将承受巨大压力，推荐采用该种心态。球队会以防守为主，通过限制本方半场的空间，破坏对手的进攻节奏。继而通过快速的传球在反击中寻找破门机会。' },
  { id: 3, name: '小心谨慎', description: '如果不能在比赛中保持控球，但能在反击中制造威胁，推荐采取该种心态。球队会保证防守时的站位，并在空当出现时，快速将球传给前场球员。这种战术的关键在于转移球的速度够快，才能够有效利用对手边后卫及边锋身后的空当。在机会不好的时候，球员大多会留在本方半场参与防守。' },
  { id: 4, name: '攻守平衡', description: '这毫无疑问是所有比赛心态中最重要的。通过仔细权衡得失，这将使主教练评估比赛和球队运行的状况，切换到更具针对性的战术的时机。这是大多数比赛中的理想的起始心态。通过仔细观察比赛后，主教练可以选择改成更具侵略性或者更谨慎的心态。如果情况良好，也可以保持原有心态。' },
  { id: 5, name: '积极进取', description: '如果对手实力较弱，但有一定的反击能力，推荐采取该种心态。在该种心态下，球队会通过耐心的传递制造空当并寻求将球打入禁区的机会。在保证防守的前提下，边后卫会不时下底包抄，并且中场球员也会前插，但在机会不好时，他们会留在防守位置上力争保持控球。' },
  { id: 6, name: '进攻', description: '这种比赛心态适用于球队被看好，并且在对手半场保持住球权的比赛。球队会在进攻中利用快速的节奏和更多的直传寻求对手后场的空当。如果球队在进攻中容易丢球，则需要改用多多倒球的战术保持球权。这一心态的重点在于让球员会抓住可能的机会找空当前插，并给他们施展才华的自由。' },
  { id: 7, name: '全力进攻', description: '这种比赛心态适用于球队孤注一掷需要取得进球时。球队会保持极高的节奏和极为直接的传递，以求持续向对手后场试压。防守中利用夺回球权的机会穿透防线。在进攻时，则寄希望于利用压到前场的人数优势找到空当破门得分。' }
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

// ==================== 战术/心态辅助函数 ====================
const getTacticName = () => {
  const tactic = tactics.find(t => t.id === selectedTactic.value);
  return tactic ? tactic.name : '';
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

// ==================== 阵型辅助函数 ====================
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

const getFormationDisplay = () => {
  const cb = formationData.value.cb || 0;
  const fb = formationData.value.fullbackType === '边后卫' ? 2 : 0;
  const wb = formationData.value.fullbackType === '边翼卫' ? 2 : 0;
  const cdm = formationData.value.cdm || 0;
  const lmrm = formationData.value.lmrm || 0;
  const cm = formationData.value.cm || 0;
  const cam = formationData.value.cam || 0;
  const w = formationData.value.hasWingers || 0;
  const st = formationData.value.st || 0;
  return `${cb}-${fb + wb}-${cdm}-${lmrm}-${cm}-${cam}-${w}-${st}`;
};

// ==================== 核心函数 ====================
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
      isDraftFinished.value = true;
      showTeam.value = true;
      setTimeout(() => {
        scrollToTeam();
      }, 300);
    } else {
      fetchCandidates();
    }
  }, 300);
};

// ==================== 雷达图数据 ====================
const radarData = computed(() => {
  const labels = abilityKeys;
  const allDatasets = currentCandidates.value.map((player, idx) => {
    const isSelected = player.id === selectedId.value;
    const color = colors[idx % colors.length];
    return {
      label: player.name,
      data: abilityKeys.map(key => player.abilities?.[key] || 0),
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
  return { labels, datasets: allDatasets };
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

const confirmMentality = () => {
  if (!selectedMentality.value) return;
  showMentality.value = false;
  showFormation.value = true;
};

// ==================== 阵型函数 ====================
const nextStep = () => {
  if (!canNext.value) return;
  formationStep.value += 1;
  showError.value = false;
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