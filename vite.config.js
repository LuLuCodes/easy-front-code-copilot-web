import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import ElementPlus from 'unplugin-element-plus/vite' // 不加这个配置，ElMessage出不来

// https://vitejs.dev/config/
export default ({ mode }) =>
  defineConfig({
    css: {
      preprocessorOptions: {
        // 覆盖掉element-plus包中的主题变量文件
        scss: {
          additionalData: `@use "@/assets/style/element/index.scss" as *;`
        }
      }
    },
    plugins: [
      vue(),
      // 按需引入，主题色的配置，需要加上 importStyle: 'sass'
      ElementPlus({ useSource: true }),
      Components({
        resolvers: [
          ElementPlusResolver({
            importStyle: 'sass'
          })
        ]
      })
      // ElementPlus()
    ],
    resolve: {
      alias: {
        '~': path.resolve(__dirname, './'),
        '@': path.resolve(__dirname, 'src')
      }
    },
    base: './',
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      manifest: false,
      rollupOptions: {
        output: {
          entryFileNames: `assets/[name].js`,
          chunkFileNames: `assets/[name].js`,
          assetFileNames: `assets/[name].[ext]`
        }
      }
    },
    server: {
      proxy: {},
      port: 8080
    }
  })
