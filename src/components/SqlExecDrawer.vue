<template>
  <el-drawer
    :model-value="drawer"
    @close="updateDrawer(false)"
    title="执行SQL"
    direction="rtl"
    size="60%"
  >
    <p>
      <span class="c-secondary">连接：</span> <span class="icon icon-mysql"></span>
      <span>{{ curConnection.database }}</span>
    </p>
    <el-alert
      title="当前语句可能是非 SELECT SQL，这将导致数据库模式或数据变化。（非SELECT语句不会自动执行）"
      :closable="false"
      show-icon
      type="warning"
      v-show="showAlert"
    />
    <div class="bd-1 pt6 pb6 pl10 pr10 border-radius-4 mt10 mb10 flex all-c">
      <p class="flex-1">{{ execSqlContent }}</p>
      <span
        class="pointer icon icon-play f18 ml20 c-primary"
        @click.prevent.stop="hanlderExecSql"
      ></span>
    </div>

    <div class="bd-1 border-radius-4 action-table" v-if="showTable">
      <el-table :data="tableData" height="1000" style="width: 100%" empty-text="暂无数据">
        <el-table-column
          v-for="column of tableColumns"
          :key="column.name"
          :prop="column.name"
          :label="column.name"
          :sortable="column.sortable"
        />
      </el-table>
    </div>

    <el-result
      v-if="!showTable"
      :icon="execResult.type"
      :title="execResult.title"
      :sub-title="execResult.sub_title"
    >
    </el-result>
  </el-drawer>
</template>

<script setup>
import { ref, reactive, toRef, watch, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useConnectionStore } from '@/store'
import { head } from 'lodash-es'

const connectionStore = useConnectionStore()
const { sqlExec } = connectionStore
const { curConnection, curConnectionId } = storeToRefs(connectionStore)

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  execSqlContent: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const drawer = toRef(props, 'modelValue')

const updateDrawer = (val) => {
  emit('update:modelValue', val)
}

const showAlert = ref(false)
const showTable = ref(false)
const execing = ref(false)
const execResult = reactive({
  type: 'info',
  title: '暂无结果',
  sub_title: ''
})

const tableColumns = reactive([])

const tableData = reactive([])
const isSelectSql = computed(() => {
  return props.execSqlContent.toUpperCase().startsWith('SELECT')
})

watch(
  () => props.execSqlContent,
  async (newValue) => {
    tableColumns.splice(0, tableColumns.length)
    tableData.splice(0, tableData.length)
    showAlert.value = false
    if (newValue) {
      if (!isSelectSql.value) {
        showAlert.value = true
      } else {
        await hanlderExecSql()
      }
    }
  },
  { immediate: true }
)

const hanlderExecSql = async () => {
  try {
    execing.value = true
    showTable.value = false
    const rawResults = await sqlExec({
      connectionId: curConnectionId.value,
      exec_sql: props.execSqlContent
    })
    if (isSelectSql.value) {
      tableColumns.splice(0, tableColumns.length)
      tableData.splice(0, tableData.length)
      tableData.push(...rawResults)
      tableColumns.push(
        ...Object.keys(head(tableData) || {}).map((key) => {
          return {
            name: key,
            sortable: true
          }
        })
      )
      showTable.value = true
    } else {
      execResult.type = 'success'
      execResult.title = '执行成功'
      if (rawResults && rawResults.length) {
        execResult.sub_title = `影响行数：${rawResults[0].affectedRows}`
      } else {
        execResult.sub_title = ''
      }
    }
  } catch (error) {
    execResult.type = 'error'
    execResult.title = '执行失败'
    execResult.sub_title = error.message
  } finally {
    execing.value = false
  }
}
</script>

<style lang="scss" scoped>
.action-table {
  border-bottom: 0 !important;
}
.action-table :deep(.el-table) {
  border-radius: 4px;
}
</style>
