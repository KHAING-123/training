import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      // ブラウザからの /api/* リクエストを、Vite dev server が
      // サーバーサイドで http://localhost:3000/api/* に転送する。
      // ブラウザは常に自分がアクセスしている画面と同じオリジンにリクエストするだけでよくなる。
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
