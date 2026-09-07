import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, relative, extname, sep } from "node:path";
import { gzip } from "node:zlib";
import { promisify } from "node:util";
import { pathToFileURL } from "node:url";

const compress = promisify(gzip);
const types = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg",
  ".webp": "image/webp", ".avif": "image/avif", ".woff2": "font/woff2",
  ".otf": "font/otf", ".xml": "application/xml", ".txt": "text/plain; charset=utf-8"
};

export function staticServer(root) {
  root = resolve(root);
  return createServer(async (request, response) => {
    if (!["GET", "HEAD"].includes(request.method)) { response.writeHead(405); response.end(); return; }
    let pathname;
    try { pathname = decodeURIComponent(new URL(request.url, "http://preview.invalid").pathname); }
    catch (_) { response.writeHead(400); response.end(); return; }
    const segments = pathname.split("/").filter(Boolean);
    if (segments.some((part) => part.startsWith(".") || ["node_modules", "tools", "tests"].includes(part))) {
      response.writeHead(404); response.end("Not found"); return;
    }
    let file = resolve(root, "." + pathname);
    if (relative(root, file).startsWith(".." + sep) || file === resolve(root, "..")) {
      response.writeHead(403); response.end(); return;
    }
    let status = 200;
    let metadata;
    try {
      metadata = await stat(file);
      if (metadata.isDirectory()) { file = resolve(file, "index.html"); metadata = await stat(file); }
      if (!metadata.isFile()) throw new Error("Not a file");
    } catch (_) {
      status = 404;
      file = resolve(root, "404.html");
      try { metadata = await stat(file); } catch (_) { response.writeHead(404); response.end("Not found"); return; }
    }
    const etag = `"${metadata.size}-${metadata.mtimeMs}"`;
    const immutable = /\/assets\/gallery\/[\da-f]+-\d+\.(avif|webp)$/.test(file);
    const headers = {
      "content-type": types[extname(file)] || "application/octet-stream",
      "cache-control": immutable ? "public, max-age=31536000, immutable" : "no-cache",
      "x-content-type-options": "nosniff",
      "etag": etag,
      "vary": "Accept-Encoding"
    };
    // Deliberately no host/origin allowlist or frame-ancestors restriction: the
    // Arena preview is proxied and embedded, not running in the visitor's localhost.
    if (request.headers["if-none-match"] === etag && status === 200) {
      response.writeHead(304, headers); response.end(); return;
    }
    try {
      let body = await readFile(file);
      if (/^(text\/|application\/(json|xml))/.test(headers["content-type"]) && /\bgzip\b/.test(request.headers["accept-encoding"] || "")) {
        body = await compress(body);
        headers["content-encoding"] = "gzip";
      }
      headers["content-length"] = String(body.length);
      response.writeHead(status, headers);
      response.end(request.method === "HEAD" ? undefined : body);
    } catch (_) { response.writeHead(500); response.end("Unable to read file"); }
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const args = process.argv.slice(2);
  const arg = (name, fallback) => args.includes(name) ? args[args.indexOf(name) + 1] : fallback;
  const root = arg("--root", ".");
  const port = Number(arg("--port", process.env.PORT || 4173));
  const server = staticServer(root);
  server.listen(port, "0.0.0.0", () => console.log(`Portfolio available on port ${port} (root: ${resolve(root)})`));
  process.on("SIGTERM", () => server.close());
  process.on("SIGINT", () => server.close());
}
