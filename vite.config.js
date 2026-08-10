import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  css: {
    // 关键：关闭 LightningCSS，使用传统 CSS 压缩
    minify: false,  // 或者直接删掉这个配置，使用默认
  },
  build: {
    // 确保 CSS 不经过 LightningCSS
    cssMinify: false,
  }
})