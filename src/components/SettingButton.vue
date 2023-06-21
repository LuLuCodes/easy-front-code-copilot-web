<template>
  <span class="icon icon-shezhi f18 pointer" @click="navigateToSetting"></span>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
const navigateToSetting = () => {
  router.push('/setting')
}
</script>

<style lang="scss" scoped></style>
