export * from './uuid'
export * from './api-helpers'
export * from './openai'

export const safetyParseJson = (str) => {
  let result = null
  try {
    result = JSON.parse(str)
  } catch (e) {
    return null
  }
  return result
}

/**
 * 复制文本
 * @param options
 */
export function copyText(options) {
  const props = { origin: true, ...options }

  let input = null

  if (props.origin) input = document.createElement('textarea')
  else input = document.createElement('input')

  input.setAttribute('readonly', 'readonly')
  input.value = props.text
  document.body.appendChild(input)
  input.select()
  if (document.execCommand('copy')) document.execCommand('copy')
  document.body.removeChild(input)
}
