import { onMounted, onUpdated } from 'vue'
import { SQLChatBotId } from '@/store'

export function useExecCode(fn) {
  function execCodeBlock() {
    const codeBlockWrapper = document.querySelectorAll('.code-block-wrapper')
    codeBlockWrapper.forEach((wrapper) => {
      // 获取元素的id属性
      const messageId = wrapper.getAttribute('id')
      const assistantId = wrapper.getAttribute('assistant-id')
      const execBtn = wrapper.querySelector('.icon-play')
      const codeBlock = wrapper.querySelector('.code-block-body')
      if (execBtn && codeBlock) {
        execBtn.addEventListener('click', async () => {
          if (assistantId === SQLChatBotId) {
            const sql = codeBlock.textContent ?? ''
            if (fn) {
              await fn({ messageId, sql })
            }
          }
        })
      }
    })
  }

  onMounted(() => execCodeBlock())

  onUpdated(() => execCodeBlock())
}
