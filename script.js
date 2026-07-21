const RELEASE_BASE = "https://github.com/MaxLananas/Asset-Portfolio/releases/download/images-v1/";

const CREDITS = {
  bte: { text: "Made within the", linkText: "BuildTheEarth France", linkUrl: null, logo: "Logo_BTE_France-3632312792.png" },
  endorah: { text: "Volunteer build for the non-profit", linkText: "Endorah", linkUrl: "https://endorah.net/", logo: "cropped-500x500Endorah_-_Copie-2322200814.png" },
  fight4glory: { text: "Built for the event", linkText: "Fight4Glory", linkUrl: null, logo: "image_v2-Photoroom.png" },
  mrbeast: { text: "10-builder collaboration featured in a video by", linkText: "MrBeast", linkUrl: "https://www.youtube.com/watch?v=qTMKHZelGAs", logo: "1701523229mr-beast-logo-transparent-background-2847774365.png" }
};

const FILES = [
  { name: "2025-01-27_20.55.35.png", tags: [] },
  { name: "2025-04-13_12.19.39.png", tags: [] },
  { name: "2025-04-17_21.24.15.png", tags: [] },
  { name: "2025-04-17_21.24.28.png", tags: [] },
  { name: "2025-04-17_21.24.35.png", tags: [] },
  { name: "2025-04-27_15.00.38.png", tags: [] },
  { name: "2025-05-26_17.29.47.png", tags: [] },
  { name: "2025-06-04_15.53.50.png", credit: "bte", tags: [] },
  { name: "2025-06-10_19.05.39.png", credit: "bte", tags: [] },
  { name: "2025-06-10_19.09.43.png", credit: "bte", tags: [] },
  { name: "2025-06-13_11.07.58.png", credit: "bte", tags: [] },
  { name: "2025-06-30_21.09.22.png", tags: [] },
  { name: "2025-06-30_22.06.58.png", tags: [] },
  { name: "2025-07-09_19.07.32.png", tags: [] },
  { name: "2025-07-14_17.18.52.png", tags: [] },
  { name: "2025-07-14_17.21.46.png", tags: [] },
  { name: "2025-07-14_17.26.17.png", tags: [] },
  { name: "2025-07-15_13.03.23.png", tags: [] },
  { name: "2025-07-18_15.18.06.png", tags: [] },
  { name: "2025-07-19_22.41.22.png", credit: "endorah", tags: [] },
  { name: "2025-07-21_18.17.35.png", tags: [] },
  { name: "2025-09-13_19.31.36.png", tags: [] },
  { name: "2025-09-13_20.22.36.png", tags: [] },
  { name: "2025-09-18_13.23.02.png", tags: [] },
  { name: "2025-09-18_13.23.25.png", tags: [] },
  { name: "2025-09-18_13.23.41.png", tags: [] },
  { name: "2025-09-18_13.26.41.png", tags: [] },
  { name: "2025-09-18_13.27.22.png", tags: [] },
  { name: "2025-09-18_13.27.54.png", tags: [] },
  { name: "2025-09-18_13.31.06.png", tags: [] },
  { name: "2025-09-20_18.52.59.png", credit: "bte", tags: [] },
  { name: "2025-09-25_21.45.27.png", tags: [] },
  { name: "2025-10-19_13.50.46.png", tags: [] },
  { name: "2025-10-19_13.51.00.png", tags: [] },
  { name: "2025-10-19_13.51.24.png", tags: [] },
  { name: "2025-10-23_17.38.26.png", tags: [] },
  { name: "2025-10-23_17.38.40.png", tags: [] },
  { name: "2025-10-24_23.07.50.png", tags: [] },
  { name: "2025-10-25_01.04.04.png", tags: [] },
  { name: "2025-10-25_01.04.17.png", tags: [] },
  { name: "2025-10-25_02.01.55.png", tags: [] },
  { name: "2025-10-25_02.02.23.png", tags: [] },
  { name: "2025-10-27_17.32.34.png", tags: [] },
  { name: "2025-10-27_17.56.40.png", tags: [] },
  { name: "2025-10-27_17.56.53.png", tags: [] },
  { name: "2025-10-29_17.00.15.png", credit: "mrbeast", tags: [] },
  { name: "2025-10-29_17.47.57.png", credit: "mrbeast", tags: [] },
  { name: "2025-10-30_21.38.03.png", tags: [] },
  { name: "2025-10-31_17.24.05.png", tags: [] },
  { name: "2025-11-02_21.24.44.png", tags: [] },
  { name: "2025-11-02_21.24.53.png", tags: [] },
  { name: "2025-11-02_22.00.18.png", tags: [] },
  { name: "2025-11-16_14.56.40.png", credit: "mrbeast", tags: [] },
  { name: "2025-11-16_15.08.49.png", credit: "mrbeast", tags: [] },
  { name: "2025-11-22_11.02.49.png", tags: [] },
  { name: "2025-11-22_11.04.22.png", tags: [] },
  { name: "2025-12-09_18.58.54.png", tags: [] },
  { name: "2025-12-09_18.59.03.png", tags: [] },
  { name: "2025-12-24_13.51.44.png", tags: [] },
  { name: "2025-12-24_13.51.51.png", tags: [] },
  { name: "2026-01-03_01.34.48.png", credit: "bte", tags: [] },
  { name: "2026-01-03_01.35.07.png", credit: "bte", tags: [] },
  { name: "2026-01-03_01.35.57.png", credit: "bte", tags: [] },
  { name: "2026-01-03_01.37.11.png", credit: "bte", tags: [] },
  { name: "2026-04-01_21.07.14.png", credit: "bte", tags: [] },
  { name: "2026-04-01_21.07.28.png", credit: "bte", tags: [] },
  { name: "2026-05-30_15.23.36.png", tags: [] },
  { name: "2026-07-02_16.20.56.png", tags: [] },
  { name: "2026-07-06_21.59.15_4K.png", tags: [] },
  { name: "2026-07-06_21.59.35_4K.png", credit: "bte", tags: [] },
  { name: "chateau_loire.png", credit: "endorah", tags: [] },
  { name: "circuit24hdumans.jpg", credit: "bte", tags: [] },
  { name: "larresingle.jpg", credit: "bte", tags: [] },
  { name: "little-bridge.png", credit: "bte", tags: [] },
  { name: "maisonbois.png", tags: [] },
  { name: "Mt_Blanc_cut.png", tags: [] },
  { name: "Ocapiat-01.png", credit: "endorah", tags: [] },
  { name: "Parentis.png", tags: [] },
  { name: "pontneufv1.png", tags: [] },
  { name: "potfleur.png", tags: [] },
  { name: "sans_nom-2-1.jpg", credit: "bte", tags: [] },
  { name: "Shot_01.jpg", credit: "endorah", tags: [] },
  { name: "Shot_03.1.jpg", credit: "endorah", tags: [] },
  { name: "Shot_03.jpg", credit: "endorah", tags: [] },
  { name: "Shot_06.2.png", credit: "endorah", tags: [] },
  { name: "Slide_1.png", credit: "mrbeast", tags: [] },
  { name: "Slide_2.png", credit: "mrbeast", tags: [] },
  { name: "spawnfight4glory.jpg", credit: "fight4glory", tags: [] },
  { name: "Streaming-768x432.jpg", credit: "endorah", tags: [] },
  { name: "untitled-2.jpg", credit: "bte", tags: [] },
  { name: "untitled.jpg", tags: [] },
  { name: "untitled3-2.jpg", credit: "bte", tags: [] },
  { name: "untitled3.jpg", tags: [] },
  { name: "CIRCUITxDIRIGEABLE.jpg", credit: "bte", tags: [] },
  { name: "Larressingle.png", credit: "bte", tags: [] },
  { name: "Lemans_-_france5.jpg", credit: "bte", tags: [] },
  { name: "Lemans_-_large.png", credit: "bte", tags: [] },
  { name: "Occi.png", credit: "bte", tags: [] },
  { name: "untitled11.jpg", credit: "bte", tags: [] },
  { name: "untitled13.jpg", credit: "bte", tags: [] },
  { name: "untitled18.jpg", credit: "bte", tags: [] }
];

function parseDateFromFilename(name) {
  const m = name.match(/^(\d{4})-(\d{2})-(\d{2})_(\d{2})\.(\d{2})\.(\d{2})/);
  if (!m) return null;
  return new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]).getTime();
}
FILES.forEach((f) => { f.ts = parseDateFromFilename(f.name); });

function getConnectionProfile() {
  const c = navigator.connection;
  if (!c) return { scale: 1, quality: 80 };
  if (c.saveData) return { scale: .55, quality: 58 };
  if (c.effectiveType === "2g" || c.effectiveType === "slow-2g") return { scale: .55, quality: 55 };
  if (c.effectiveType === "3g") return { scale: .8, quality: 66 };
  return { scale: 1, quality: 80 };
}

function buildImageUrl(filename, width, quality) {
  const source = RELEASE_BASE + encodeURIComponent(filename);
  const params = new URLSearchParams({ url: source, w: Math.max(16, Math.round(width)), q: quality });
  return "https://wsrv.nl/?" + params.toString();
}

function shuffledIndices(len) {
  const arr = Array.from({ length: len }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const profile = getConnectionProfile();
const tileRefs = [];
const SORT_MODES = ["featured", "newest", "oldest"];
let sortModeIndex = 0;
let shuffleOrder = shuffledIndices(FILES.length);
let activeFilter = "all";
let searchTerm = "";
let currentIndex = 0;
let observer;
let cachedColWidth = 0;

const masonry = document.getElementById("masonry");
const resultsCount = document.getElementById("resultsCount");
const lightbox = document.getElementById("lightbox");
const lbImg = document.getElementById("lbImg");
const lbCaption = document.getElementById("lbCaption");
const lbClose = document.getElementById("lbClose");
const lbPrev = document.getElementById("lbPrev");
const lbNext = document.getElementById("lbNext");
const siteHeader = document.getElementById("siteHeader");
const searchInput = document.getElementById("searchInput");
const clearSearch = document.getElementById("clearSearch");
const shuffleBtn = document.getElementById("shuffleBtn");
const sortToggle = document.getElementById("sortToggle");
const sortLabel = document.getElementById("sortLabel");
const densityToggle = document.getElementById("densityToggle");
const densityPopover = document.getElementById("densityPopover");
const footerCredits = document.getElementById("footerCredits");
const tabs = document.querySelectorAll(".tab");
const segs = document.querySelectorAll(".seg");

function estimateColumnWidth() {
  const containerWidth = masonry.getBoundingClientRect().width || window.innerWidth;
  const density = masonry.dataset.density;
  const w = window.innerWidth;
  let maxCols, minWidth, gap;
  if (density === "compact") {
    if (w <= 640) { maxCols = 2; minWidth = 130; gap = 6; }
    else if (w <= 1024) { maxCols = 4; minWidth = 150; gap = 6; }
    else { maxCols = 7; minWidth = 170; gap = 6; }
  } else {
    if (w <= 640) { maxCols = 2; minWidth = 150; gap = 6; }
    else if (w <= 1024) { maxCols = 3; minWidth = 190; gap = 8; }
    else { maxCols = 5; minWidth = 240; gap = 8; }
  }
  const cols = Math.max(1, Math.min(maxCols, Math.floor((containerWidth + gap) / (minWidth + gap))));
  return Math.max(minWidth, Math.floor((containerWidth - gap * (cols - 1)) / cols));
}

function refreshColumnWidth() { cachedColWidth = estimateColumnWidth(); }

function computeLoadWidth() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  return Math.min(1000, Math.round(cachedColWidth * dpr * profile.scale / 40) * 40);
}

function debounce(fn, delay) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
}

function loadTileImage(img, tile, index) {
  const item = FILES[index];
  const full = new Image();
  full.src = buildImageUrl(item.name, computeLoadWidth(), profile.quality);
  full.onload = () => {
    img.src = full.src;
    img.classList.add("loaded");
    if (full.naturalWidth && full.naturalHeight) {
      tile.style.aspectRatio = full.naturalWidth + " / " + full.naturalHeight;
    }
  };
  full.onerror = () => {
    img.src = RELEASE_BASE + encodeURIComponent(item.name);
    img.classList.add("loaded");
  };
}

function initObserver() {
  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const img = entry.target;
      const index = Number(img.dataset.index);
      const tile = img.closest(".tile");
      loadTileImage(img, tile, index);
      observer.unobserve(img);
    });
  }, { rootMargin: "400px 0px" });
}

function altFor(item) {
  return "Minecraft build by MaxLananas";
}

function buildGrid() {
  refreshColumnWidth();
  const fragment = document.createDocumentFragment();

  FILES.forEach((item, index) => {
    const tile = document.createElement("div");
    tile.className = "tile";
    tile.dataset.credit = item.credit ? "collab" : "original";
    const searchBits = [
      item.name.replace(/[_.-]/g, " "),
      item.credit ? CREDITS[item.credit].linkText : "",
      (item.tags || []).join(" ")
    ];
    tile.dataset.search = searchBits.join(" ").toLowerCase();

    const plate = document.createElement("span");
    plate.className = "tile-plate";
    plate.textContent = "#" + String(index + 1).padStart(3, "0");
    tile.appendChild(plate);

    const img = document.createElement("img");
    img.alt = altFor(item);
    img.decoding = "async";
    img.dataset.index = index;
    tile.appendChild(img);

    tile.addEventListener("click", () => openLightbox(index));
    tileRefs[index] = tile;
    fragment.appendChild(tile);
  });

  masonry.appendChild(fragment);

  const imgs = masonry.querySelectorAll(".tile img");
  imgs.forEach((img, i) => {
    if (i < 6) loadTileImage(img, img.closest(".tile"), i);
    else observer.observe(img);
  });

  applyOrder();
  applyFilters();
}

function buildFooterCredits() {
  const seen = new Set();
  FILES.forEach((item) => { if (item.credit) seen.add(item.credit); });
  seen.forEach((key) => {
    const c = CREDITS[key];
    if (!c) return;
    const chip = document.createElement(c.linkUrl ? "a" : "span");
    chip.className = "footer-credit-chip";
    if (c.linkUrl) { chip.href = c.linkUrl; chip.target = "_blank"; chip.rel = "noopener"; }
    const img = document.createElement("img");
    img.src = c.logo; img.alt = ""; img.loading = "lazy"; img.decoding = "async";
    const span = document.createElement("span");
    span.textContent = c.linkText;
    chip.appendChild(img); chip.appendChild(span);
    footerCredits.appendChild(chip);
  });
}

function computeSortedOrder() {
  const mode = SORT_MODES[sortModeIndex];
  if (mode === "featured") return shuffleOrder;
  const withTs = FILES.map((f, i) => ({ i, ts: f.ts }));
  const dated = withTs.filter((x) => x.ts !== null);
  const undated = withTs.filter((x) => x.ts === null).map((x) => x.i);
  dated.sort((a, b) => (mode === "newest" ? b.ts - a.ts : a.ts - b.ts));
  return [...dated.map((x) => x.i), ...undated];
}

function applyOrder() {
  const order = computeSortedOrder();
  const fragment = document.createDocumentFragment();
  order.forEach((idx) => fragment.appendChild(tileRefs[idx]));
  masonry.appendChild(fragment);
}

function applyFilters() {
  let visibleCount = 0;
  tileRefs.forEach((tile) => {
    const matchesTab = activeFilter === "all" || tile.dataset.credit === activeFilter;
    const matchesSearch = !searchTerm || tile.dataset.search.includes(searchTerm);
    const visible = matchesTab && matchesSearch;
    tile.hidden = !visible;
    if (visible) visibleCount++;
  });
  resultsCount.textContent = "Showing " + visibleCount + " of " + FILES.length + " builds";
}

function renderLightbox() {
  const item = FILES[currentIndex];
  lbImg.src = buildImageUrl(item.name, 1600, 85);
  lbImg.alt = altFor(item);

  [currentIndex - 1, currentIndex + 1].forEach((i) => {
    const n = ((i % FILES.length) + FILES.length) % FILES.length;
    const pre = new Image();
    pre.src = buildImageUrl(FILES[n].name, 1600, 85);
  });

  if (item.credit && CREDITS[item.credit]) {
    const c = CREDITS[item.credit];
    const link = c.linkUrl ? `<a href="${c.linkUrl}" target="_blank" rel="noopener">${c.linkText}</a>` : `<strong>${c.linkText}</strong>`;
    lbCaption.innerHTML = `<img src="${c.logo}" alt="">${c.text} ${link}`;
    lbCaption.style.display = "flex";
  } else {
    lbCaption.innerHTML = "";
    lbCaption.style.display = "none";
  }
}

function openLightbox(index) {
  currentIndex = index;
  renderLightbox();
  lightbox.classList.add("open");
  document.body.style.overflow = "hidden";
  lbClose.focus();
}

function closeLightbox() {
  lightbox.classList.remove("open");
  document.body.style.overflow = "";
}

function showNext() { currentIndex = (currentIndex + 1) % FILES.length; renderLightbox(); }
function showPrev() { currentIndex = (currentIndex - 1 + FILES.length) % FILES.length; renderLightbox(); }

lbClose.addEventListener("click", closeLightbox);
lbNext.addEventListener("click", showNext);
lbPrev.addEventListener("click", showPrev);
lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });

let touchStartX = 0;
lightbox.addEventListener("touchstart", (e) => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
lightbox.addEventListener("touchend", (e) => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) < 40) return;
  if (dx < 0) showNext(); else showPrev();
}, { passive: true });

document.addEventListener("keydown", (e) => {
  if (!lightbox.classList.contains("open")) return;
  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowRight") showNext();
  if (e.key === "ArrowLeft") showPrev();
});

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => { t.classList.remove("active"); t.setAttribute("aria-selected", "false"); });
    tab.classList.add("active");
    tab.setAttribute("aria-selected", "true");
    activeFilter = tab.dataset.filter;
    applyFilters();
  });
});

let searchDebounce;
searchInput.addEventListener("input", () => {
  clearSearch.hidden = searchInput.value.length === 0;
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => {
    searchTerm = searchInput.value.trim().toLowerCase();
    applyFilters();
  }, 150);
});

clearSearch.addEventListener("click", () => {
  searchInput.value = "";
  clearSearch.hidden = true;
  searchTerm = "";
  applyFilters();
  searchInput.focus();
});

shuffleBtn.addEventListener("click", () => {
  shuffleOrder = shuffledIndices(FILES.length);
  sortModeIndex = 0;
  sortToggle.classList.remove("is-active");
  sortLabel.textContent = "Featured";
  sortToggle.setAttribute("aria-label", "Sort order: Featured");
  applyOrder();
});

sortToggle.addEventListener("click", () => {
  sortModeIndex = (sortModeIndex + 1) % SORT_MODES.length;
  const mode = SORT_MODES[sortModeIndex];
  const labels = { featured: "Featured", newest: "Newest", oldest: "Oldest" };
  sortLabel.textContent = labels[mode];
  sortToggle.setAttribute("aria-label", "Sort order: " + labels[mode]);
  sortToggle.classList.toggle("is-active", mode !== "featured");
  applyOrder();
});

function openDensityPopover() {
  const rect = densityToggle.getBoundingClientRect();
  densityPopover.style.top = (rect.bottom + 10) + "px";
  densityPopover.style.right = (window.innerWidth - rect.right) + "px";
  densityPopover.hidden = false;
  densityToggle.setAttribute("aria-expanded", "true");
}

function closeDensityPopover() {
  densityPopover.hidden = true;
  densityToggle.setAttribute("aria-expanded", "false");
}

densityToggle.addEventListener("click", () => {
  if (densityPopover.hidden) openDensityPopover();
  else closeDensityPopover();
});

document.addEventListener("click", (e) => {
  if (!densityPopover.hidden && !e.target.closest(".popover-wrap")) closeDensityPopover();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !densityPopover.hidden) { closeDensityPopover(); densityToggle.focus(); }
});

window.addEventListener("scroll", () => { if (!densityPopover.hidden) closeDensityPopover(); }, { passive: true });

segs.forEach((seg) => {
  seg.addEventListener("click", () => {
    segs.forEach((s) => s.classList.remove("active"));
    seg.classList.add("active");
    masonry.dataset.density = seg.dataset.density;
    refreshColumnWidth();
    closeDensityPopover();
  });
});

let lastScrollY = 0;
let scrollTicking = false;
window.addEventListener("scroll", () => {
  if (scrollTicking) return;
  scrollTicking = true;
  requestAnimationFrame(() => {
    const y = window.scrollY;
    if (y > lastScrollY && y > 120) siteHeader.classList.add("hide");
    else siteHeader.classList.remove("hide");
    lastScrollY = y;
    scrollTicking = false;
  });
}, { passive: true });

window.addEventListener("resize", debounce(() => {
  refreshColumnWidth();
  if (!densityPopover.hidden) closeDensityPopover();
}, 200));

function initQueryParam() {
  const params = new URLSearchParams(location.search);
  const q = params.get("q");
  if (q) {
    searchInput.value = q;
    searchTerm = q.trim().toLowerCase();
    clearSearch.hidden = false;
  }
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}

initObserver();
initQueryParam();
buildGrid();
buildFooterCredits();
