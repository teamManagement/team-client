import { resolve } from 'path'
import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    build: {
      rollupOptions: {
        external: ['@electron-toolkit/utils']
      }
    }
  },
  preload: {
    build: {
      rollupOptions: {
        input: {
          inside: resolve(__dirname, 'src/preload/inside/index.ts'),
          newWindowOpen: resolve(__dirname, 'src/preload/newWindowOpen/index.ts'),
          notification: resolve(__dirname, 'src/preload/notification/index.ts'),
          applicationSdk: resolve(__dirname, 'src/preload/applicationSdkPreload/index.ts')
        },
        external: ['@electron-toolkit/preload']
      }
    }
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [react()]
  }
})
