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
        <span>未选/跳过的不会再抽到</span>
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
              <span class="flex-1 pl-2">球员</span>
              <span class="w-20 text-center">位置</span>
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
            </div>
          </div>
          
          <!-- ===== 底部按钮 ===== -->
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
            <p class="text-center font-bold text-[18px] text-gray-700 mb-2">选择首发</p>
            <div class="relative w-full aspect-[3/4] max-h-[380px] bg-gradient-to-b from-green-600 to-green-800 rounded-xl overflow-hidden">
                <div class="absolute inset-0 flex flex-col items-center justify-between py-3 px-2">
                    
                    <!-- 第1行：中锋（中路） -->
                    <div class="flex justify-center w-full">
                        <div class="flex justify-center gap-3" :class="formationData.st === 1 ? 'w-16' : formationData.st === 2 ? 'w-36' : 'w-52'">
                            <div v-for="(pos, idx) in getPositions(formationData.st, 'ST')" :key="'st-'+idx" 
                                 class="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold text-white shadow-lg border-2 border-white/30 cursor-pointer"
                                 :class="getPositionColor('ST', idx)"
                                 @click="openPlayerSelect('ST', idx)"
                            >
                                {{ getPositionDisplay('ST', idx) }}
                            </div>
                        </div>
                    </div>
                    
                    <!-- 第2行：边锋（左/右）+ 前腰（中路） -->
                    <div class="flex justify-center items-center w-full gap-2">
                        <div class="flex justify-center w-14">
                            <div v-if="formationData.hasWingers >= 1" v-for="(pos, idx) in getPositions(1, 'AML')" :key="'w-left-'+idx" 
                                 class="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold text-white shadow-lg border-2 border-white/30 cursor-pointer"
                                 :class="getPositionColor('AML', idx)"
                                 @click="openPlayerSelect('AML', idx)"
                            >
                                {{ getPositionDisplay('AML', idx) }}
                            </div>
                        </div>
                        <div class="flex justify-center flex-1">
                            <div class="flex justify-center gap-3" :class="formationData.cam === 1 ? 'w-16' : formationData.cam === 2 ? 'w-36' : 'w-52'">
                                <div v-for="(pos, idx) in getPositions(formationData.cam, 'AMC')" :key="'cam-'+idx" 
                                     class="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold text-white shadow-lg border-2 border-white/30 cursor-pointer"
                                     :class="getPositionColor('AMC', idx)"
                                     @click="openPlayerSelect('AMC', idx)"
                                >
                                    {{ getPositionDisplay('AMC', idx) }}
                                </div>
                            </div>
                        </div>
                        <div class="flex justify-center w-14">
                            <div v-if="formationData.hasWingers >= 2" v-for="(pos, idx) in getPositions(1, 'AMR')" :key="'w-right-'+idx" 
                                 class="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold text-white shadow-lg border-2 border-white/30 cursor-pointer"
                                 :class="getPositionColor('AMR', idx)"
                                 @click="openPlayerSelect('AMR', idx)"
                            >
                                {{ getPositionDisplay('AMR', idx) }}
                            </div>
                        </div>
                    </div>
                    
                    <!-- 第3行：边前卫（左/右）+ 中场（中路） -->
                    <div class="flex justify-center items-center w-full gap-2">
                        <div class="flex justify-center w-14">
                            <div v-if="formationData.lmrm >= 1" v-for="(pos, idx) in getPositions(1, 'ML')" :key="'lmrm-left-'+idx" 
                                 class="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold text-white shadow-lg border-2 border-white/30 cursor-pointer"
                                 :class="getPositionColor('ML', idx)"
                                 @click="openPlayerSelect('ML', idx)"
                            >
                                {{ getPositionDisplay('ML', idx) }}
                            </div>
                        </div>
                        <div class="flex justify-center flex-1">
                            <div class="flex justify-center gap-3" :class="formationData.cm === 1 ? 'w-16' : formationData.cm === 2 ? 'w-36' : 'w-52'">
                                <div v-for="(pos, idx) in getPositions(formationData.cm, 'MC')" :key="'cm-'+idx" 
                                     class="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold text-white shadow-lg border-2 border-white/30 cursor-pointer"
                                     :class="getPositionColor('MC', idx)"
                                     @click="openPlayerSelect('MC', idx)"
                                >
                                    {{ getPositionDisplay('MC', idx) }}
                                </div>
                            </div>
                        </div>
                        <div class="flex justify-center w-14">
                            <div v-if="formationData.lmrm >= 2" v-for="(pos, idx) in getPositions(1, 'MR')" :key="'lmrm-right-'+idx" 
                                 class="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold text-white shadow-lg border-2 border-white/30 cursor-pointer"
                                 :class="getPositionColor('MR', idx)"
                                 @click="openPlayerSelect('MR', idx)"
                            >
                                {{ getPositionDisplay('MR', idx) }}
                            </div>
                        </div>
                    </div>
                    
                    <!-- 第4行：边翼卫（左/右）+ 后腰（中路） -->
                    <div class="flex justify-center items-center w-full gap-2">
                        <div class="flex justify-center w-14">
                            <div v-if="formationData.fullbackType === '边翼卫'" v-for="(pos, idx) in getPositions(1, 'WBL')" :key="'wb-left-'+idx" 
                                 class="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold text-white shadow-lg border-2 border-white/30 cursor-pointer"
                                 :class="getPositionColor('WBL', idx)"
                                 @click="openPlayerSelect('WBL', idx)"
                            >
                                {{ getPositionDisplay('WBL', idx) }}
                            </div>
                        </div>
                        <div class="flex justify-center flex-1">
                            <div class="flex justify-center gap-3" :class="formationData.cdm === 1 ? 'w-16' : formationData.cdm === 2 ? 'w-36' : 'w-52'">
                                <div v-for="(pos, idx) in getPositions(formationData.cdm, 'DM')" :key="'cdm-'+idx" 
                                     class="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold text-white shadow-lg border-2 border-white/30 cursor-pointer"
                                     :class="getPositionColor('DM', idx)"
                                     @click="openPlayerSelect('DM', idx)"
                                >
                                    {{ getPositionDisplay('DM', idx) }}
                                </div>
                            </div>
                        </div>
                        <div class="flex justify-center w-14">
                            <div v-if="formationData.fullbackType === '边翼卫'" v-for="(pos, idx) in getPositions(1, 'WBR')" :key="'wb-right-'+idx" 
                                 class="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold text-white shadow-lg border-2 border-white/30 cursor-pointer"
                                 :class="getPositionColor('WBR', idx)"
                                 @click="openPlayerSelect('WBR', idx)"
                            >
                                {{ getPositionDisplay('WBR', idx) }}
                            </div>
                        </div>
                    </div>
                    
                    <!-- 第5行：边后卫（左/右）+ 中卫（中路） -->
                    <div class="flex justify-center items-center w-full gap-2">
                        <div class="flex justify-center w-14">
                            <div v-if="formationData.fullbackType === '边后卫'" v-for="(pos, idx) in getPositions(1, 'DL')" :key="'fb-left-'+idx" 
                                 class="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold text-white shadow-lg border-2 border-white/30 cursor-pointer"
                                 :class="getPositionColor('DL', idx)"
                                 @click="openPlayerSelect('DL', idx)"
                            >
                                {{ getPositionDisplay('DL', idx) }}
                            </div>
                        </div>
                        <div class="flex justify-center flex-1">
                            <div class="flex justify-center gap-3" :class="formationData.cb === 2 ? 'w-36' : 'w-52'">
                                <div v-for="(pos, idx) in getPositions(formationData.cb, 'DC')" :key="'cb-'+idx" 
                                     class="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold text-white shadow-lg border-2 border-white/30 cursor-pointer"
                                     :class="getPositionColor('DC', idx)"
                                     @click="openPlayerSelect('DC', idx)"
                                >
                                    {{ getPositionDisplay('DC', idx) }}
                                </div>
                            </div>
                        </div>
                        <div class="flex justify-center w-14">
                            <div v-if="formationData.fullbackType === '边后卫'" v-for="(pos, idx) in getPositions(1, 'DR')" :key="'fb-right-'+idx" 
                                 class="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold text-white shadow-lg border-2 border-white/30 cursor-pointer"
                                 :class="getPositionColor('DR', idx)"
                                 @click="openPlayerSelect('DR', idx)"
                            >
                                {{ getPositionDisplay('DR', idx) }}
                            </div>
                        </div>
                    </div>
                    
                    <!-- 门将 -->
                    <div class="flex justify-center w-full">
                        <div class="w-9 h-9 rounded-full bg-purple-400 flex items-center justify-center text-[12px] font-bold text-white shadow-lg border-2 border-white/30">
                            GK
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
            <h4 class="font-bold text-center text-gray-800 mb-3">选择 {{ currentPositionName }} 球员</h4>
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

    <!-- ===== 球员详情弹出框（八维图） ===== -->
    <div v-if="showPlayerDetail" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="closePlayerDetail">
        <div class="bg-white rounded-2xl p-4 max-w-sm w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div class="flex items-center justify-between mb-3">
                <h4 class="font-bold text-gray-800">{{ detailPlayer?.name || '球员' }}</h4>
                <span class="text-xs text-gray-400">{{ detailPlayer?.position || '' }}</span>
            </div>
            <div class="w-full" style="height: 300px; position: relative;">
                <Radar 
                    :data="detailRadarData" 
                    :options="detailRadarOptions"
                    v-if="detailRadarData && detailRadarData.labels && detailRadarData.labels.length > 0"
                />
                <div v-else class="flex items-center justify-center h-full text-gray-400 text-sm">
                    暂无能力数据
                </div>
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

const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'];
const abilityKeys = ['防守', '身体', '速度', '创造', '进攻', '技术', '制空', '精神'];
const PLAYER_DATA = fieldPlayersData;

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
        'CB': { ST: 4, AML: 4, AMC: 4, AMR: 4, ML: 4, MC: 6, MR: 4, WBL: 6, DM: 8, WBR: 6, DL: 10, DC: 18, DR: 10 },
        'GK': { ST: 2, AML: 2, AMC: 2, AMR: 2, ML: 2, MC: 2, MR: 2, WBL: 2, DM: 2, WBR: 2, DL: 2, DC: 2, DR: 2 }
    };
    
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
            min: 0,
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
    
    // 使用和主雷达图相同的 abilityKeys
    const labels = abilityKeys;
    const data = labels.map(key => detailPlayer.value.abilities?.[key] || 0);
    
    return {
        labels: labels,
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
    showPlayerDetail.value = true;
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
  skipCount.value = maxSkipCount; // 重置跳过次数
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