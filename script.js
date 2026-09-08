import { FILES, CREDITS, RELEASE_BASE } from "./gallery-data.js";
import { altFor, assetUrl, connectionProfile, imageMetadata, requestedImageWidth, normalizeSearch, originalUrl, parseDateFromFilename } from "./image-utils.js";
import { loadImage, clearImage } from "./image-loader.js";
import { LoadQueue } from "./load-queue.js";

const $ = (id) => document.getElementById(id);
const masonry = $("masonry");
const resultsCount = $("resultsCount");
const searchInput = $("searchInput");
const clearSearch = $("clearSearch");
const sortToggle = $("sortToggle");
const sortLabel = $("sortLabel");
const densityToggle = $("densityToggle");
const densityPopover = $("densityPopover");
const tabs = [...document.querySelectorAll(".tab")];
const segs = [...document.querySelectorAll(".seg")];
const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
let profile = connectionProfile(connection);
const queue = new LoadQueue(profile.concurrency);
const refs = [];
const nearby = new Set();
let observer;
let gridFrame = 0;
let columnWidth = 240;
let activeFilter = "all";
let searchTerm = "";
let sortMode = 0;
let visibleOrder = [];
let viewerOpen = false;
let viewerPromise;
let viewerRequest = 0;
const sortModes = ["featured", "newest", "oldest"];
const timestamps = FILES.map((file) => parseDateFromFilename(file.name));

function shuffledIndices() {
  const order = FILES.map((_, index) => index);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

// Keep the featured shuffle across reloads in the same tab: the first screen is
// already in cache. A fresh session or the shuffle button still gets a new order.
function initialOrder() {
  try {
    const saved = JSON.parse(sessionStorage.getItem("portfolio-order"));
    if (saved?.length === FILES.length && new Set(saved).size === FILES.length &&
        saved.every((i) => Number.isInteger(i) && i >= 0 && i < FILES.length)) return saved;
  } catch (_) { /* Private browsing can disable storage. */ }
  return shuffledIndices();
}
let featuredOrder = initialOrder();
function rememberOrder() {
  try { sessionStorage.setItem("portfolio-order", JSON.stringify(featuredOrder)); } catch (_) {}
}
rememberOrder();

// The production manifest has all dimensions before paint. For the build-free
// release/CDN fallback, remember natural dimensions after the first successful load.
const dimensionsKey = "portfolio-dimensions:" + RELEASE_BASE;
let rememberedDimensions = {};
try {
  const stored = JSON.parse(localStorage.getItem(dimensionsKey));
  if (stored && typeof stored === "object" && !Array.isArray(stored)) rememberedDimensions = stored;
} catch (_) {}
let saveDimensionsTimer;
function rememberDimensions(name, width, height) {
  rememberedDimensions[name] = [width, height];
  clearTimeout(saveDimensionsTimer);
  saveDimensionsTimer = setTimeout(() => {
    try { localStorage.setItem(dimensionsKey, JSON.stringify(rememberedDimensions)); } catch (_) {}
  }, 1200);
}

function refreshColumnWidth() {
  const style = getComputedStyle(masonry);
  const width = masonry.getBoundingClientRect().width;
  const gap = parseFloat(style.columnGap) || 0;
  const minWidth = parseFloat(style.columnWidth) || 240;
  const maxColumns = parseInt(style.columnCount, 10) || 5;
  const columns = Math.max(1, Math.min(maxColumns, Math.floor((width + gap) / (minWidth + gap))));
  columnWidth = Math.max(1, (width - gap * (columns - 1)) / columns);
}

function pauseQueue() {
  queue.setPaused(document.hidden || viewerOpen);
}

function scheduleGrid() {
  if (gridFrame) return;
  gridFrame = requestAnimationFrame(() => {
    gridFrame = 0;
    if (viewerOpen || document.hidden) return;
    refreshColumnWidth();
    const candidates = observer ? [...nearby] : refs.map((_, i) => i);
    // Batch layout reads before any source/DOM writes.
    const positions = candidates.map((i) => [i, refs[i].tile.getBoundingClientRect()]);
    for (const [index, rect] of positions) {
      const ref = refs[index];
      const key = "grid-" + index;
      const inRange = !ref.tile.hidden && rect.bottom > -profile.margin && rect.top < innerHeight + profile.margin;
      if (!inRange) { queue.cancel(key); continue; }
      const desiredWidth = requestedImageWidth(FILES[index], columnWidth, devicePixelRatio || 1);
      if (ref.failed || ref.loadedWidth >= desiredWidth || ref.failedUpgrade === desiredWidth) continue;
      const visible = rect.bottom > 0 && rect.top < innerHeight;
      const priority = visible ? Math.max(0, rect.top) : innerHeight + Math.abs(rect.top);
      queue.enqueue(key, priority, (signal) => loadTile(index, signal, visible));
    }
  });
}

async function loadTile(index, signal, visible) {
  const ref = refs[index];
  if (ref.tile.hidden) return;
  const previous = ref.url;
  const desiredWidth = requestedImageWidth(FILES[index], columnWidth, devicePixelRatio || 1);
  ref.tile.dataset.state = "loading";
  try {
    const result = await loadImage(ref.picture, ref.img, FILES[index], columnWidth, {
      signal, priority: visible ? "high" : "low", timeout: profile.timeout
    });
    ref.url = result.url;
    ref.loadedWidth = result.width;
    // Freeze the chosen source after native srcset negotiation. Otherwise a DPR
    // change can silently reload EVERY previously visited, now offscreen image.
    // Visible tiles are upgraded by the queue when their real size increases.
    ref.img.src = result.url;
    ref.picture.querySelector("source")?.remove();
    ref.img.removeAttribute("srcset");
    ref.img.removeAttribute("sizes");
    ref.failed = false;
    ref.error.hidden = true;
    ref.img.classList.add("loaded");
    ref.tile.dataset.state = "loaded";
    if (imageMetadata(FILES[index])) {
      setTimeout(() => {
        // Transparent PNG/AVIF pixels must reveal the original site background,
        // not a permanently blurred copy of the photo underneath.
        ref.tile.style.backgroundImage = "";
        ref.tile.style.backgroundColor = "";
      }, matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 280);
    }
    // Never change the aspect ratio once real metadata was supplied by the build.
    if (!imageMetadata(FILES[index])) {
      const { naturalWidth: width, naturalHeight: height } = ref.img;
      if (width && height) {
        ref.tile.style.aspectRatio = `${width} / ${height}`;
        ref.img.width = width;
        ref.img.height = height;
        rememberDimensions(FILES[index].name, width, height);
      }
    }
  } catch (error) {
    if (error.name === "AbortError") return;
    if (previous) {
      // A failed resolution upgrade must not erase the perfectly good thumbnail.
      clearImage(ref.picture, ref.img);
      ref.img.removeAttribute("crossorigin");
      ref.img.src = previous;
      ref.failedUpgrade = desiredWidth;
      ref.tile.dataset.state = "loaded";
    } else {
      ref.failed = true;
      ref.tile.dataset.state = "error";
      ref.error.hidden = false;
    }
  }
  // A resize/density change may have happened while this image was in flight.
  scheduleGrid();
}

function initObserver() {
  observer?.disconnect();
  nearby.clear();
  if (!("IntersectionObserver" in window)) { observer = null; scheduleGrid(); return; }
  observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const index = Number(entry.target.dataset.index);
      if (entry.isIntersecting) nearby.add(index);
      else { nearby.delete(index); queue.cancel("grid-" + index); }
    }
    scheduleGrid();
  }, { rootMargin: `${profile.margin}px 0px` });
  refs.forEach(({ tile }) => observer.observe(tile));
}

function buildGrid() {
  const fragment = document.createDocumentFragment();
  FILES.forEach((item, index) => {
    const tile = document.createElement("a");
    tile.className = "tile";
    tile.href = originalUrl(item);
    tile.target = "_blank";
    tile.rel = "noopener";
    tile.dataset.index = index;
    tile.dataset.credit = item.credit ? "collab" : "original";
    tile.dataset.state = "idle";
    tile.setAttribute("aria-label", `View ${altFor(item, index)}`);
    const search = normalizeSearch([
      item.name.replace(/[_.-]/g, " "), item.credit ? CREDITS[item.credit].linkText : "", ...(item.tags || [])
    ].join(" "));

    const plate = document.createElement("span");
    plate.className = "tile-plate";
    plate.textContent = "#" + String(index + 1).padStart(3, "0");
    plate.setAttribute("aria-hidden", "true");
    const picture = document.createElement("picture");
    const img = document.createElement("img");
    img.alt = altFor(item, index);
    img.decoding = "async";
    const metadata = imageMetadata(item);
    const remembered = rememberedDimensions[item.name];
    const width = metadata?.width || remembered?.[0];
    const height = metadata?.height || remembered?.[1];
    if (Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0) {
      tile.style.aspectRatio = `${width} / ${height}`;
      img.width = width;
      img.height = height;
    }
    if (metadata) {
      tile.style.backgroundColor = metadata.color;
      tile.style.backgroundImage = `url("${metadata.placeholder}")`;
    }
    const error = document.createElement("span");
    error.className = "tile-error";
    error.textContent = "Preview unavailable · open original";
    error.hidden = true;
    picture.appendChild(img);
    tile.append(picture, plate, error);
    refs[index] = { tile, picture, img, search, error, loadedWidth: 0, failed: false };
    fragment.appendChild(tile);
  });
  masonry.appendChild(fragment);
  applyOrder();
  applyFilters();
  initObserver();
  masonry.setAttribute("aria-busy", "false");
}

function sortedOrder() {
  if (sortMode === 0) return featuredOrder;
  const dated = FILES.map((_, i) => i).filter((i) => timestamps[i] !== null);
  const undated = FILES.map((_, i) => i).filter((i) => timestamps[i] === null);
  dated.sort((a, b) => sortMode === 1 ? timestamps[b] - timestamps[a] : timestamps[a] - timestamps[b]);
  return [...dated, ...undated];
}

function updateVisibleOrder() {
  visibleOrder = sortedOrder().filter((i) => !refs[i].tile.hidden);
}

function applyOrder() {
  const fragment = document.createDocumentFragment();
  sortedOrder().forEach((i) => fragment.appendChild(refs[i].tile));
  masonry.appendChild(fragment);
  updateVisibleOrder();
  scheduleGrid();
}

function applyFilters() {
  refs.forEach((ref, i) => {
    ref.tile.hidden = !(activeFilter === "all" || ref.tile.dataset.credit === activeFilter) ||
      !!(searchTerm && !ref.search.includes(searchTerm));
    if (ref.tile.hidden) queue.cancel("grid-" + i);
  });
  updateVisibleOrder();
  resultsCount.textContent = `Showing ${visibleOrder.length} of ${FILES.length} images`;
  $("emptyResults").hidden = visibleOrder.length !== 0;
  scheduleGrid();
}

function buildFooterCredits() {
  const fragment = document.createDocumentFragment();
  for (const key of new Set(FILES.map((item) => item.credit).filter(Boolean))) {
    const credit = CREDITS[key];
    const chip = document.createElement(credit.linkUrl ? "a" : "span");
    chip.className = "footer-credit-chip";
    if (credit.linkUrl) { chip.href = credit.linkUrl; chip.target = "_blank"; chip.rel = "noopener"; }
    const img = document.createElement("img");
    img.src = assetUrl(credit.logo);
    img.alt = "";
    img.width = img.height = 16;
    img.loading = "lazy";
    img.decoding = "async";
    img.fetchPriority = "low";
    const span = document.createElement("span");
    span.textContent = credit.linkText;
    chip.append(img, span);
    fragment.appendChild(chip);
  }
  $("footerCredits").appendChild(fragment);
}

// The viewer is downloaded only when used; it is also in the small offline shell.
function getViewer() {
  if (!viewerPromise) {
    viewerPromise = import("./lightbox.js").then(({ createLightbox }) => createLightbox({
      files: FILES,
      credits: CREDITS,
      getOrder: () => visibleOrder,
      getThumbnail: (i) => refs[i],
      getProfile: () => profile,
      onOpenChange(open) {
        viewerOpen = open;
        pauseQueue();
        if (!open) scheduleGrid();
      }
    })).catch((error) => { viewerPromise = null; throw error; });
  }
  return viewerPromise;
}

masonry.addEventListener("click", async (event) => {
  const tile = event.target.closest(".tile");
  if (!tile || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  const index = Number(tile.dataset.index);
  if (refs[index].failed) return; // The native link is a final, accessible fallback.
  event.preventDefault();
  const token = ++viewerRequest;
  closeDensityPopover();
  try {
    const viewer = await getViewer();
    if (token === viewerRequest) viewer.open(index, tile);
  } catch (_) {
    // Navigation still works if a module cannot be downloaded (e.g. offline).
    location.assign(tile.href);
  }
});

function selectTab(tab) {
  tabs.forEach((button) => {
    const active = button === tab;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
    button.tabIndex = active ? 0 : -1;
  });
  activeFilter = tab.dataset.filter;
  applyFilters();
}
tabs.forEach((tab, index) => {
  tab.tabIndex = index === 0 ? 0 : -1;
  tab.addEventListener("click", () => selectTab(tab));
  tab.addEventListener("keydown", (event) => {
    let next;
    if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
    if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = tabs.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    tabs[next].focus();
    selectTab(tabs[next]);
  });
});

let searchTimer;
function applySearch() {
  clearTimeout(searchTimer);
  searchTerm = normalizeSearch(searchInput.value);
  clearSearch.hidden = searchInput.value.length === 0;
  applyFilters();
  const url = new URL(location.href);
  if (searchInput.value.trim()) url.searchParams.set("q", searchInput.value.trim());
  else url.searchParams.delete("q");
  try { history.replaceState(null, "", url); } catch (_) {}
}
searchInput.addEventListener("input", () => {
  clearSearch.hidden = !searchInput.value.length;
  clearTimeout(searchTimer);
  searchTimer = setTimeout(applySearch, 150);
});
$("searchForm").addEventListener("submit", (event) => { event.preventDefault(); applySearch(); });
clearSearch.addEventListener("click", () => { searchInput.value = ""; applySearch(); searchInput.focus(); });

function updateSort() {
  const label = { featured: "Featured", newest: "Newest", oldest: "Oldest" }[sortModes[sortMode]];
  sortLabel.textContent = label;
  sortToggle.setAttribute("aria-label", "Sort order: " + label);
  sortToggle.classList.toggle("is-active", sortMode !== 0);
  applyOrder();
}
$("shuffleBtn").addEventListener("click", () => {
  featuredOrder = shuffledIndices();
  rememberOrder();
  sortMode = 0;
  updateSort();
});
sortToggle.addEventListener("click", () => { sortMode = (sortMode + 1) % sortModes.length; updateSort(); });

function closeDensityPopover() {
  densityPopover.hidden = true;
  densityToggle.setAttribute("aria-expanded", "false");
}
densityToggle.addEventListener("click", () => {
  if (!densityPopover.hidden) { closeDensityPopover(); return; }
  const rect = densityToggle.getBoundingClientRect();
  densityPopover.style.top = (rect.bottom + 10) + "px";
  densityPopover.style.right = Math.max(12, innerWidth - rect.right) + "px";
  densityPopover.hidden = false;
  densityToggle.setAttribute("aria-expanded", "true");
});
document.addEventListener("click", (event) => {
  if (!densityPopover.hidden && !densityPopover.contains(event.target) && !densityToggle.contains(event.target)) closeDensityPopover();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !densityPopover.hidden) { closeDensityPopover(); densityToggle.focus(); }
});
segs.forEach((seg) => seg.addEventListener("click", () => {
  segs.forEach((button) => {
    button.classList.toggle("active", button === seg);
    button.setAttribute("aria-pressed", String(button === seg));
  });
  masonry.dataset.density = seg.dataset.density;
  closeDensityPopover();
  scheduleGrid();
}));

let lastScrollY = scrollY;
let scrollFrame = 0;
window.addEventListener("scroll", () => {
  if (scrollFrame) return;
  scrollFrame = requestAnimationFrame(() => {
    scrollFrame = 0;
    if (!viewerOpen) {
      const y = scrollY;
      $("siteHeader").classList.toggle("hide", y > lastScrollY && y > 120);
      lastScrollY = y;
    }
    closeDensityPopover();
    scheduleGrid();
  });
}, { passive: true });
let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => { closeDensityPopover(); scheduleGrid(); }, 120);
});
if ("ResizeObserver" in window) new ResizeObserver(scheduleGrid).observe(masonry);
connection?.addEventListener("change", () => {
  profile = connectionProfile(connection);
  queue.setLimit(profile.concurrency);
  initObserver();
  pauseQueue();
});
document.addEventListener("visibilitychange", () => { pauseQueue(); if (!document.hidden) scheduleGrid(); });
window.addEventListener("online", () => {
  refs.forEach((ref) => { ref.failed = false; ref.failedUpgrade = 0; });
  scheduleGrid();
});
window.addEventListener("pageshow", () => { pauseQueue(); scheduleGrid(); });

const query = new URLSearchParams(location.search).get("q");
if (query) { searchInput.value = query; searchTerm = normalizeSearch(query); clearSearch.hidden = false; }
buildGrid();
buildFooterCredits();
pauseQueue();

// Do not let service-worker installation compete with the first visible photos.
if ("serviceWorker" in navigator) {
  const register = () => {
    const run = () => navigator.serviceWorker.register(assetUrl("sw.js"), { updateViaCache: "none" }).catch(() => {});
    if ("requestIdleCallback" in window) requestIdleCallback(run, { timeout: 4000 });
    else setTimeout(run, 1500);
  };
  if (document.readyState === "complete") register();
  else window.addEventListener("load", register, { once: true });
}
