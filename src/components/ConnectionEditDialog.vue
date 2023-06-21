<template>
  <el-dialog
    :model-value="visible"
    @close="updateVisible(false)"
    class="g-dialog"
    :title="dialogTitle"
    width="878px"
    draggable
    destroy-on-close
  >
    <div class="pl10 pr30" v-loading="connecting" element-loading-text="连接中...">
      <el-alert title="连接设置存储在本地浏览器中" :closable="false" show-icon type="warning" />
      <el-form
        class="mt30"
        label-position="right"
        label-width="100px"
        :model="dbConfigForm"
        ref="dbConfigFormRef"
        :rules="dbConfigFormRules"
      >
        <el-row :gutter="40">
          <!-- <el-col :span="12">
            <el-form-item label="数据库类型">
              <el-select class="w100" placeholder="Select">
                <el-option
                  v-for="item in options"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col> -->
          <el-col :span="12">
            <el-form-item label="主机" prop="host">
              <el-input
                v-model="dbConfigForm.host"
                placeholder="请输入数据库主机IP"
                clearable
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="端口" prop="port">
              <el-input
                v-model.number="dbConfigForm.port"
                placeholder="请输入数据库主机端口"
                clearable
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="数据库名" prop="database">
              <el-input
                v-model="dbConfigForm.database"
                placeholder="请输入数据库名"
                clearable
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="用户名" prop="username">
              <el-input
                v-model="dbConfigForm.username"
                placeholder="请输入数据库用户名"
                clearable
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="密码" prop="password">
              <el-input
                v-model="dbConfigForm.password"
                type="password"
                placeholder="请输入数据库密码"
                show-password
                clearable
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="备注" prop="remark">
              <el-input
                v-model="dbConfigForm.remark"
                placeholder="请输入数据库备注"
                clearable
              ></el-input>
            </el-form-item>
          </el-col>
          <!-- <el-col :span="12">
            <el-form-item label="SSL">
              <el-radio-group v-model="radio">
                <el-radio :label="3">None</el-radio>
                <el-radio :label="6">CA Only</el-radio>
                <el-radio :label="9">Full</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col> -->
        </el-row>
      </el-form>
    </div>
    <template #footer>
      <span class="dialog-footer-left">
        <el-button @click.prevent.stop="handlerDelConnection(dbConfigFormRef)">删 除</el-button>
        <el-button type="primary" @click.prevent.stop="handlerTestConnection(dbConfigFormRef)"
          >测试连接</el-button
        >
      </span>
      <span class="dialog-footer">
        <el-button
          type="success"
          :disabled="!testConnectOk"
          @click="handlerSaveConnection(dbConfigFormRef)"
          >保 存</el-button
        >
        <el-button @click="handlerCancle(dbConfigFormRef)">取 消</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, toRef, computed, watch } from 'vue'
import { generateUUID } from '@/utils'
import { useConnectionStore } from '@/store'

const connectionStore = useConnectionStore()
const { addConnection, updateConnection, delConnectionById, testConnection, getConnectionById } =
  connectionStore

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  editConnectionId: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const visible = toRef(props, 'modelValue')

const updateVisible = (val) => {
  emit('update:modelValue', val)
}

const dialogTitle = computed(() => {
  return !props.connectionId ? '新建数据库连接' : '编辑数据库连接'
})

const dbConfigForm = ref({
  host: '',
  port: 3306,
  database: '',
  username: '',
  password: '',
  type: 'mysql',
  remark: ''
})
const dbConfigFormRef = ref(null)

const testConnectOk = ref(false)
const connecting = ref(false)

const validateHost = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请填写数据库主机IP'))
  } else {
    const ipAddressRegex = /^([0-9]{1,3}\.){3}[0-9]{1,3}$/ // IP地址正则表达式
    if (!ipAddressRegex.test(value)) {
      callback(new Error('请填写正确的数据库主机IP'))
    } else {
      callback()
    }
  }
}

const validatePost = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请填写数据库主机端口'))
  } else {
    if (!Number.isInteger(parseInt(value))) {
      callback(new Error('请填写正确的数据库主机端口'))
    } else {
      callback()
    }
  }
}

const dbConfigFormRules = reactive({
  host: [{ required: true, validator: validateHost, trigger: 'blur' }],
  port: [{ required: true, validator: validatePost, trigger: 'blur' }],
  database: [
    {
      required: true,
      message: '请填写数据库名称',
      trigger: 'blur'
    }
  ],
  username: [
    {
      required: true,
      message: '请填写数据库用户名',
      trigger: 'blur'
    }
  ],
  password: [
    {
      required: true,
      message: '请填写数据库密码',
      trigger: 'blur'
    }
  ],
  remark: [
    { required: true, message: '请填写数据库备注', trigger: 'blur' },
    { min: 3, max: 10, message: '数据库备注长度在3~10个字符', trigger: 'blur' }
  ]
})

watch(
  () => props.editConnectionId,
  () => {
    console.log(`editConnectionId: ${props.editConnectionId}`)
    if (props.editConnectionId) {
      const connection = getConnectionById(props.editConnectionId)
      const { host, port, database, username, password, remark } = connection
      dbConfigForm.value.host = host
      dbConfigForm.value.port = port
      dbConfigForm.value.database = database
      dbConfigForm.value.username = username
      dbConfigForm.value.password = password
      dbConfigForm.value.remark = remark
    } else {
      dbConfigForm.value.host = ''
      dbConfigForm.value.port = 3306
      dbConfigForm.value.database = ''
      dbConfigForm.value.username = ''
      dbConfigForm.value.password = ''
      dbConfigForm.value.remark = ''
    }
  }
)

const closeDialog = (formEl) => {
  formEl.resetFields()
  updateVisible(false)
}

const handlerSaveConnection = async (formEl) => {
  if (!formEl) {
    return
  }
  await formEl.validate((valid) => {
    if (valid) {
      if (props.editConnectionId) {
        updateConnection(props.editConnectionId, { ...dbConfigForm.value })
      } else {
        addConnection({ ...dbConfigForm.value, id: generateUUID() })
      }
      closeDialog(formEl)
    }
  })
}

const handlerDelConnection = (formEl) => {
  if (props.editConnectionId) {
    delConnectionById(props.editConnectionId)
  }
  closeDialog(formEl)
}

const handlerCancle = async (formEl) => {
  if (!formEl) {
    return
  }
  closeDialog(formEl)
}

const handlerTestConnection = async (formEl) => {
  if (!formEl) {
    return
  }
  await formEl.validate(async (valid) => {
    if (valid) {
      connecting.value = true
      const testResult = await testConnection({ ...dbConfigForm.value })
      connecting.value = false
      if (testResult) {
        testConnectOk.value = true
      } else {
        testConnectOk.value = false
      }
    }
  })
}
</script>

<style lang="scss" scoped></style>
