import request from './request'
import md5 from 'crypto-js/md5'
import aes from 'crypto-js/aes'

const post = async ({ url, data, needSign = true, timeout = 15000 } = {}) => {
  try {
    if (typeof data === 'object' && needSign) {
      data.timestamp = Date.now()
      const sign = md5(JSON.stringify(data))
      data.sign = aes.encrypt(sign.toString(), url).toString()
    }
    const res = await request.post(url, data, { timeout })
    if (res) {
      if (res.code === 0) {
        return res.data
      } else {
        throw new Error(res.msg)
      }
    }
  } catch (error) {
    throw new Error(error.response ? error.response.data : error.message)
  }
}

const get = async ({ url, data, needSign = true, timeout = 15000 } = {}) => {
  try {
    if (typeof data === 'object' && needSign) {
      data.timestamp = Date.now()
      const sign = md5(JSON.stringify(data))
      data.sign = aes.encrypt(sign.toString().toUpperCase(), url).toString()
    }
    const res = await request.get(url, data, { timeout })
    if (res) {
      if (res.code === 0) {
        return res.data
      } else {
        throw new Error(res.msg)
      }
    }
  } catch (error) {
    throw new Error(error.response ? error.response.data : error.message)
  }
}

const uploadFile = async (formData) => {
  const res = await request.request({
    method: 'post',
    url: '/upload',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  return res
}

export default {
  post,
  get,
  uploadFile
}
