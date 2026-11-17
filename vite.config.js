import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Above-the-fold fonts of the professional site (hero: Space Grotesk title, Inter text).
// The app renders after the JS loads, so preloading them from the HTML makes them arrive before
// the first paint: no fallback→web-font swap in the hero, no layout shift (CLS).
const PRELOAD_FONTS = [/inter-latin-wght-normal-.*\.woff2$/, /space-grotesk-latin-wght-normal-.*\.woff2$/];

const preloadCriticalFonts = () => ({
  name: 'preload-critical-fonts',
  apply: 'build',
  transformIndexHtml: {
    order: 'post',
    handler(html, { bundle }) {
      const files = Object.keys(bundle ?? {}).filter((file) => PRELOAD_FONTS.some((re) => re.test(file)));
      return files.map((file) => ({
        tag: 'link',
        attrs: { rel: 'preload', href: `/${file}`, as: 'font', type: 'font/woff2', crossorigin: '' },
        injectTo: 'head',
      }));
    },
  },
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), preloadCriticalFonts()],
  assetsInclude: ['**/*.glb'],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
    css: false,
    include: ['src/**/*.test.{js,jsx}'],
  },
})
