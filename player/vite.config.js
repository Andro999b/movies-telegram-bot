import { defineConfig, splitVendorChunkPlugin } from 'vite'
import react from '@vitejs/plugin-react'
import checker from 'vite-plugin-checker'

const releaseDate = new Date()
const releaseYaer = releaseDate.getFullYear()
const releaseDay = Math.floor((releaseDate - new Date(releaseDate.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24))
const releaseHour = releaseDate.getHours()

const uiChunkRegExps = [/react/, /@mui/, /@emotion/, /fscreen/, /mobx/]
const hlsJsRegExp = /hls\.js/

export default defineConfig({
  root: 'src',
  build: {
    outDir: '../dist',
    sourcemap: true,
    emptyOutDir: true,
    target: 'es6',
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if(uiChunkRegExps.find((re) => re.test(id))) {
            return 'ui'
          } else if(hlsJsRegExp.test(id)) {
            return 'hls'
          }
        }
      }
    }
  },
  publicDir: '../public',
  define: {
    'process.env.RELEASE': JSON.stringify(`movies-player@${releaseHour}.${releaseDay}.${releaseYaer}`)
  },
  server: {
    port: 3000
  },
  plugins: [
    checker(),
    react({
      include: '**/*.{jsx,tsx}',
    }),
    splitVendorChunkPlugin()
  ]
})
