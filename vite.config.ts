import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { handleOpenDartRequest } from './src/server/opendart'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  Object.assign(process.env, env)

  return {
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
  }
})
