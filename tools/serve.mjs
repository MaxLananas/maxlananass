import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { pipeline } from "node:stream/promises";
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
  ".mp4": "video/mp4", ".webm": "video/webm", ".vtt": "text/vtt; charset=utf-8",
  ".otf": "font/otf", ".xml": "application/xml", ".txt": "text/plain; charset=utf-8"
};

export function byteRange(value, size) {
  const match = /^bytes=(\d*)-(\d*)$/.exec((value || "").trim());
  if (!match || !size || (!match[1] && !match[2])) return null;
  const suffix = !match[1];
  const a = Number(suffix ? match[2] : match[1]);
  const b = match[2] && !suffix ? Number(match[2]) : size - 1;
  if (!Number.isSafeInteger(a) || !Number.isSafeInteger(b) || (suffix && a === 0)) return null;
  const start = suffix ? Math.max(0, size - a) : a;
  const end = suffix ? size - 1 : Math.min(b, size - 1);
  return start >= size || end < start ? null : { start, end };
}

export function staticServer(root, { noindex = false } = {}) {
  root = resolve(root);
  return createServer(async (request, response) => {
    if (!["GET", "HEAD"].includes(request.method)) { response.writeHead(405); response.end(); return; }
    let pathname, url;
    try { url = new URL(request.url, "http://preview.invalid"); pathname = decodeURIComponent(url.pathname); }
    catch (_) { response.writeHead(400); response.end(); return; }
    const segments = pathname.split("/").filter(Boolean);
    if (segments.some((part) => part.startsWith(".") || ["node_modules", "tools", "tests", "templates", "content", "docs"].includes(part))) {
      response.writeHead(404); response.end("Not found"); return;
    }
    let file = resolve(root, "." + pathname);
    if (relative(root, file).startsWith(".." + sep) || file === resolve(root, "..")) {
      response.writeHead(403); response.end(); return;
    }
    let status = 200;
    let metadata;
    let directory = false;
    try {
      metadata = await stat(file);
      if (metadata.isDirectory()) { directory = true; file = resolve(file, "index.html"); metadata = await stat(file); }
      if (!metadata.isFile()) throw new Error("Not a file");
    } catch (_) {
      status = 404;
      file = resolve(root, "404.html");
      try { metadata = await stat(file); } catch (_) { response.writeHead(404); response.end("Not found"); return; }
    }
    if (status === 200 && (pathname.endsWith("/index.html") || (directory && !pathname.endsWith("/")))) {
      const destination = pathname.endsWith("/index.html") ? pathname.slice(0, -10) : pathname + "/";
      response.writeHead(308, { location: encodeURI(destination) + url.search, "cache-control": "public, max-age=300", ...(noindex ? { "x-robots-tag": "noindex" } : {}) });
      response.end(); return;
    }
    const etag = `"${metadata.size}-${metadata.mtimeMs}"`;
    const immutable = /\/assets\/(?:gallery|projects|video)\/[^/]*[\da-f]{16}[^/]*\.(avif|webp|jpg|mp4|webm)$/.test(file);
    const headers = {
      "content-type": types[extname(file)] || "application/octet-stream",
      "cache-control": immutable ? "public, max-age=31536000, immutable" : "no-cache",
      "x-content-type-options": "nosniff",
      "etag": etag,
      "last-modified": metadata.mtime.toUTCString(),
      "accept-ranges": "bytes",
      "vary": "Accept-Encoding",
      ...(noindex ? { "x-robots-tag": "noindex" } : {})
    };
    // Deliberately no host/origin allowlist or frame-ancestors restriction: the
    // Arena preview is proxied and embedded, not running in the visitor's localhost.
    if (request.headers["if-none-match"] === etag && status === 200) {
      response.writeHead(304, headers); response.end(); return;
    }
    if (status === 200 && request.method === "GET" && request.headers.range && (!request.headers["if-range"] || request.headers["if-range"] === etag)) {
      const range = byteRange(request.headers.range, metadata.size);
      if (!range) {
        response.writeHead(416, { ...headers, "content-range": `bytes */${metadata.size}`, "content-length": "0" });
        response.end(); return;
      }
      response.writeHead(206, { ...headers, "content-range": `bytes ${range.start}-${range.end}/${metadata.size}`, "content-length": String(range.end - range.start + 1) });
      try { await pipeline(createReadStream(file, range), response); } catch (_) { response.destroy(); }
      return;
    }
    if (/^(video|audio)\//.test(headers["content-type"])) {
      response.writeHead(status, { ...headers, "content-length": String(metadata.size) });
      if (request.method === "HEAD") { response.end(); return; }
      try { await pipeline(createReadStream(file), response); } catch (_) { response.destroy(); }
      return;
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
  const server = staticServer(root, { noindex: args.includes("--preview") });
  server.listen(port, "0.0.0.0", () => console.log(`Portfolio available on port ${port} (root: ${resolve(root)})`));
  process.on("SIGTERM", () => server.close());
  process.on("SIGINT", () => server.close());
}
