import { bootstrapApplication } from '@angular/platform-browser';
import * as Sentry from '@sentry/angular';

import { appConfig } from './app/app.config';
import { App } from './app/app';
import { API_BASE_URL } from './app/core/api/api.config';

Sentry.init({
  dsn: 'https://1dfed6bed3de111718893fe5d0407523@o4511024793780224.ingest.de.sentry.io/4511024880746576',
  sendDefaultPii: true,
  integrations: [Sentry.browserTracingIntegration()],
  tracesSampleRate: 1.0,
  tracePropagationTargets: ['localhost', '127.0.0.1', /^\/api\/v1/]
});

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
