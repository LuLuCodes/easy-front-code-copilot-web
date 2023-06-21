import { createApp } from 'vue'
import router from './router'
import { setupRouterGuard } from './router/guard'
import App from './App.vue'
import '@/assets/style/index.scss'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css' //样式
import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'

const pinia = createPinia()

pinia.use(
  createPersistedState({
    storage: localStorage
  })
)

const app = createApp(App)
//创建v-highlight全局指令
app.directive('highlight', function (el) {
  let blocks = el.querySelectorAll('code')
  blocks.forEach((block) => {
    hljs.highlightBlock(block)
  })
})

app.use(router).use(pinia).mount('#app')
setupRouterGuard(router)
