import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: { name: 'chat' }
  },
  {
    path: '/mysql',
    name: 'mysql',
    component: () => import('@/views/MySql.vue')
  },
  {
    path: '/chat',
    name: 'chat',
    meta: { requiresAuth: false },
    component: () => import('@/views/Chat.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})
export default router
