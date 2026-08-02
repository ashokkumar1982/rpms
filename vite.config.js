import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Set VITE_BASE_PATH in your GitHub Actions workflow / .env for Pages deployment,
// e.g. "/rpms/" if the repo is deployed at https://username.github.io/rpms/
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || '/',
})
