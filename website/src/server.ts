import 'zone.js/node';
import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import { Readable } from 'node:stream';

const browserDistFolder = join(import.meta.dirname, '../browser');
const backendOrigin = (process.env['BACKEND_ORIGIN'] || 'http://127.0.0.1:8080').replace(/\/$/, '');

const app = express();
const angularApp = new AngularNodeAppEngine();

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

app.use(['/api', '/uploads'], async (req, res, next) => {
  try {
    const targetUrl = new URL(req.originalUrl, backendOrigin);
    const headers = new Headers();
    const hasRequestBody = req.method !== 'GET' && req.method !== 'HEAD';

    for (const [key, value] of Object.entries(req.headers)) {
      if (!value || key.toLowerCase() === 'host') {
        continue;
      }

      if (Array.isArray(value)) {
        for (const item of value) {
          headers.append(key, item);
        }
      } else {
        headers.set(key, value);
      }
    }

    const requestInit: RequestInit & { duplex?: 'half' } = {
      method: req.method,
      headers,
      redirect: 'manual',
    };

    if (hasRequestBody) {
      requestInit.body = req as unknown as BodyInit;
      // Required by Node when forwarding a streamed request body.
      requestInit.duplex = 'half';
    }

    const upstreamResponse = await fetch(targetUrl, requestInit);

    res.status(upstreamResponse.status);

    upstreamResponse.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'set-cookie') {
        return;
      }

      res.setHeader(key, value);
    });

    const setCookie = upstreamResponse.headers.getSetCookie?.();
    if (setCookie && setCookie.length > 0) {
      res.setHeader('set-cookie', setCookie);
    }

    if (!upstreamResponse.body) {
      res.end();
      return;
    }

    Readable.fromWeb(upstreamResponse.body as any).pipe(res);
  } catch (error) {
    next(error);
  }
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
