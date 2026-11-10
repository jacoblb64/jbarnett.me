// Zero-dependency static server for the built `dist/` folder.
// Used by Playwright's webServer so tests run against exactly what Netlify deploys
// (no eleventy-dev-server live-reload script injected).
import { createServer } from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import { join, extname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..', 'dist');
const port = Number(process.env.PORT || 4173);

const mime = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.ico': 'image/x-icon',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.json': 'application/json',
};

createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    let pathname = decodeURIComponent(url.pathname);
    if (pathname.endsWith('/')) pathname += 'index.html';
    const file = normalize(join(root, pathname));
    if (!file.startsWith(root)) {
        res.writeHead(403).end();
        return;
    }
    let stat;
    try {
        stat = statSync(file);
    } catch {
        res.writeHead(404, { 'content-type': 'text/plain' }).end('Not found');
        return;
    }
    if (stat.isDirectory()) {
        res.writeHead(301, { location: pathname + '/' }).end();
        return;
    }
    res.writeHead(200, {
        'content-type': mime[extname(file)] || 'application/octet-stream',
        'content-length': stat.size,
    });
    createReadStream(file).pipe(res);
}).listen(port, () => console.log(`serving ${root} on http://localhost:${port}`));
