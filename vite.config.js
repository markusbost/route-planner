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
    globals: true,
    include: ['tests/**/*.test.js', 'tests/**/*.test.jsx'],
    environmentMatchGlobs: [
      ['tests/components/**/*.test.jsx', 'happy-dom'],
    ],
    setupFiles: ['tests/components/setup.js'],
    coverage: {
      provider: 'v8',
      include: ['src/**'],
      exclude: ['src/game/audio.js', 'src/main.jsx'],
      thresholds: {
        statements: 85,
        branches: 75,
        functions: 85,
        lines: 88,
      },
    },
  },
})
