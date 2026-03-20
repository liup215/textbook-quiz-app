<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
    <div class="max-w-4xl mx-auto">
      <!-- 标题 -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-800 mb-4">教材刷题软件</h1>
        <p class="text-gray-600 text-lg">选择章节开始学习和练习</p>
      </div>

      <!-- 章节卡片列表 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          v-for="chapter in chapters"
          :key="chapter.id"
          @click="startQuiz(chapter)"
          :class="[
            'rounded-xl p-6 shadow-lg transform transition-all duration-200 hover:scale-105 cursor-pointer',
            chapter.enabled 
              ? 'bg-white border-2 border-blue-200 hover:border-blue-300 hover:shadow-xl' 
              : 'bg-gray-100 border-2 border-gray-200 opacity-60 cursor-not-allowed'
          ]"
        >
          <div class="flex items-start justify-between mb-3">
            <h2 class="text-xl font-semibold text-gray-800">{{ chapter.title }}</h2>
            <span 
              :class="[
                'px-3 py-1 rounded-full text-sm font-medium',
                chapter.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'
              ]"
            >
              {{ chapter.questionCount }}题
            </span>
          </div>
          <p class="text-gray-600 text-sm mb-4">{{ chapter.description }}</p>
          <div 
            :class="[
              'text-right text-sm font-medium',
              chapter.enabled ? 'text-blue-600' : 'text-gray-400'
            ]"
          >
            {{ chapter.enabled ? '点击开始' : '暂未开放' }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'HomeView',
  setup() {
    const router = useRouter()
    const chapters = ref([])

    onMounted(async () => {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}data/chapters.json`)
        const data = await response.json()
        chapters.value = data.chapters
      } catch (error) {
        console.error('加载章节数据失败:', error)
      }
    })

    const startQuiz = (chapter) => {
      if (chapter.enabled) {
        router.push({ name: 'quiz', params: { chapterId: chapter.id } })
      }
    }

    return {
      chapters,
      startQuiz
    }
  }
}
</script>
