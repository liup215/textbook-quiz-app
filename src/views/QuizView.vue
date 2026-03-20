<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
    <div class="max-w-3xl mx-auto">

      <!-- 顶部导航 -->
      <div class="flex items-center justify-between mb-6">
        <button
          @click="goHome"
          class="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          <span class="text-lg">←</span> 返回首页
        </button>
        <div class="flex items-center gap-3">
          <span v-if="!loading && !error && !finished" class="flex items-center gap-1.5 text-sm">
            <span class="inline-block w-2 h-2 rounded-full bg-green-400"></span>
            <span class="text-green-700 font-semibold">{{ correctCount }}</span>
            <span class="text-gray-400">/</span>
            <span class="text-red-500 font-semibold">{{ answeredCount - correctCount }}</span>
          </span>
          <span class="text-gray-500 text-sm font-medium">{{ chapterTitle }}</span>
        </div>
      </div>

      <!-- 加载中 -->
      <div v-if="loading" class="text-center py-24 text-gray-400 text-lg">
        加载中…
      </div>

      <!-- 错误 -->
      <div v-else-if="error" class="text-center py-24 text-red-400 text-lg">
        {{ error }}
      </div>

      <!-- 完成页 -->
      <div v-else-if="finished" class="bg-white rounded-2xl shadow-xl p-10 text-center">
        <div class="text-6xl mb-4">{{ score >= 80 ? '🎉' : score >= 60 ? '👍' : '📝' }}</div>
        <h2 class="text-2xl font-bold text-gray-800 mb-1">{{ chapterTitle }}</h2>
        <p class="text-gray-400 text-sm mb-6">练习完成</p>

        <!-- 环形进度区域 -->
        <div class="flex justify-center gap-8 mb-8">
          <div class="flex flex-col items-center">
            <span class="text-4xl font-bold" :class="scoreColor">{{ score }}%</span>
            <span class="text-gray-500 text-sm mt-1">正确率</span>
          </div>
          <div class="w-px bg-gray-200"></div>
          <div class="flex flex-col items-center">
            <span class="text-4xl font-bold text-green-600">{{ correctCount }}</span>
            <span class="text-gray-500 text-sm mt-1">答对</span>
          </div>
          <div class="w-px bg-gray-200"></div>
          <div class="flex flex-col items-center">
            <span class="text-4xl font-bold text-red-500">{{ questions.length - correctCount }}</span>
            <span class="text-gray-500 text-sm mt-1">答错</span>
          </div>
        </div>

        <!-- 得分条 -->
        <div class="w-full bg-gray-100 rounded-full h-3 mb-8 overflow-hidden">
          <div class="h-3 rounded-full transition-all duration-700" :class="scoreColor.replace('text-', 'bg-')" :style="{ width: score + '%' }"></div>
        </div>

        <div class="flex justify-center gap-4">
          <button
            @click="restart"
            class="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            重新练习
          </button>
          <button
            @click="goHome"
            class="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
          >
            返回首页
          </button>
        </div>
      </div>

      <!-- 刷题主体 -->
      <div v-else>
        <!-- 进度条 -->
        <div class="mb-4">
          <div class="flex justify-between text-sm text-gray-500 mb-1">
            <span>第 {{ currentIndex + 1 }} / {{ questions.length }} 题</span>
            <span class="font-medium">已答 {{ answeredCount }} 题 · 正确 {{ correctCount }} 题</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div class="h-2.5 rounded-full transition-all duration-500 flex">
              <div class="bg-green-400 h-full transition-all duration-500" :style="{ width: (correctCount / questions.length * 100) + '%' }"></div>
              <div class="bg-red-400 h-full transition-all duration-500" :style="{ width: ((answeredCount - correctCount) / questions.length * 100) + '%' }"></div>
            </div>
          </div>
        </div>

        <!-- 题目卡片 -->
        <div class="bg-white rounded-2xl shadow-xl p-8">

          <!-- 题型标签 -->
          <span class="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4"
            :class="typeTagClass">
            {{ typeLabel }}
          </span>

          <!-- 题目内容 -->
          <p class="text-gray-800 text-lg font-medium mb-6 leading-relaxed">
            {{ current.content }}
          </p>

          <!-- 选择题 -->
          <div v-if="current.type === 'choice'" class="space-y-3">
            <button
              v-for="opt in current.options"
              :key="opt"
              @click="selectChoice(opt[0])"
              :disabled="answered"
              :class="choiceClass(opt[0])"
              class="w-full text-left px-5 py-3 rounded-xl border-2 font-medium transition-all duration-200"
            >
              {{ opt }}
            </button>
          </div>

          <!-- 判断题 -->
          <div v-else-if="current.type === 'judge'" class="flex gap-4">
            <button
              @click="selectJudge(true)"
              :disabled="answered"
              :class="judgeClass(true)"
              class="flex-1 py-4 rounded-xl border-2 font-semibold text-lg transition-all duration-200"
            >
              ✓ 正确
            </button>
            <button
              @click="selectJudge(false)"
              :disabled="answered"
              :class="judgeClass(false)"
              class="flex-1 py-4 rounded-xl border-2 font-semibold text-lg transition-all duration-200"
            >
              ✕ 错误
            </button>
          </div>

          <!-- 填空题 -->
          <div v-else-if="current.type === 'fill'" class="space-y-3">
            <div
              v-for="(_, i) in fillAnswers"
              :key="i"
              class="flex items-center gap-3"
            >
              <span class="text-gray-500 text-sm w-12 shrink-0">第{{ i + 1 }}空</span>
              <input
                v-model="fillAnswers[i]"
                :disabled="answered"
                :class="fillInputClass(i)"
                class="flex-1 border-2 rounded-xl px-4 py-2 text-gray-800 outline-none transition-all"
                placeholder="请输入答案"
                @keydown.enter="submitFill"
              />
            </div>
            <button
              v-if="!answered"
              @click="submitFill"
              class="mt-2 px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              提交
            </button>
          </div>

          <!-- 答题反馈 -->
          <div v-if="answered" class="mt-6">
            <div
              class="flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-base mb-3"
              :class="isCorrect ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'"
            >
              <span>{{ isCorrect ? '✓ 回答正确' : '✗ 回答错误' }}</span>
              <span v-if="!isCorrect" class="font-normal text-sm ml-2">
                正确答案：{{ correctAnswerLabel }}
              </span>
            </div>
            <div v-if="current.explanation" class="bg-blue-50 text-blue-700 rounded-xl px-4 py-3 text-sm leading-relaxed">
              <span class="font-semibold">解析：</span>{{ current.explanation }}
            </div>
          </div>

          <!-- 下一题 / 完成 -->
          <div v-if="answered" class="mt-6 flex justify-end">
            <button
              @click="nextQuestion"
              class="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow"
            >
              {{ currentIndex + 1 < questions.length ? '下一题 →' : '查看结果' }}
            </button>
          </div>

        </div>
      </div>

    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export default {
  name: 'QuizView',
  setup() {
    const route = useRoute()
    const router = useRouter()

    const loading = ref(true)
    const error = ref(null)
    const chapterTitle = ref('')
    const questions = ref([])
    const currentIndex = ref(0)
    const answered = ref(false)
    const isCorrect = ref(false)
    const selectedChoice = ref(null)
    const selectedJudge = ref(null)
    const fillAnswers = ref([])
    const finished = ref(false)
    const correctCount = ref(0)
    const answeredCount = ref(0)

    const current = computed(() => questions.value[currentIndex.value] ?? null)

    const typeLabel = computed(() => {
      if (!current.value) return ''
      return { choice: '单选题', judge: '判断题', fill: '填空题' }[current.value.type] ?? '题目'
    })

    const typeTagClass = computed(() => {
      if (!current.value) return ''
      return {
        choice: 'bg-blue-100 text-blue-700',
        judge: 'bg-purple-100 text-purple-700',
        fill: 'bg-amber-100 text-amber-700'
      }[current.value.type] ?? 'bg-gray-100 text-gray-600'
    })

    /** 从路由参数动态加载章节数据 */
    onMounted(async () => {
      const chapterId = route.params.chapterId
      try {
        const chapRes = await fetch(`${import.meta.env.BASE_URL}data/chapters.json`)
        const chapData = await chapRes.json()
        const chapter = chapData.chapters.find(c => String(c.id) === String(chapterId))
        if (!chapter) throw new Error('找不到该章节')
        chapterTitle.value = chapter.title

        const qRes = await fetch(`${import.meta.env.BASE_URL}data/${chapter.file}`)
        const qData = await qRes.json()
        questions.value = qData.questions ?? []
        if (questions.value.length === 0) throw new Error('该章节暂无题目')

        initQuestion()
      } catch (e) {
        error.value = e.message
      } finally {
        loading.value = false
      }
    })

    function initQuestion() {
      answered.value = false
      isCorrect.value = false
      selectedChoice.value = null
      selectedJudge.value = null
      const q = questions.value[currentIndex.value]
      if (q?.type === 'fill') {
        const blankCount = Array.isArray(q.answer) ? q.answer.length : 1
        fillAnswers.value = Array(blankCount).fill('')
      } else {
        fillAnswers.value = []
      }
    }

    // --- 选择题 ---
    function selectChoice(letter) {
      if (answered.value) return
      selectedChoice.value = letter
      answered.value = true
      answeredCount.value++
      isCorrect.value = letter === current.value.answer
      if (isCorrect.value) correctCount.value++
    }

    function choiceClass(letter) {
      if (!answered.value) {
        return 'border-gray-200 text-gray-700 hover:border-blue-400 hover:bg-blue-50'
      }
      const correct = current.value.answer
      if (letter === correct) return 'border-green-400 bg-green-50 text-green-800'
      if (letter === selectedChoice.value) return 'border-red-400 bg-red-50 text-red-700'
      return 'border-gray-200 text-gray-400'
    }

    // --- 判断题 ---
    function selectJudge(val) {
      if (answered.value) return
      selectedJudge.value = val
      answered.value = true
      answeredCount.value++
      isCorrect.value = val === current.value.answer
      if (isCorrect.value) correctCount.value++
    }

    function judgeClass(val) {
      if (!answered.value) {
        return 'border-gray-200 text-gray-700 hover:border-blue-400 hover:bg-blue-50'
      }
      const correct = current.value.answer
      if (val === correct) return 'border-green-400 bg-green-50 text-green-800'
      if (val === selectedJudge.value) return 'border-red-400 bg-red-50 text-red-700'
      return 'border-gray-200 text-gray-400'
    }

    // --- 填空题 ---
    function submitFill() {
      if (answered.value) return
      answered.value = true
      const expected = Array.isArray(current.value.answer)
        ? current.value.answer
        : [current.value.answer]
      const allCorrect = expected.every(
        (ans, i) => (fillAnswers.value[i] ?? '').trim() === String(ans).trim()
      )
      answeredCount.value++
      isCorrect.value = allCorrect
      if (allCorrect) correctCount.value++
    }

    function fillInputClass(i) {
      if (!answered.value) return 'border-gray-300 focus:border-blue-400'
      const expected = Array.isArray(current.value.answer)
        ? current.value.answer
        : [current.value.answer]
      const correct = (fillAnswers.value[i] ?? '').trim() === String(expected[i] ?? '').trim()
      return correct ? 'border-green-400 bg-green-50' : 'border-red-400 bg-red-50'
    }

    // --- 显示正确答案 ---
    const correctAnswerLabel = computed(() => {
      if (!current.value) return ''
      const q = current.value
      if (q.type === 'choice') return q.answer
      if (q.type === 'judge') return q.answer ? '正确' : '错误'
      if (q.type === 'fill') {
        const ans = Array.isArray(q.answer) ? q.answer : [q.answer]
        return ans.join(' / ')
      }
      return ''
    })

    // --- 下一题 ---
    function nextQuestion() {
      if (currentIndex.value + 1 < questions.value.length) {
        currentIndex.value++
        initQuestion()
      } else {
        finished.value = true
      }
    }

    // --- 成绩 ---
    const score = computed(() =>
      questions.value.length
        ? Math.round((correctCount.value / questions.value.length) * 100)
        : 0
    )
    const scoreColor = computed(() => {
      const s = score.value
      if (s >= 80) return 'text-green-600'
      if (s >= 60) return 'text-yellow-500'
      return 'text-red-500'
    })

    function restart() {
      currentIndex.value = 0
      correctCount.value = 0
      answeredCount.value = 0
      finished.value = false
      initQuestion()
    }

    function goHome() {
      router.push('/')
    }

    return {
      loading, error, chapterTitle, questions,
      currentIndex, current, answered, isCorrect,
      selectedChoice, selectedJudge, fillAnswers, finished, correctCount, answeredCount,
      typeLabel, typeTagClass, correctAnswerLabel, score, scoreColor,
      selectChoice, choiceClass, selectJudge, judgeClass, submitFill, fillInputClass,
      nextQuestion, restart, goHome
    }
  }
}
</script>
