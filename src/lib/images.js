import { RELEASE_BASE } from "../data/builds";

export function sourceUrl(filename) {
  return RELEASE_BASE + encodeURIComponent(filename);
}

export function proxyChain(filename, width, quality) {
  const w = Math.max(16, Math.round(width));
  const q = Math.max(30, Math.round(quality));
  const enc = encodeURIComponent(sourceUrl(filename));
  return [
    `https://wsrv.nl/?url=${enc}&w=${w}&q=${q}&output=webp&il`,
    `https://images.weserv.nl/?url=${enc}&w=${w}&q=${q}&output=webp`,
    sourceUrl(filename),
  ];
}

export function connectionProfile() {
  const c = navigator.connection;
  if (!c) return { scale: 1, quality: 72, concurrency: 4 };
  if (c.saveData) return { scale: 0.42, quality: 42, concurrency: 1 };
  if (c.effectiveType === "2g" || c.effectiveType === "slow-2g") {
    return { scale: 0.42, quality: 40, concurrency: 1 };
  }
  if (c.effectiveType === "3g") return { scale: 0.65, quality: 55, concurrency: 2 };
  return { scale: 1, quality: 72, concurrency: 4 };
}

export function loadImageChain(urls, signal) {
  return new Promise((resolve, reject) => {
    const im = new Image();
    im.decoding = "async";
    im.crossOrigin = "anonymous";
    let i = 0;
    const abort = () => {
      im.onload = im.onerror = null;
      im.src = "";
      reject(new DOMException("Aborted", "AbortError"));
    };
    if (signal) {
      if (signal.aborted) return abort();
      signal.addEventListener("abort", abort, { once: true });
    }
    const next = () => {
      if (signal?.aborted) return abort();
      if (i >= urls.length) {
        im.onload = im.onerror = null;
        reject(new Error("all sources failed"));
        return;
      }
      im.onload = () => resolve(im);
      im.onerror = () => {
        i += 1;
        next();
      };
      im.src = urls[i];
    };
    next();
  });
}

export function progressiveLoad(img, filename, width, quality, signal) {
  const lqip = proxyChain(filename, 32, 30)[0];
  if (!img.src) {
    img.src = lqip;
    img.classList.add("lqip");
  }
  return loadImageChain(proxyChain(filename, width, quality), signal).then((im) => {
    if (signal?.aborted) return im;
    img.src = im.src;
    img.classList.remove("lqip");
    img.classList.add("loaded");
    return im;
  });
}
