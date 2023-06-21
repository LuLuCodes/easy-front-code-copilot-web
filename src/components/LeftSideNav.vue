<template>
  <div class="side-nav-wrap txt-c pt28">
    <h1 class="f0"><img src="@/assets/images/common/logo.png" width="45" alt="" /></h1>
    <div class="side-nav pt20">
      <el-scrollbar>
        <ul>
          <el-tooltip effect="dark" content="AI聊天" placement="left"
            ><li @click="navigateTo('/chat')" :class="{ on: currentPath === '/chat' }">
              <span class="icon icon-ie-ChatGPT"></span></li
          ></el-tooltip>
          <el-tooltip effect="dark" content="AI数据库" placement="left"
            ><li @click="navigateTo('/mysql')" :class="{ on: currentPath === '/mysql' }">
              <span class="icon icon-mysql"></span></li
          ></el-tooltip>

          <!-- <li><span class="icon icon-SQLServer f22"></span></li>
          <li><span class="icon icon-postgresql f22"></span></li> -->

          <el-tooltip effect="dark" content="AI作图" placement="left"
            ><li @click="navigateTo('/drawer')" :class="{ on: currentPath === '/drawer' }">
              <span class="icon icon-image1 f18"></span></li
          ></el-tooltip>
        </ul>
      </el-scrollbar>
    </div>
    <div class="flex all-c switch-light ml12 mr12 bd-t1 pointer" @click="toggleTheme()">
      <span v-show="!isDark" class="icon icon-day-fill f18"></span>
      <span v-show="isDark" class="icon icon-night-fill f18"></span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToggle } from '@vueuse/shared'
import { useDark } from '@vueuse/core'

const route = useRoute()
const router = useRouter()
const currentPath = computed(() => route.path)
const navigateTo = (path) => {
  router.push(path)
}

const isDark = useDark({
  // 存储到localStorage/sessionStorage中的Key 根据自己的需求更改
  storageKey: 'useDarkKey',
  // 暗黑class名字
  valueDark: 'dark',
  // 高亮class名字
  valueLight: 'light'
})

const toggleTheme = useToggle(isDark)
</script>

<style lang="scss" scoped>
.switch-light {
  height: 50px;
  box-sizing: border-box;
}
.side-nav {
  height: calc(100vh - 114px);
  overflow: hidden;
  box-sizing: border-box;
}
.side-nav .icon {
  font-size: 20px;
  color: var(--el-text-color-regular);
  margin: 0 auto 10px;
  display: block;
  width: 34px;
  height: 34px;
  border-radius: 8px;
  line-height: 34px;
  cursor: pointer;
}
.side-nav li {
  font-size: 20px;
}
</style>
