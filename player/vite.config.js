import { defineConfig, splitVendorChunkPlugin } from 'vite'
import react from '@vitejs/plugin-react'

const releaseDate = new Date()
const releaseYaer = releaseDate.getFullYear()
const releaseDay = Math.floor((releaseDate - new Date(releaseDate.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24))
const releaseHour = releaseDate.getHours()

export default defineConfig({
  root: 'src',
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  define: {
    'process.env.RELEASE': JSON.stringify(`movies-player@${releaseHour}.${releaseDay}.${releaseYaer}`)
  },
  server: {
    port: 3000
  },
  plugins: [
    react({
      include: '**/*.{jsx,tsx}',
    }),
    splitVendorChunkPlugin()
  ],
})
