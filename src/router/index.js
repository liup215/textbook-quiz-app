import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import QuizView from '../views/QuizView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/quiz/:chapterId',
    name: 'quiz',
    component: QuizView
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router