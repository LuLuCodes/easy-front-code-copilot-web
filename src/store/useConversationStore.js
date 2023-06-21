import { ref, reactive, computed } from 'vue'
import { defineStore } from 'pinia'
import { generateUUID } from '@/utils'

export const GeneralChatBotId = 'general-chat-bot'
export const SQLChatBotId = 'sql-chat-bot'
export const DrawerChatBotId = 'drawer-chat-bot'
const DefaultConversationTitle = 'New Conversation'

const getDefaultConversation = (title, assistantId) => {
  return {
    id: generateUUID(),
    assistantId,
    title: title || DefaultConversationTitle,
    createdAt: Date.now()
  }
}

export const useGeneralConversationStore = defineStore(
  'general-conversation-store',
  () => {
    let conversationList = reactive([])
    let curConversationId = ref('')

    function createConversation(title) {
      const conversation = {
        ...getDefaultConversation(title, GeneralChatBotId)
      }
      conversationList.push(conversation)
      window.localStorage.setItem('general-conversation-list', JSON.stringify(conversationList))
      curConversationId.value = conversation.id
      return conversation.id
    }

    function getConversationById(conversationId) {
      return conversationList.find((item) => item.id === conversationId)
    }

    function setCurConversationById(conversationId) {
      curConversationId.value = conversationId
    }

    function delConversationById(conversationId) {
      const index = conversationList.findIndex((item) => item.id === conversationId)
      if (index > -1) {
        conversationList.splice(index, 1)
      }
      window.localStorage.setItem('general-conversation-list', JSON.stringify(conversationList))
      if (conversationList.length > 0) {
        curConversationId.value = conversationList[0].id
      } else {
        curConversationId.value = ''
      }
    }

    function updateConversation(conversationId, updatePayload) {
      const conversation = getConversationById(conversationId)
      if (conversation) {
        if (conversation.title !== DefaultConversationTitle) {
          delete updatePayload.title
        }
        Object.assign(conversation, updatePayload)
      }
    }

    const curConversation = computed(() => {
      return getConversationById(curConversationId.value)
    })

    return {
      createConversation,
      getConversationById,
      setCurConversationById,
      delConversationById,
      updateConversation,
      conversationList,
      curConversationId,
      curConversation
    }
  },
  {
    persist: {
      paths: ['curConversationId'],
      afterRestore: (ctx) => {
        const storageCache = window.localStorage.getItem('general-conversation-list')
        if (storageCache) {
          ctx.store.conversationList.push(...JSON.parse(storageCache))
        }
      }
    }
  }
)

export const useSqlConversationStore = defineStore(
  'sql-conversation',
  () => {
    let conversationList = reactive([])
    let curConversationId = ref('')

    function createConversation(title) {
      const conversation = {
        ...getDefaultConversation(title, SQLChatBotId)
      }
      conversationList.push(conversation)
      window.localStorage.setItem('sql-conversation-list', JSON.stringify(conversationList))
      curConversationId.value = conversation.id
      return conversation.id
    }

    function getConversationById(conversationId) {
      return conversationList.find((item) => item.id === conversationId)
    }

    function setCurConversationById(conversationId) {
      curConversationId.value = conversationId
    }

    function delConversationById(conversationId) {
      const index = conversationList.findIndex((item) => item.id === conversationId)
      if (index > -1) {
        conversationList.splice(index, 1)
      }
      window.localStorage.setItem('sql-conversation-list', JSON.stringify(conversationList))
      if (conversationList.length > 0) {
        curConversationId.value = conversationList[0].id
      } else {
        curConversationId.value = ''
      }
    }

    function updateConversation(conversationId, updatePayload) {
      const conversation = getConversationById(conversationId)
      if (conversation) {
        if (conversation.title !== DefaultConversationTitle) {
          delete updatePayload.title
        }
        Object.assign(conversation, updatePayload)
      }
    }

    const curConversation = computed(() => {
      return getConversationById(curConversationId.value)
    })

    return {
      createConversation,
      getConversationById,
      setCurConversationById,
      delConversationById,
      updateConversation,
      conversationList,
      curConversationId,
      curConversation
    }
  },
  {
    persist: {
      paths: ['curConversationId'],
      afterRestore: (ctx) => {
        const storageCache = window.localStorage.getItem('sql-conversation-list')
        if (storageCache) {
          ctx.store.conversationList.push(...JSON.parse(storageCache))
        }
      }
    }
  }
)
