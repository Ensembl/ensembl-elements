import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';

import alignments from './alignments.ts';
import variants from './variants.ts';
import genomeBrowserProxy from './genome-browser-proxy.ts';

const app = new Hono();

app.use('/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length']
}));

app.route('/api/alignments', alignments);
app.route('/api/variants', variants);
app.route('/api/browser/*', genomeBrowserProxy);

app.use('/assets/*', serveStatic({ root: './client-static' }));

app.use('/', serveStatic({ path: './client-static/index.html' }));

// app.all('/', (c) => {
//   return c.json({ success: true })
// });


// uses port 3000 by default
serve(app);