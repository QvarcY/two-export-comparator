# Static deployment

Two-Export Comparator is designed to ship as static files from `dist/`.

## Build

```bash
npm ci
npm test
npm run build
```

The build command also verifies that:

- the generated `dist/index.html` contains the production Content Security Policy;
- `connect-src 'none'` is present;
- the entry document does not reference external HTTP(S) scripts/styles/resources.

Because Vite uses `base: './'`, the generated app can be hosted at a domain root or a nested static path.

## Recommended hosting headers

The production HTML contains a CSP meta policy so the downloaded static build keeps a restrictive baseline. When the hosting platform allows response headers, prefer enforcing the equivalent policy as an HTTP header.

Recommended baseline:

```text
Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data:;
  font-src 'self';
  connect-src 'none';
  object-src 'none';
  base-uri 'none';
  form-action 'none';
  frame-src 'none';
  worker-src 'none'
```

Also consider:

```text
X-Content-Type-Options: nosniff
Referrer-Policy: no-referrer
Cross-Origin-Opener-Policy: same-origin
```

## Privacy check

A static host necessarily receives requests for the application files themselves (HTML/JS/CSS). Selected CSV/TSV business files are read by browser JavaScript and are not intentionally sent to the host.

Before publishing a demo, verify this behavior in browser developer tools using synthetic data.

## Not included

There is currently no service worker or background synchronization. Offline/PWA behavior is not part of the core promise.
