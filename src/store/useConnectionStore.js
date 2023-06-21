import { ref, reactive, computed } from 'vue'
import { defineStore } from 'pinia'
import api from '@/api'
import { ElMessage } from 'element-plus'

export const useConnectionStore = defineStore(
  'connection-store',
  () => {
    let connectionList = reactive([])
    let curConnectionId = ref('')

    function addConnection(connection) {
      connectionList.push(connection)
      window.localStorage.setItem('connection-list', JSON.stringify(connectionList))
      setCurConnectionById(connection.id)
    }

    function getConnectionById(connectionId) {
      return connectionList.find((item) => item.id === connectionId)
    }

    function setCurConnectionById(connectionId) {
      curConnectionId.value = connectionId
    }

    function updateConnection(connectionId, updatePayload) {
      const connection = getConnectionById(connectionId)
      if (connection) {
        Object.assign(connection, updatePayload)
        window.localStorage.setItem('connection-list', JSON.stringify(connectionList))
      }
    }

    function delConnectionById(connectionId) {
      const index = connectionList.findIndex((item) => item.id === connectionId)
      if (index > -1) {
        connectionList.splice(index, 1)
      }
      window.localStorage.setItem('connection-list', JSON.stringify(connectionList))
      setCurConnectionById(connectionList.length > 0 ? connectionList[0].id : '')
    }

    const curConnection = computed(() => {
      return getConnectionById(curConnectionId.value)
    })

    const testConnection = async (params) => {
      try {
        await api.post({
          data: {
            db_config: params
          },
          url: '/api/db-schema/test-mysql-connect'
        })
        ElMessage({
          message: '连接成功.',
          type: 'success'
        })
        return true
      } catch (error) {
        ElMessage({
          message: error.message,
          type: 'error'
        })
      }
      return false
    }

    const updateTableName = async (connectionId) => {
      try {
        const connection = getConnectionById(connectionId)
        const tables = await api.post({
          data: {
            db_config: connection
          },
          url: '/api/db-schema/get-table-name'
        })
        return tables
      } catch (error) {
        ElMessage({
          message: error.message,
          type: 'error'
        })
      }
    }

    const getTableStructureBatch = async ({ connectionId, tableNameList }) => {
      try {
        const connection = getConnectionById(connectionId)
        const tables = await api.post({
          data: {
            db_config: connection,
            table_name_list: tableNameList
          },
          url: '/api/db-schema/get-table-structure-batch'
        })
        return tables
      } catch (error) {
        ElMessage({
          message: error.message,
          type: 'error'
        })
      }
    }

    const sqlExec = async ({ connectionId, exec_sql }) => {
      const connection = getConnectionById(connectionId)
      const data = await api.post({
        data: {
          db_config: connection,
          exec_sql
        },
        url: '/api/db-schema/exec-sql'
      })
      return data
    }

    return {
      curConnectionId,
      connectionList,
      curConnection,
      addConnection,
      updateConnection,
      getConnectionById,
      setCurConnectionById,
      delConnectionById,
      testConnection,
      updateTableName,
      getTableStructureBatch,
      sqlExec
    }
  },
  {
    persist: {
      paths: ['curConnectionId'],
      afterRestore: (ctx) => {
        const storageCache = window.localStorage.getItem('connection-list')
        if (storageCache) {
          ctx.store.connectionList.push(...JSON.parse(storageCache))
        }
      }
    }
  }
)
