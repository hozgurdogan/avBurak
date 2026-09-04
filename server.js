'use strict';

/**
 * Custom entry point for cPanel's "Setup Node.js App" (Phusion Passenger).
 *
 * Passenger does not run `npm start` / `next start` itself - it launches one
 * Node script and expects that script to bind an HTTP server to the port it
 * assigns via `process.env.PORT`. This wraps Next.js's own request handler in
 * a plain `http.createServer`, which is the pattern Next.js documents for
 * self-hosting outside Vercel and without Docker.
 *
 * This does not build anything - `npm run build` (via cPanel's "Run NPM
 * Install" plus a build step, see README section "Deployment") must have
 * already produced `.next/` before Passenger starts this file.
 *
 * Plain CommonJS on purpose: `package.json` has no `"type": "module"`, and
 * Passenger's Node runtime should not need an extra loader just to boot.
 */
const { createServer } = require('node:http');
const { parse } = require('node:url');
const next = require('next');

// cPanel's Node App UI lets you choose an "Environment" (development /
// production) that Passenger exposes as NODE_ENV. Anything other than an
// explicit "development" is treated as production.
const dev = process.env.NODE_ENV === 'development';
const hostname = process.env.HOSTNAME || '0.0.0.0';
const port = Number(process.env.PORT) || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    createServer((req, res) => {
      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl);
    })
      .once('error', (err) => {
        console.error(err);
        process.exit(1);
      })
      .listen(port, () => {
        console.log(
          `> Ready on http://${hostname}:${port} (${dev ? 'development' : 'production'})`,
        );
      });
  })
  .catch((err) => {
    console.error('Failed to start Next.js:', err);
    process.exit(1);
  });
