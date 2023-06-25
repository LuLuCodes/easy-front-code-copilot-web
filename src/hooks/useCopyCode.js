import { ElMessage } from 'element-plus'
import { copyText } from '@/utils'

export function useCopyCode(messageId) {
  let codeBlockWrapper = []
  if (messageId) {
    codeBlockWrapper = document.querySelectorAll(`#msg-${messageId}.code-block-wrapper`)
  } else {
    codeBlockWrapper = document.querySelectorAll('.code-block-wrapper')
  }

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
