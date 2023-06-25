import { ElMessage } from 'element-plus'

export function useInsertCode(messageId) {
  let codeBlockWrapper = []
  if (messageId) {
    codeBlockWrapper = document.querySelectorAll(`#msg-${messageId}.code-block-wrapper`)
  } else {
    codeBlockWrapper = document.querySelectorAll('.code-block-wrapper')
  }
  codeBlockWrapper.forEach((wrapper) => {
    const insertBtn = wrapper.querySelector('.icon-right')
    const codeBlock = wrapper.querySelector('.code-block-body')
    if (insertBtn && codeBlock) {
      insertBtn.addEventListener('click', () => {
        console.log(`codeBlock.textContent: `, codeBlock.textContent)
        if (window.vscode && codeBlock.textContent) {
          window.vscode.postMessage({
            cmd: 'insertCode',
            data: codeBlock.textContent ?? ''
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
