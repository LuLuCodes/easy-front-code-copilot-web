<!--
 * @Author: leyi leyi@myun.info
 * @Date: 2023-06-21 18:21:40
 * @LastEditors: leyi leyi@myun.info
 * @LastEditTime: 2023-06-21 19:47:11
 * @FilePath: /easy-front-code-copilot-web/src/App.vue
 * @Description: 
 * 
 * Copyright (c) 2023 by ${git_name_email}, All Rights Reserved. 
-->
<script setup>
import { ref } from 'vue'
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

const locale = ref(zhCn)
</script>

<template>
  <el-config-provider :locale="locale">
    <router-view />
  </el-config-provider>
</template>

<style lang="scss">
@use '@/assets/style/common.scss';
</style>
