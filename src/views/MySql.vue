<template>
  <section class="page flex all-s">
    <div class="flex-1">
      <div class="chat-body">
        <div class="flex all-c h50p pl24 pr24 bd-b1 space-b">
          <h4 class="f18">{{ curConversation && curConversation.title }}</h4>
          <ToggleTheme></ToggleTheme>
        </div>
        <div class="chat-content pt30 pb30">
          <el-scrollbar ref="messageScrollbarRef">
            <template v-for="message in conversationMessageList" :key="message.id">
              <Message :message="message" :conversation="curConversation"></Message>
            </template>
          </el-scrollbar>
        </div>
        <div class="chat-input-wrap mb30 flex all-c">
          <el-input
            v-model="inputPrompt"
            ref="inputPromptRef"
            class="flex-1"
            type="textarea"
            placeholder="请输入你的问题..."
            clearable
            :readonly="promptSending"
            @keyup.enter="handlerSubmit"
          />
          <el-popover :visible="sqlPopupVisible" trigger="click" placement="top" :width="540">
            <div class="pl10 pr10">
              <h3 class="f14"><b>设置</b></h3>
              <h4 class="f14 mt20 mb10">语言模型</h4>
              <div>
                <el-select placeholder="" v-model="sqlModelName">
                  <el-option
                    v-for="item in modelList"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </div>
              <div class="mt40 mb10">
                <el-button type="primary" class="w100" @click.prevent.stop="sqlPopupVisible = false"
                  >确认</el-button
                >
              </div>
            </div>
            <template #reference>
              <span
                @click="sqlPopupVisible = true"
                class="icon icon-shezhi f18 ml10 mr10 pointer"
              ></span>
            </template>
          </el-popover>
          <el-tooltip class="box-item" effect="dark" content="重新生成" placement="top">
            <span class="icon icon-shuaxin f18 ml10 mr10 pointer"></span>
          </el-tooltip>
          <el-tooltip class="box-item" effect="dark" content="清除输入" placement="top">
            <span
              class="icon icon-qingchu f18 ml10 mr10 pointer"
              @click.prevent.stop="inputPrompt = ''"
            ></span>
          </el-tooltip>
          <span
            class="icon icon-back pointer f20 ml10 mr6"
            @click.prevent.stop="handlerSubmit"
          ></span>
        </div>
      </div>
    </div>

    <!-- 修改数据库连接属性弹窗    -->
    <ConnectionEditDialog
      v-model="showConnectionEditDialog"
      :editConnectionId="editConnectionId"
    ></ConnectionEditDialog>

    <!-- 右侧弹出执行窗口 -->
    <SqlExecDrawer v-model="showExecSqlDrawer" :execSqlContent="execSqlContent"></SqlExecDrawer>
  </section>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick, watch } from 'vue'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import {
  generateUUID,
  CreatorRole,
  countTextTokens,
  sqlBot,
  MessageStatus,
  sendMessagesToOpenAi,
  safetyParseJson
} from '@/utils'

import ConnectionEditDialog from '@/components/ConnectionEditDialog.vue'
import Message from '@/components/Message.vue'
import ToggleTheme from '@/components/ToggleTheme.vue'
import SqlExecDrawer from '@/components/SqlExecDrawer.vue'

import { storeToRefs } from 'pinia'
import { useConnectionStore, useSqlConversationStore, useSqlMessageStore } from '@/store'
import { useCopyCode } from '@/hooks/useCopyCode'
import { useExecCode } from '@/hooks/useExecCode'

const MAX_TOKENS = 4000

const showConnectionEditDialog = ref(false)
const showExecSqlDrawer = ref(false)

const dbTables = reactive([])

const inputPrompt = ref('')
const inputPromptRef = ref(null)
const promptSending = ref(false)

const messageScrollbarRef = ref(null)
const sqlPopupVisible = ref(false)
const editConnectionId = ref('')

const tableLoading = ref(false)
const selectedTableList = ref([])

const execSqlContent = ref('')

const connectionStore = useConnectionStore()
const { updateTableName, getTableStructureBatch } = connectionStore
const { curConnectionId } = storeToRefs(connectionStore)

const conversationStore = useSqlConversationStore()
const { createConversation, updateConversation } = conversationStore
const { curConversationId, curConversation } = storeToRefs(conversationStore)

const messageStore = useSqlMessageStore()
const { addMessage, updateMessage } = messageStore
const { messageList } = storeToRefs(messageStore)

const conversationMessageList = computed(() => {
  return messageList.value.filter((message) => message.conversationId === curConversationId.value)
})

const handlerExecSql = async ({ sql }) => {
  execSqlContent.value = sql
  showExecSqlDrawer.value = true
}

useCopyCode()
useExecCode(handlerExecSql)
onMounted(() => {
  scrollToMessageListBottom()
})

watch(
  curConnectionId,
  async (newValue) => {
    dbTables.splice(0, dbTables.length)
    if (newValue) {
      tableLoading.value = true
      const tables = await updateTableName(newValue)

      dbTables.push(
        ...tables.map((table) => {
          return {
            value: table.table_name,
            label: table.table_name
          }
        })
      )

      tableLoading.value = false
    }
  },
  { immediate: true }
)

const scrollToMessageListBottom = () => {
  const scrollbar_view = messageScrollbarRef.value.$el.querySelector('.el-scrollbar__view')
  if (scrollbar_view.scrollHeight > 800) {
    messageScrollbarRef.value.setScrollTop(scrollbar_view.scrollHeight)
  }
}

const handlerSubmit = async () => {
  if (!inputPrompt.value) {
    ElMessage({
      message: '请输入你的问题.',
      type: 'warning'
    })
    return
  }

  if (!curConnectionId.value) {
    ElMessage({
      message: '请选择一个数据库.',
      type: 'warning'
    })
    return
  }
  inputPromptRef.value.blur()
  promptSending.value = true

  if (selectedTableList.value.length === 0) {
    ElMessage({
      message: '未指定库表，为节省token，将强制使用gpt3.5.',
      type: 'warning'
    })
  }

  let curConversationId = ''
  const inputContent = inputPrompt.value.trim()
  if (!curConversation.value) {
    curConversationId = createConversation(inputContent)
  } else {
    curConversationId = curConversation.value.id
    updateConversation(curConversation.value.id, { title: inputContent })
  }
  const userMessage = {
    id: generateUUID(),
    conversationId: curConversationId,
    creatorRole: CreatorRole.User,
    createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    content: inputContent,
    status: MessageStatus.DONE
  }

  let tokens = countTextTokens(inputContent)

  const tableNameList = []
  let systemPrompt = sqlBot.getPrompt()
  if (selectedTableList.value.length === 0) {
    tableNameList.push(...dbTables.map((table) => table.value))
  } else {
    tableNameList.push(...selectedTableList.value)
  }
  if (tableNameList.length) {
    const tableSchemaList = await getTableStructureBatch({
      connectionId: curConnectionId.value,
      tableNameList
    })
    let schema = ''
    if (tableSchemaList && tableSchemaList.length) {
      for (const table of tableSchemaList) {
        if (tokens < MAX_TOKENS / 2) {
          tokens += countTextTokens(schema + table)
          schema += table.structure
        }
      }
      systemPrompt = sqlBot.getPrompt(schema)
    }
  }

  // let usageMessageList = []
  const formatedMessageList = []
  for (let i = conversationMessageList.value.length - 1; i >= 0; i--) {
    const message = conversationMessageList.value[i]
    if (message.status === MessageStatus.DONE && message.content && !message.isWrong) {
      if (tokens < MAX_TOKENS) {
        tokens += countTextTokens(message.content)
        formatedMessageList.unshift({
          role: message.creatorRole,
          content: message.content
        })
      }
    }
  }
  addMessage(userMessage)

  // Add the db prompt as the first context.
  formatedMessageList.unshift({
    role: CreatorRole.System,
    content: systemPrompt
  })
  // Add the user prompt as the last context.
  formatedMessageList.push({
    role: CreatorRole.User,
    content: inputContent
  })
  inputPrompt.value = ''
  const assistantMessage = {
    id: generateUUID(),
    conversationId: curConversationId,
    creatorRole: CreatorRole.Assistant,
    createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    content: '',
    status: 'LOADING',
    isWrong: false
  }
  addMessage(assistantMessage)
  nextTick(() => {
    scrollToMessageListBottom()
  })

  try {
    const responseData = await sendMessagesToOpenAi({
      modelName: selectedTableList.value.length > 0 ? 'gpt-3.5-turbo' : 'gpt-3.5-turbo',
      messages: formatedMessageList
    })

    const reader = responseData.getReader()
    const decoder = new TextDecoder('utf-8')
    let done = false
    let reader_content = ''
    let message = ''
    let parsed = null
    while (!done) {
      const { value, done: readerDone } = await reader.read()
      if (value) {
        const data = decoder.decode(value)
        const lines = data
          .toString()
          .split('\n')
          .filter((line) => line.trim() !== '')

        for (const line of lines) {
          message += line.replace(/^data: /, '')
          if (message === '[DONE]') {
            break
          }
          parsed = safetyParseJson(message)
          if (parsed) {
            if (parsed.code) {
              throw new Error(parsed.msg)
            }
            const { delta, finish_reason } = parsed.choices[0]
            if (finish_reason === 'stop') {
              break
            }
            const { content } = delta
            if (content) {
              reader_content = reader_content + content
              updateMessage(assistantMessage.id, {
                content: reader_content
              })
            }
            parsed = null
            message = ''
          }
          nextTick(() => {
            scrollToMessageListBottom()
          })
        }
      }
      done = readerDone
    }
    updateMessage(assistantMessage.id, {
      status: 'DONE'
    })
  } catch (error) {
    updateMessage(assistantMessage.id, {
      content: error.message,
      status: 'DONE',
      isWrong: true
    })
  } finally {
    promptSending.value = false
    nextTick(() => {
      scrollToMessageListBottom()
    })
  }
}
</script>

<style lang="scss" scoped>
.chat-nav-wrap {
  width: 260px;
  box-sizing: border-box;
}
.chat-nav-wrap h2 {
  max-height: 62px;
  overflow: hidden;
}
.chat-nav-scroll {
  height: calc(100vh - 108px);
  overflow: hidden;
}
.chat-list-wrap > div {
  padding: 10px 16px;
  border-radius: 4px;
  margin-bottom: 6px;
  cursor: pointer;
}
.chat-list-wrap > div .icon-more {
  visibility: hidden;
}
.chat-list-wrap > div:hover .icon-more {
  visibility: visible;
}
.chat-content {
  height: calc(100vh - 182px);
  max-width: 76%;
  margin: 0 auto;
  overflow: hidden;
  box-sizing: border-box;
}

.chat-input-wrap :deep(.el-input__wrapper) {
  background: transparent;
  border: 0;
  box-shadow: none;
}
.chat-input-wrap :deep(.el-input__inner) {
  background: transparent;
  border: 0;
}
.chat-input-wrap .icon-back {
  width: 40px;
  height: 40px;
  color: #fff;
  line-height: 40px;
  text-align: center;
  background: linear-gradient(180deg, #a337fc 0%, #5e15f0 100%);
  border-radius: 8px;
}
</style>
