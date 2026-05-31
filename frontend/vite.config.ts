import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  server: {
    host: true,
    port: 3000,
  },
  preview: {
    host: true,
    port: 3000,
    allowedHosts: ['localhost', 'frontend', '127.0.0.1'],
  },
})
