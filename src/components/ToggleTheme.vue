<template>
  <div class="flex all-c switch-light ml12 mr12 pointer" @click="toggleTheme()">
    <span v-show="!isDark" class="icon icon-day-fill f18"></span>
    <span v-show="isDark" class="icon icon-night-fill f18"></span>
  </div>
</template>

<script setup>
import { useToggle } from '@vueuse/shared'
import { useDark } from '@vueuse/core'

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
