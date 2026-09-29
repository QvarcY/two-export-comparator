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

export default defineConfig(({ command, mode }) => {
  const portable = mode === 'portable';

  return {
    base: './',

    plugins:
      command === 'build' && !portable
        ? [staticCspPlugin()]
        : [],

    build: {
      target: 'es2022',
      outDir: portable ? '.portable-build' : 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      cssCodeSplit: false,
      emptyOutDir: true,
    },

    server: {
      port: 5173,
      open: true,
    },
  };
});
