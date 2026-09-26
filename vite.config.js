import { defineConfig } from 'vite';

const STATIC_CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'none'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
  "frame-src 'none'",
  "worker-src 'none'",
].join('; ');

function staticCspPlugin() {
  return {
    name: 'static-csp',
    transformIndexHtml() {
      return [{
        tag: 'meta',
        attrs: {
          'http-equiv': 'Content-Security-Policy',
          content: STATIC_CSP,
        },
        injectTo: 'head-prepend',
      }];
    },
  };
}

export default defineConfig(({ command }) => ({
  base: './',
  plugins: command === 'build' ? [staticCspPlugin()] : [],
  build: {
    target: 'es2022',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    cssCodeSplit: false,
  },
  server: {
    port: 5173,
    open: true,
  },
}));
