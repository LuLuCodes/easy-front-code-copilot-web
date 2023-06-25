import { onMounted, onUpdated } from 'vue'
import { ElMessage } from 'element-plus'
import { copyText } from '@/utils'

export function useCopyCode() {
  function copyCodeBlock() {
    const codeBlockWrapper = document.querySelectorAll('.code-block-wrapper')
    codeBlockWrapper.forEach((wrapper) => {
      const copyBtn = wrapper.querySelector('.icon-copy')
      const codeBlock = wrapper.querySelector('.code-block-body')
      if (copyBtn && codeBlock) {
        copyBtn.addEventListener('click', () => {
          if (navigator.clipboard?.writeText)
            navigator.clipboard.writeText(codeBlock.textContent ?? '')
          else copyText({ text: codeBlock.textContent ?? '', origin: true })

          ElMessage({
            message: '已复制',
            type: 'success',
            duration: 1500
          })
        })
      }
    })
  }

  onMounted(() => copyCodeBlock())

  onUpdated(() => copyCodeBlock())
}

export function useInserCode() {
  function insertCodeBlock() {
    const codeBlockWrapper = document.querySelectorAll('.code-block-wrapper')
    codeBlockWrapper.forEach((wrapper) => {
      const insertBtn = wrapper.querySelector('.icon-right')
      const codeBlock = wrapper.querySelector('.code-block-body')
      if (insertBtn && codeBlock) {
        insertBtn.addEventListener('click', () => {
          if (window.vscode) {
            window.vscode.postMessage({
              command: 'insertCode',
              text: codeBlock.textContent ?? ''
            })
            ElMessage({
              message: '已插入',
              type: 'success',
              duration: 1500
            })
          }
        })
      }
    })
  }

  onMounted(() => insertCodeBlock())

  onUpdated(() => insertCodeBlock())
}
