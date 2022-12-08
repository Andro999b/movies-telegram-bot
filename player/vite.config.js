import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import eslint from 'vite-plugin-eslint'
import checker from 'vite-plugin-checker'
import { chunkSplitPlugin } from 'vite-plugin-chunk-split'

const releaseDate = new Date()
const releaseYaer = releaseDate.getFullYear()
const releaseDay = Math.floor((releaseDate - new Date(releaseDate.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24))
const releaseHour = releaseDate.getHours()


export default defineConfig({
  root: 'src',
  build: {
    outDir: '../dist',
    sourcemap: true,
    emptyOutDir: true
  },
  publicDir: '../public',
  define: {
    'process.env.RELEASE': JSON.stringify(`movies-player@${releaseHour}.${releaseDay}.${releaseYaer}`)
  },
  server: {
    port: 3000
  },
  plugins: [
    // eslint(),
    checker(),
    react({
      include: '**/*.{jsx,tsx}',
    }),
    chunkSplitPlugin({
      strategy: 'single-vendor',
      customSplitting: {
        'ui': [/react/, /@mui/, /@emotion/, /fscreen/, /mobx/],
        'hlsjs': ['hls.js']
      }
    })
  ]
})
