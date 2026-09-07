import { RELEASE_BASE } from "./gallery-data.js";
import { IMAGE_MANIFEST } from "./image-manifest.js";

// Shared sizes, not an almost-unique URL for every screen. More browser/CDN cache hits.
export const IMAGE_WIDTHS = [320, 640, 960, 1600, 2560];
export const GRID_MAX_WIDTH = 960;

export function connectionProfile(connection) {
  const type = connection?.effectiveType;
  if (connection?.saveData || type === "slow-2g" || type === "2g") {
    return { concurrency: 2, margin: 0, prefetch: false, timeout: 60000 };
  }
  if (type === "3g") {
    return { concurrency: 3, margin: 160, prefetch: false, timeout: 45000 };
  }
  return {
    concurrency: 4,
    margin: 400,
    // An unknown connection is NOT permission to download extra full-size photos.
    prefetch: type === "4g" && connection.downlink >= 5 && connection.rtt <= 150,
    timeout: 30000
  };
}

export function originalUrl(item) {
  return RELEASE_BASE + encodeURIComponent(item.name);
}

export function imageMetadata(item) {
  return IMAGE_MANIFEST[item.name];
}

export function selectWidth(cssWidth, dpr = 1, widths = IMAGE_WIDTHS) {
  const target = Math.max(1, cssWidth) * Math.max(1, dpr);
  return widths.find((width) => width >= target) || widths[widths.length - 1];
}

export function proxyUrl(item, width) {
  const params = new URLSearchParams({
    url: originalUrl(item),
    w: String(width),
    // Without output=webp the service returns PNG for PNG originals, and ignores q!
    output: "webp",
    q: "90",
    we: "", // Do not upscale a small original.
    maxage: "1y"
  });
  return "https://wsrv.nl/?" + params;
}

// Hot scroll/resize path: determine only the needed width. Do not construct
// srcsets, encode release URLs or allocate URLSearchParams on every animation frame.
export function requestedImageWidth(item, cssWidth, dpr = 1, purpose = "grid") {
  const widths = imageMetadata(item)?.widths || IMAGE_WIDTHS;
  const maxWidth = purpose === "grid" ? GRID_MAX_WIDTH : IMAGE_WIDTHS[IMAGE_WIDTHS.length - 1];
  const target = Math.max(1, cssWidth) * Math.max(1, dpr);
  let chosen = widths[0];
  for (const width of widths) {
    if (width > maxWidth) break;
    chosen = width;
    if (width >= target) break;
  }
  return chosen;
}

export function imageSources(item, cssWidth, dpr = 1, purpose = "grid") {
  const metadata = imageMetadata(item);
  const maxWidth = purpose === "grid" ? GRID_MAX_WIDTH : IMAGE_WIDTHS[IMAGE_WIDTHS.length - 1];
  const allWidths = metadata?.widths || IMAGE_WIDTHS;
  let widths = allWidths.filter((width) => width <= maxWidth);
  if (!widths.length) widths = [allWidths[0]];
  const width = requestedImageWidth(item, cssWidth, dpr, purpose);
  const urlFor = (size, format) => `${metadata.base}-${size}.${format}`;
  return {
    width,
    sizes: `${Math.max(1, Math.ceil(cssWidth))}px`,
    avif: metadata ? widths.map((w) => `${urlFor(w, "avif")} ${w}w`).join(", ") : "",
    webp: widths.map((w) => `${metadata ? urlFor(w, "webp") : proxyUrl(item, w)} ${w}w`).join(", "),
    src: metadata ? urlFor(width, "webp") : proxyUrl(item, width),
    proxy: proxyUrl(item, width),
    original: originalUrl(item)
  };
}

export function parseDateFromFilename(name) {
  const match = name.match(/^(\d{4})-(\d{2})-(\d{2})_(\d{2})\.(\d{2})\.(\d{2})/);
  return match ? Date.UTC(+match[1], +match[2] - 1, +match[3], +match[4], +match[5], +match[6]) : null;
}

export function normalizeSearch(value) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

export function altFor(item, index) {
  const title = item.name.replace(/\.[^.]+$/, "").replace(/[_.-]/g, " ");
  return `Minecraft build #${String(index + 1).padStart(3, "0")} by MaxLananas — ${title}`;
}
