import { defineConfig, splitVendorChunkPlugin } from 'vite'
import react from '@vitejs/plugin-react'
import eslint from 'vite-plugin-eslint'

const releaseDate = new Date()
const releaseYaer = releaseDate.getFullYear()
const releaseDay = Math.floor((releaseDate - new Date(releaseDate.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24))
const releaseHour = releaseDate.getHours()

const vendorsUi = [
  'react',
  '@mui',
  '@emotion',
  'fscreen',
  'mobx'
]

export default defineConfig({
  root: 'src',
  build: {
    outDir: '../dist',
    sourcemap: true,
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (vendorsUi.find((name) => id.includes(name)) != null) {
            return 'vendors-ui'
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
    eslint(),
    react({
      include: '**/*.{jsx,tsx}',
    }),
    splitVendorChunkPlugin()
  ]
})
