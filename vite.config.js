import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// When running inside GitHub Codespaces or a tunnelled dev container the
// reverse proxy speaks HTTPS on port 443.  Vite's HMR WebSocket must use
// the same external port so the browser can connect back successfully.
const hmr = process.env.CODESPACE_NAME
  ? { clientPort: 443 }
  : {};

export default defineConfig({
  plugins: [react()],
  server: {
    hmr,
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
  },
})
