/**
 * Local preview server for the built static site (dist-site/).
 * Serves static files and inlines /healthz + a mock POST /api/contact so the
 * contact form can be tested without the real backend or hCaptcha.
 * Run: npm run preview  (default http://127.0.0.1:8090)
 */
import { createServer } from 'http';
import { createReadStream, existsSync, statSync } from 'fs';
import { join, normalize, extname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const OUT = join(__dirname, '..', 'dist-site');
const PORT = Number(process.env.PREVIEW_PORT || 8090);

const MIME: Record<string, string> = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.pdf': 'application/pdf',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
};

function safeResolve(urlPath: string): string {
  let clean = decodeURIComponent(urlPath.split('?')[0]);
  if (clean.endsWith('/')) clean += 'index.html';
  if (extname(clean) === '') clean += '/index.html';
  const file = normalize(join(OUT, clean));
  if (!file.startsWith(OUT)) return '';
  return file;
}

const server = createServer((req, res) => {
  const urlPath = (req.url || '/').split('?')[0];

  if (req.method === 'GET' && urlPath === '/healthz') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
    return;
  }

  if (req.method === 'POST' && urlPath === '/api/contact') {
    let raw = '';
    req.on('data', (c) => (raw += c));
    req.on('end', () => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: 'Message sent successfully! (preview mock)' }));
    });
    return;
  }

  if (req.method === 'GET' && (urlPath.startsWith('/api') || urlPath === '/api')) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'not found' }));
    return;
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405);
    res.end();
    return;
  }

  let file = safeResolve(urlPath);
  if (!file || !existsSync(file)) {
    file = join(OUT, '404.html');
  }
  if (existsSync(file) && statSync(file).isDirectory()) {
    file = join(file, 'index.html');
  }

  res.writeHead(200, {
    'Content-Type': MIME[extname(file)] || 'application/octet-stream',
    'Cache-Control': file.endsWith('.html') ? 'no-cache' : 'public, max-age=31536000, immutable',
  });
  createReadStream(file).pipe(res);
});

server.listen(PORT, () => {
  console.log(`Preview server: http://127.0.0.1:${PORT}  (serving ${OUT})`);
});
