import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { handleOpenDartRequest } from './src/server/opendart'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'local-opendart-api',
      configureServer(server) {
        server.middlewares.use('/api/opendart', async (req, res) => {
          await handleOpenDartRequest(req, res)
        })
      },
    },
  ],
})
