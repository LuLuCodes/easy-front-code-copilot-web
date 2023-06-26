import { encode } from 'gpt-tokenizer'
// import api from '@/api'

export const MessageStatus = {
  LOADING: 'LOADING',
  DONE: 'DONE',
  FAILED: 'FAILED'
}

export const MessageType = {
  General: 'General',
  Sql: 'Sql'
}

export const CreatorRole = {
  System: 'system',
  User: 'user',
  Assistant: 'assistant'
}

export const countTextTokens = (text) => {
  return encode(text).length
}

export const generalBot = {
  id: 'general-bot',
  name: 'General bot',
  description: 'A general prompt of Chat.',
  avatar: '',
  getSystemPrompt: () => {
    const basicPrompt = `Please be careful to return only key information, and try not to make it too long.`
    return basicPrompt
  },
  getTaskPrompt: (task, content) => {
    let taskPrompt = ``
    if (task === 'addCodeComments') {
      taskPrompt = `\`\`\`${content}\`\`\`\n\n给这段代码添加注释。`
    } else if (task === 'explainCode') {
      taskPrompt = `\`\`\`${content}\`\`\`\n\n详细这段代码的作用。`
    } else if (task === 'refactorCode') {
      taskPrompt = `\`\`\`${content}\`\`\`\n\n重构优化这段代码，并修复其中的bug。`
    } else if (task === 'generateTestCases') {
      taskPrompt = `\`\`\`${content}\`\`\`\n\n使用jest生成这段代码的测试用例。`
    }
    return taskPrompt
  }
}

export const sendMessagesToOpenAi = async ({ hostname, apiKey, model, temperature, messages }) => {
  const response = await fetch(`https://${hostname}/v1/chat/completions`, {
    method: 'POST',
    body: JSON.stringify({
      model,
      messages,
      temperature,
      stream: true
    }),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    responseType: 'stream'
  })

  if (!response.ok) {
    throw new Error(response.statusText)
  }

  return response.body
}
