import { Hono } from 'hono';
import { proxy } from 'hono/proxy';

const genomeBrowserProxy = new Hono();

const PROXY_TARGET = 'https://staging-2020.ensembl.org';

genomeBrowserProxy.post('/', async (c) => {
  const requestPath = c.req.path;
  const targetUrl = `${PROXY_TARGET}${requestPath}`;
  const arrayBuffer = await c.req.arrayBuffer(); // Get binary body of the request

  return proxy(targetUrl, {
    method: "POST",
    body: arrayBuffer,
    headers: {
      ...c.req.header(),
    }
  });
});

export default genomeBrowserProxy;