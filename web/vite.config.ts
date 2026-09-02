import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const rootDir = path.dirname(fileURLToPath(import.meta.url))
const HUD_DIR = path.resolve(rootDir, '../res/HUD_Character_Icon_L')

function serveHudIcons(): Plugin {
  const handler = (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const urlPath = decodeURIComponent((req.url ?? '').split('?')[0] ?? '')
    const name = path.basename(urlPath)
    if (!name.endsWith('.png')) {
      next()
      return
    }
    const file = path.join(HUD_DIR, name)
    if (!file.startsWith(HUD_DIR) || !fs.existsSync(file)) {
      next()
      return
    }
    res.setHeader('Content-Type', 'image/png')
    res.setHeader('Cache-Control', 'public, max-age=86400')
    fs.createReadStream(file).pipe(res)
  }

  return {
    name: 'serve-hud-icons',
    configureServer(server) {
      server.middlewares.use('/hud', handler)
    },
    configurePreviewServer(server) {
      server.middlewares.use('/hud', handler)
    },
  }
}

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    tailwindcss(),
    serveHudIcons(),
  ],
})
