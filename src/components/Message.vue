<!--
 * @Author: leyi leyi@myun.info
 * @Date: 2023-05-26 13:54:49
 * @LastEditors: leyi leyi@myun.info
 * @LastEditTime: 2023-05-26 20:58:07
 * @FilePath: /easy-front-code-copilot-web/src/components/Message.vue
 * @Description: 
 * 
 * Copyright (c) 2023 by ${git_name_email}, All Rights Reserved. 
-->
<template>
  <div class="mb30" :class="chat_txt_class">
    <div class="txt-l" :class="chat_class">
      <p class="f12 c-secondary pb8" :class="chat_time_class">{{ props.message.createdAt }}</p>
      <div class="chat-box">
        <template
          v-if="
            props.conversation.assistantId === GeneralChatBotId ||
            props.conversation.assistantId === SQLChatBotId
          "
        >
          <template v-if="props.message.creatorRole === CreatorRole.User">
            {{ messageContent }}
          </template>
          <template v-else>
            <div
              v-if="!showRawText"
              class="code-box-wrap"
              :class="typing_class"
              v-html="messageContent"
            />
            <div v-else class="code-box-wrap" :class="typing_class" v-text="messageContent" />
          </template>
        </template>
        <template v-else-if="props.conversation.assistantId === DrawerChatBotId">
          <template v-if="props.message.creatorRole === CreatorRole.User">
            {{ messageContent }}
          </template>
          <template v-else
            ><p>{{ messageContent }}</p>
            <div class="pic-preview-list mt20 flex f-wrap" v-if="drawerImageUrl">
              <p data-ratio="300" class="img-item pointer">
                <el-image :src="drawerImageUrl" alt="" :previewSrcList="[drawerImageUrl]" />
              </p>
            </div>
            <div class="pic-option-list mt20 flex f-wrap" v-if="drawerImageUrl">
              <p
                v-for="item in drawerImageUpSample"
                :key="item.value"
                @click.prevent.stop="handlerActionImage(item.value)"
              >
                {{ item.title }}
              </p>
              <!-- <p><span class="icon icon-shuaxin"></span></p> -->
              <p
                v-for="item in drawerImageVariation"
                :key="item.value"
                @click.prevent.stop="handlerActionImage(item.value)"
              >
                {{ item.title }}
              </p>
            </div></template
          >
        </template>
      </div>

      <template v-if="props.message.creatorRole === CreatorRole.User">
        <p class="user-avatar">
          <img width="35" src="@/assets/images/common/avatar-default.jpg" alt="" />
        </p>
      </template>
      <template v-else>
        <p class="gpt-avatar"><span class="icon f22" :class="avatar_class"></span></p>
      </template>

      <el-dropdown>
        <span class="icon icon-more pointer"> </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              ><span class="icon icon-copy"></span><span class="pl6">拷贝</span></el-dropdown-item
            >
            <el-dropdown-item
              ><span class="icon icon-shanchu"></span
              ><span class="pl6">删除</span></el-dropdown-item
            >
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import MarkdownIt from 'markdown-it'
import mdKatex from '@traptitech/markdown-it-katex'
import mila from 'markdown-it-link-attributes'
import hljs from 'highlight.js'
import { CreatorRole } from '@/utils'
import { GeneralChatBotId } from '@/store'

const showRawText = ref(false)

const props = defineProps({
  message: {
    type: Object,
    default() {
      return {
        id: '',
        conversationId: '',
        creatorRole: '',
        createdAt: '',
        content: '',
        imageData: {
          task_id: '',
          image_id: '',
          image_url: '',
          actions: []
        },
        status: 'DONE',
        isWrong: false
      }
    }
  },
  conversation: {
    type: Object,
    default() {
      return {
        id: '',
        assistantId: '',
        title: '',
        createdAt: 'OPEN'
      }
    }
  },
  isSqlChat: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['actionImage'])

const chat_class = computed(() => {
  return {
    'chat-right': props.message.creatorRole === CreatorRole.User,
    'chat-left': props.message.creatorRole !== CreatorRole.User,
    'wrong-info': props.message.isWrong
  }
})

const chat_time_class = computed(() => {
  return {
    'txt-r': props.message.creatorRole !== CreatorRole.User
  }
})

const chat_txt_class = computed(() => {
  return {
    'txt-r': props.message.creatorRole === CreatorRole.User,
    'txt-l': props.message.creatorRole !== CreatorRole.User
  }
})

const avatar_class = computed(() => {
  return {
    'icon-ie-ChatGPT': props.conversation.assistantId === GeneralChatBotId
  }
})

const typing_class = computed(() => {
  if (props.message.status === 'LOADING') {
    return 'typing blinker'
  }
  return ''
})

const messageContent = computed(() => {
  const value = props.message.content || ''
  if (props.message.creatorRole === CreatorRole.User) {
    return value
  }
  return mdi.render(value)
})

const drawerImageUrl = computed(() => {
  return props.message ? props.message.imageData.image_url : ''
})

const drawerImageUpSample = computed(() => {
  if (!props.message || !props.message.imageData || !props.message.imageData.actions.length) {
    return []
  }
  return props.message.imageData.actions
    .filter((item) => item.includes('upsample'))
    .map((item) => {
      return {
        title: `放大${item[item.length - 1]}`,
        value: item
      }
    })
})

const drawerImageVariation = computed(() => {
  if (!props.message || !props.message.imageData || !props.message.imageData.actions.length) {
    return []
  }

  return props.message.imageData.actions
    .filter((item) => item.includes('variation'))
    .map((item) => {
      return {
        title: `变体${item[item.length - 1]}`,
        value: item
      }
    })
})

const handlerActionImage = (action) => {
  if (!props.message || !props.message.imageData || !props.message.imageData.image_id) {
    return
  }
  emit('actionImage', { imageId: props.message.imageData.image_id, action })
}

function highlightBlock(str, lang = '') {
  return `<pre id="${props.message.id}" assistant-id= "${props.conversation.assistantId}" class="code-block-wrapper"><div class="code-box-top flex all-c pl16 pr16"><span class="flex-1">${lang}</span><span class="icon icon-right pointer"></span><span class="icon icon-copy pointer"></span></div><code class="code-block-body hljs p12 ${lang}">${str}</code></pre>`
}

const mdi = new MarkdownIt({
  linkify: true,
  highlight(code, language) {
    const validLang = !!(language && hljs.getLanguage(language))
    if (validLang) {
      const lang = language || ''
      return highlightBlock(hljs.highlight(code, { language: lang }).value, lang)
    }
    return highlightBlock(hljs.highlightAuto(code).value, '')
  }
})

mdi.use(mila, { attrs: { target: '_blank', rel: 'noopener' } })
mdi.use(mdKatex, { blockClass: 'katexmath-block rounded-md p-[10px]', errorColor: ' #cc0000' })
</script>

<style lang="scss" scoped>
.chat-right {
  padding-left: 22px;
}
.chat-left {
  padding-right: 22px;
}
.chat-right .el-dropdown {
  position: absolute;
  left: 0;
  bottom: 4px;
  visibility: hidden;
}
.chat-right:hover .el-dropdown {
  visibility: visible;
}
.chat-right .user-avatar {
  width: 35px;
  height: 35px;
  border-radius: 8px;
  overflow: hidden;
  position: absolute;
  right: 10px;
  top: 4px;
}
.chat-left .gpt-avatar {
  text-align: center;
  line-height: 35px;
  width: 35px;
  height: 35px;
  border-radius: 8px;
  overflow: hidden;
  position: absolute;
  left: 10px;
  top: 4px;
  color: #fff;
  background: linear-gradient(90deg, #f4a51b 0%, #f07f20 100%) !important;
}
.chat-left .el-dropdown {
  position: absolute;
  right: 0;
  bottom: 4px;
  visibility: hidden;
}
.chat-left:hover .el-dropdown {
  visibility: visible;
}

.code-block-wrapper {
  padding-top: 10px;
  padding-bottom: 10px;
}
</style>
