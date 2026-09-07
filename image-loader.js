import { imageSources } from "./image-utils.js";

export function clearImage(picture, img) {
  picture.querySelector("source")?.remove();
  img.removeAttribute("srcset");
  img.removeAttribute("src");
}

// Use the browser's image pipeline: streaming, format negotiation, srcset,
// request priority, HTTP/decode caches. No fetch -> blob -> bitmap -> object URL
// round trip and no retained object URLs for 101 photos.
export function loadImage(picture, img, item, cssWidth, {
  signal,
  priority = "auto",
  purpose = "grid",
  timeout = 30000,
  fallback = true,
  dpr = window.devicePixelRatio || 1
} = {}) {
  const sources = imageSources(item, cssWidth, dpr, purpose);
  return new Promise((resolve, reject) => {
    let finished = false;
    let timer;
    let generation = 0;
    let attempt = 0;
    // Try a single WebP after a broken AVIF/local file, then the proxy, then the
    // untouched original ONCE. Never recurse indefinitely on a missing original.
    const fallbacks = fallback === "local"
      ? (sources.avif ? [sources.src] : [])
      : fallback ? [...new Set([...(sources.avif ? [sources.src, sources.proxy] : []), sources.original])] : [];

    const cleanup = () => {
      clearTimeout(timer);
      img.onload = null;
      img.onerror = null;
      signal?.removeEventListener("abort", abort);
    };
    const finish = (error) => {
      if (finished) return;
      finished = true;
      cleanup();
      if (error) reject(error);
      else {
        const url = img.currentSrc || img.src;
        const selected = new URL(url, document.baseURI);
        const encodedWidth = Number(selected.searchParams.get("w") || selected.pathname.match(/-(\d+)\.(?:avif|webp)$/)?.[1]);
        resolve({ url, width: encodedWidth || (url === sources.original ? img.naturalWidth : sources.width) });
      }
    };
    const abort = () => {
      generation++;
      clearImage(picture, img);
      finish(new DOMException("Image request cancelled", "AbortError"));
    };
    const armTimeout = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        clearImage(picture, img);
        finish(new Error("Image request timed out"));
      }, timeout);
    };
    const fail = () => {
      if (finished) return;
      generation++;
      const failedUrl = img.currentSrc || img.src;
      while (attempt < fallbacks.length && new URL(fallbacks[attempt], document.baseURI).href === failedUrl) attempt++;
      // Do not fall back to megabyte originals when there is no network at all.
      if (navigator.onLine === false || attempt >= fallbacks.length) {
        finish(new Error("Image unavailable"));
        return;
      }
      const url = fallbacks[attempt++];
      picture.querySelector("source")?.remove();
      img.removeAttribute("srcset");
      if (url === sources.original) img.removeAttribute("crossorigin");
      else img.crossOrigin = "anonymous";
      img.src = url;
      armTimeout();
    };

    img.onload = async () => {
      const token = generation;
      try { await img.decode?.(); } catch (_) { /* Safari can reject decode after a successful load. */ }
      if (finished || token !== generation) return;
      if (img.naturalWidth) finish();
      else fail();
    };
    img.onerror = fail;
    if (signal?.aborted) { abort(); return; }
    signal?.addEventListener("abort", abort, { once: true });
    img.decoding = "async";
    img.loading = "eager"; // Our viewport-aware queue is the only lazy loader.
    img.fetchPriority = priority;
    img.crossOrigin = "anonymous";
    img.sizes = sources.sizes;
    let source = picture.querySelector("source");
    if (sources.avif) {
      if (!source) {
        source = document.createElement("source");
        source.type = "image/avif";
        picture.insertBefore(source, img);
      }
      source.sizes = sources.sizes;
      source.srcset = sources.avif;
    } else source?.remove();
    img.srcset = sources.webp;
    img.src = sources.src;
    armTimeout();
  });
}
