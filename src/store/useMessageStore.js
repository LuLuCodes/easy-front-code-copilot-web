import { ref, reactive, computed } from 'vue'
import { defineStore } from 'pinia'
import { last } from 'lodash-es'

export const useGeneralMessageStore = defineStore(
  'general-message-store',
  () => {
    let messageList = reactive([])
    let curMessageId = ref('')

    function addMessage(message) {
      messageList.push(message)
      window.localStorage.setItem('general-message-list', JSON.stringify(messageList))
    }

    function getMessageById(messageId) {
      return messageList.find((item) => item.id === messageId)
    }

    function updateMessage(messageId, updatePayload) {
      const message = getMessageById(messageId)
      if (message) {
        Object.assign(message, updatePayload)
        window.localStorage.setItem('general-message-list', JSON.stringify(messageList))
      }
    }

    function delMessageByConversationId(conversationId) {
      const reserveMessageList = messageList.filter(
        (item) => item.conversationId !== conversationId
      )
      messageList.splice(0, messageList.length)
      messageList.push(...reserveMessageList)
      window.localStorage.setItem('general-message-list', JSON.stringify(messageList))
    }

    function delMessageById(messageId) {
      const index = messageList.findIndex((item) => item.id === messageId)
      if (index > -1) {
        messageList.splice(index, 1)
      }
      window.localStorage.setItem('general-message-list', JSON.stringify(messageList))
    }

    const lastMessage = computed(() => {
      return last(messageList)
    })
    return {
      curMessageId,
      messageList,
      lastMessage,
      addMessage,
      updateMessage,
      delMessageByConversationId,
      delMessageById
    }
  },
  {
    persist: {
      paths: ['curMessageId'],
      afterRestore: (ctx) => {
        const storageCache = window.localStorage.getItem('general-message-list')
        if (storageCache) {
          ctx.store.messageList.push(...JSON.parse(storageCache))
        }
      }
    }
  }
)

export const useSqlMessageStore = defineStore(
  'sql-message-store',
  () => {
    let messageList = reactive([])
    let curMessageId = ref('')

    function addMessage(message) {
      messageList.push(message)
      window.localStorage.setItem('sql-message-list', JSON.stringify(messageList))
    }

    function getMessageById(messageId) {
      return messageList.find((item) => item.id === messageId)
    }

    function updateMessage(messageId, updatePayload) {
      const message = getMessageById(messageId)
      if (message) {
        Object.assign(message, updatePayload)
        window.localStorage.setItem('sql-message-list', JSON.stringify(messageList))
      }
    }

    function delMessageByConversationId(conversationId) {
      const reserveMessageList = messageList.filter(
        (item) => item.conversationId !== conversationId
      )
      messageList.splice(0, messageList.length)
      messageList.push(...reserveMessageList)
      window.localStorage.setItem('sql-message-list', JSON.stringify(messageList))
    }

    function delMessageById(messageId) {
      const index = messageList.findIndex((item) => item.id === messageId)
      if (index > -1) {
        messageList.splice(index, 1)
      }
      window.localStorage.setItem('sql-message-list', JSON.stringify(messageList))
    }

    const lastMessage = computed(() => {
      return last(messageList)
    })
    return {
      curMessageId,
      messageList,
      lastMessage,
      addMessage,
      updateMessage,
      delMessageByConversationId,
      delMessageById
    }
  },
  {
    persist: {
      paths: ['curMessageId'],
      afterRestore: (ctx) => {
        const storageCache = window.localStorage.getItem('sql-message-list')
        if (storageCache) {
          ctx.store.messageList.push(...JSON.parse(storageCache))
        }
      }
    }
  }
)
