import { toRaw } from 'vue'
const __piniaKey = '__PINIAKEY__'

//取值
const getStorage = (key) => {
  return localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key)) : {}
}
//存储
const setStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value))
}

const piniaStorage = (options) => {
  return (context) => {
    const { store } = context
    const data = getStorage(`${options?.key ?? __piniaKey}-${store.$id}`)
    store.$subscribe(
      (args) => {
        let arrPaths = options.paths
        if (!arrPaths?.includes(args.storeId)) return
        setStorage(`${options?.key ?? __piniaKey}-${store.$id}`, toRaw(store.$state))
      },
      {
        detached: true
      }
    )
    return { ...store.$state, ...data }
  }
}

export default piniaStorage
