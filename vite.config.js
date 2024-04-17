import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import reactRefresh from '@vitejs/plugin-react-refresh';
import { resolve, join } from 'path'
const root = resolve(__dirname, 'src')
const outDir = resolve(__dirname, 'dist')

import { resolve, join } from 'path'
import * as fs from 'fs';

// plugin
const redirectToDir = ({ root }) => ({
  name: 'redirect-to-dir',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const filePath = join(root, req.url);
      fs.stat(filePath, (err, stats) => {
        if (!err && stats.isDirectory() && !req.url.endsWith('/')) {
          res.statusCode = 300;
          res.setHeader('Location', req.url+"/");
          res.setHeader('Content-Length', '0');
          res.end();
          return;
        }
        next();
      });
    })
  },
});

// https://vitejs.dev/config/
export default defineConfig({
  root,
  plugins: [react(), reactRefresh()],
  build: {
    outDir,
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(root, 'index.html'),
      }
    }
  }
})