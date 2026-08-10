import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  // ===== 根据你的部署平台修改 =====
  base: '/',  // 如果是部署到根目录（ESA Pages、Vercel、OSS）
  // base: '/仓库名/',  // 如果是部署到 GitHub Pages 子目录
  build: {
    cssMinify: 'esbuild',
  }
})