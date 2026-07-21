const RELEASE_BASE = "https://github.com/MaxLananas/Asset-Portfolio/releases/download/images-v1/";

const CREDITS = {
  bte: { text: "Realized within the", linkText: "BuildTheEarth France", linkUrl: null, logo: "Logo_BTE_France-3632312792.png" },
  endorah: { text: "Volunteer build for the non-profit", linkText: "Endorah", linkUrl: "https://endorah.net/", logo: "cropped-500x500Endorah_-_Copie-2322200814.png" },
  fight4glory: { text: "Built for the event", linkText: "Fight4Glory", linkUrl: null, logo: "image_v2-Photoroom.png" },
  mrbeast: { text: "10-builder collaboration featured in a video by", linkText: "MrBeast", linkUrl: "https://www.youtube.com/watch?v=qTMKHZelGAs", logo: "1701523229mr-beast-logo-transparent-background-2847774365.png" }
};

const FILES = [
  { name: "2025-01-27_20.55.35.png" },
  { name: "2025-04-13_12.19.39.png" },
  { name: "2025-04-17_21.24.15.png" },
  { name: "2025-04-17_21.24.28.png" },
  { name: "2025-04-17_21.24.35.png" },
  { name: "2025-04-27_15.00.38.png" },
  { name: "2025-05-26_17.29.47.png" },
  { name: "2025-06-04_15.53.50.png", credit: "bte" },
  { name: "2025-06-10_19.05.39.png", credit: "bte" },
  { name: "2025-06-10_19.09.43.png", credit: "bte" },
  { name: "2025-06-13_11.07.58.png", credit: "bte" },
  { name: "2025-06-30_21.09.22.png" },
  { name: "2025-06-30_22.06.58.png" },
  { name: "2025-07-09_19.07.32.png" },
  { name: "2025-07-14_17.18.52.png" },
  { name: "2025-07-14_17.21.46.png" },
  { name: "2025-07-14_17.26.17.png" },
  { name: "2025-07-15_13.03.23.png" },
  { name: "2025-07-18_15.18.06.png" },
  { name: "2025-07-19_22.41.22.png", credit: "endorah" },
  { name: "2025-07-21_18.17.35.png" },
  { name: "2025-09-13_19.31.36.png" },
  { name: "2025-09-13_20.22.36.png" },
  { name: "2025-09-18_13.23.02.png" },
  { name: "2025-09-18_13.23.25.png" },
  { name: "2025-09-18_13.23.41.png" },
  { name: "2025-09-18_13.26.41.png" },
  { name: "2025-09-18_13.27.22.png" },
  { name: "2025-09-18_13.27.54.png" },
  { name: "2025-09-18_13.31.06.png" },
  { name: "2025-09-20_18.52.59.png", credit: "bte" },
  { name: "2025-09-25_21.45.27.png" },
  { name: "2025-10-19_13.50.46.png" },
  { name: "2025-10-19_13.51.00.png" },
  { name: "2025-10-19_13.51.24.png" },
  { name: "2025-10-23_17.38.26.png" },
  { name: "2025-10-23_17.38.40.png" },
  { name: "2025-10-24_23.07.50.png" },
  { name: "2025-10-25_01.04.04.png" },
  { name: "2025-10-25_01.04.17.png" },
  { name: "2025-10-25_02.01.55.png" },
  { name: "2025-10-25_02.02.23.png" },
  { name: "2025-10-27_17.32.34.png" },
  { name: "2025-10-27_17.56.40.png" },
  { name: "2025-10-27_17.56.53.png" },
  { name: "2025-10-29_17.00.15.png", credit: "mrbeast" },
  { name: "2025-10-29_17.47.57.png", credit: "mrbeast" },
  { name: "2025-10-30_21.38.03.png" },
  { name: "2025-10-31_17.24.05.png" },
  { name: "2025-11-02_21.24.44.png" },
  { name: "2025-11-02_21.24.53.png" },
  { name: "2025-11-02_22.00.18.png" },
  { name: "2025-11-16_14.56.40.png", credit: "mrbeast" },
  { name: "2025-11-16_15.08.49.png", credit: "mrbeast" },
  { name: "2025-11-22_11.02.49.png" },
  { name: "2025-11-22_11.04.22.png" },
  { name: "2025-12-09_18.58.54.png" },
  { name: "2025-12-09_18.59.03.png" },
  { name: "2025-12-24_13.51.44.png" },
  { name: "2025-12-24_13.51.51.png" },
  { name: "2026-01-03_01.34.48.png", credit: "bte" },
  { name: "2026-01-03_01.35.07.png", credit: "bte" },
  { name: "2026-01-03_01.35.57.png", credit: "bte" },
  { name: "2026-01-03_01.37.11.png", credit: "bte" },
  { name: "2026-04-01_21.07.14.png", credit: "bte" },
  { name: "2026-04-01_21.07.28.png", credit: "bte" },
  { name: "2026-05-30_15.23.36.png" },
  { name: "2026-07-02_16.20.56.png" },
  { name: "2026-07-06_21.59.15_4K.png" },
  { name: "2026-07-06_21.59.35_4K.png", credit: "bte" },
  { name: "chateau_loire.png", credit: "endorah" },
  { name: "circuit24hdumans.jpg", credit: "bte" },
  { name: "larresingle.jpg", credit: "bte" },
  { name: "little-bridge.png", credit: "bte" },
  { name: "maisonbois.png" },
  { name: "Mt_Blanc_cut.png" },
  { name: "Ocapiat-01.png", credit: "endorah" },
  { name: "Parentis.png" },
  { name: "pontneufv1.png" },
  { name: "potfleur.png" },
  { name: "sans_nom-2-1.jpg", credit: "bte" },
  { name: "Shot_01.jpg", credit: "endorah" },
  { name: "Shot_03.1.jpg", credit: "endorah" },
  { name: "Shot_03.jpg", credit: "endorah" },
  { name: "Shot_06.2.png", credit: "endorah" },
  { name: "Slide_1.png", credit: "mrbeast" },
  { name: "Slide_2.png", credit: "mrbeast" },
  { name: "spawnfight4glory.jpg", credit: "fight4glory" },
  { name: "Streaming-768x432.jpg", credit: "endorah" },
  { name: "untitled-2.jpg", credit: "bte" },
  { name: "untitled.jpg" },
  { name: "untitled3-2.jpg", credit: "bte" },
  { name: "untitled3.jpg" },
  { name: "CIRCUITxDIRIGEABLE.jpg", credit: "bte" },
  { name: "Larressingle.png", credit: "bte" },
  { name: "Lemans_-_france5.jpg", credit: "bte" },
  { name: "Lemans_-_large.png", credit: "bte" },
  { name: "Occi.png", credit: "bte" },
  { name: "untitled11.jpg", credit: "bte" },
  { name: "untitled13.jpg", credit: "bte" },
  { name: "untitled18.jpg", credit: "bte" }
];

const TAGS = ["1:1 SCALE", "TERRAFORM", "SPAWN", "REDSTONE", "EVENT MAP", "ORGANIC", "MEGAPROJECT", "COLLAB"];

let IMG_FORMAT = "webp";
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function detectAvif() {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = "data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAABcAAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQAMAAAAABNjb2xybmNseAACAAIABoAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEDQgMgkQAAAAB8dSLfI=";
  });
}

function getConnectionProfile() {
  const c = navigator.connection;
  if (!c) return { scale: 1, quality: 82, upgrade: true };
  if (c.saveData) return { scale: .6, quality: 60, upgrade: false };
  if (c.effectiveType === "2g" || c.effectiveType === "slow-2g") return { scale: .6, quality: 55, upgrade: false };
  if (c.effectiveType === "3g") return { scale: .8, quality: 68, upgrade: true };
  return { scale: 1, quality: 82, upgrade: true };
}

function buildImageUrl(filename, width, quality, forceFormat) {
  const source = RELEASE_BASE + encodeURIComponent(filename);
  const params = new URLSearchParams({ url: source, w: Math.max(16, Math.round(width)), output: forceFormat || IMG_FORMAT, q: quality });
  return "https://wsrv.nl/?" + params.toString();
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const items = shuffle([...FILES]);
const loadedIndexes = new Set();
const profile = getConnectionProfile();

const bento = document.getElementById("bento");
const lightbox = document.getElementById("lightbox");
const lbImg = document.getElementById("lbImg");
const lbCaption = document.getElementById("lbCaption");
const lbClose = document.getElementById("lbClose");
const lbPrev = document.getElementById("lbPrev");
const lbNext = document.getElementById("lbNext");
const preloader = document.getElementById("preloader");
const preCount = document.getElementById("preCount");
const progressBar = document.getElementById("progressBar");
const siteHeader = document.getElementById("siteHeader");
const cursorDot = document.getElementById("cursorDot");
const cursorRing = document.getElementById("cursorRing");
const cursorRingText = document.getElementById("cursorRingText");
const galleryAmbient = document.getElementById("galleryAmbient");
const gallerySection = document.getElementById("work");
const statBuilds = document.getElementById("statBuilds");
const footerCredits = document.getElementById("footerCredits");
const dfRingFg = document.getElementById("dfRingFg");

let currentIndex = 0;
let observer;
let touchStartX = 0;
let lenis = null;

const PATTERNS = {
  desktop: [[2,2],[1,1],[1,2],[2,1],[1,1],[1,1],[2,2],[1,1],[1,1],[2,1],[1,2],[1,1]],
  tablet: [[2,2],[1,1],[1,1],[2,1],[1,2],[1,1],[1,1],[2,1]],
  mobile: [[2,2],[2,1],[2,1],[1,1],[1,1],[2,1]]
};

function currentBreakpoint() {
  const w = window.innerWidth;
  if (w < 640) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

function applyPattern() {
  const bp = currentBreakpoint();
  const pattern = PATTERNS[bp];
  const cols = bp === "mobile" ? 2 : bp === "tablet" ? 4 : 6;
  bento.style.setProperty("--cols", cols);
  const tiles = bento.querySelectorAll(".bento-item");
  tiles.forEach((tile, i) => {
    const [c, r] = pattern[i % pattern.length];
    tile.style.setProperty("--sc", Math.min(c, cols));
    tile.style.setProperty("--sr", r);
  });
}

function debounce(fn, delay) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
}

function tileWidth(el) {
  const w = el.getBoundingClientRect().width || 300;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  return Math.min(1000, Math.round(w * dpr * profile.scale / 40) * 40);
}

function upgradeTile(img, item, baseWidth) {
  if (!profile.upgrade) return;
  const hiWidth = Math.min(1100, baseWidth * 2);
  const hi = new Image();
  hi.onload = () => { img.src = hi.src; };
  hi.src = buildImageUrl(item.name, hiWidth, 88);
}

function scheduleIdleUpgrades() {
  if (!profile.upgrade) return;
  const run = () => {
    const idx = [...loadedIndexes].shift();
    if (idx === undefined) return;
    loadedIndexes.delete(idx);
    const tile = bento.children[idx];
    if (!tile) return scheduleIdleUpgrades();
    const rect = tile.getBoundingClientRect();
    if (rect.bottom < -800 || rect.top > window.innerHeight + 800) return scheduleIdleUpgrades();
    const img = tile.querySelector("img");
    upgradeTile(img, items[idx], tileWidth(tile));
    scheduleIdleUpgrades();
  };
  if ("requestIdleCallback" in window) requestIdleCallback(run, { timeout: 2000 });
  else setTimeout(run, 500);
}

function loadTileImage(img, tile, index) {
  const item = items[index];
  const w = tileWidth(tile);
  const full = new Image();
  full.src = buildImageUrl(item.name, w, profile.quality);
  full.onload = () => {
    img.src = full.src;
    img.classList.add("loaded");
    tile.classList.add("is-loaded");
    loadedIndexes.add(index);
  };
  full.onerror = () => {
    img.src = RELEASE_BASE + encodeURIComponent(item.name);
    img.classList.add("loaded");
    tile.classList.add("is-loaded");
  };
}

function initObserver() {
  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const img = entry.target;
      const index = Number(img.dataset.index);
      const tile = img.closest(".bento-item");
      if (entry.isIntersecting) {
        tile.classList.add("in-view");
        loadTileImage(img, tile, index);
        observer.unobserve(img);
      }
    });
  }, { rootMargin: "500px 0px" });
}

function buildBento() {
  const fragment = document.createDocumentFragment();

  items.forEach((item, index) => {
    const tile = document.createElement("div");
    tile.className = "bento-item";
    if (index % 9 === 4) tile.classList.add("wave-card");
    else if (index % 13 === 6) tile.classList.add("blob-card");

    const tag = TAGS[index % TAGS.length];
    const tagEl = document.createElement("span");
    tagEl.className = "bento-tag";
    tagEl.textContent = tag;
    tile.appendChild(tagEl);

    if (item.credit && CREDITS[item.credit]) {
      const c = CREDITS[item.credit];
      const badge = document.createElement("div");
      badge.className = "bento-credit";
      const logo = document.createElement("img");
      logo.src = c.logo;
      logo.alt = "";
      logo.loading = "lazy";
      logo.decoding = "async";
      const label = document.createElement("span");
      label.textContent = c.linkText;
      badge.appendChild(logo);
      badge.appendChild(label);
      tile.appendChild(badge);
    }

    const img = document.createElement("img");
    img.alt = item.credit && CREDITS[item.credit] ? CREDITS[item.credit].linkText : "Original build";
    img.decoding = "async";
    img.dataset.index = index;
    img.fetchPriority = index < 6 ? "high" : "auto";
    tile.appendChild(img);

    const caption = document.createElement("div");
    caption.className = "bento-caption";
    const plate = document.createElement("span");
    plate.className = "bento-plate";
    plate.textContent = "N\u00b0 " + String(index + 1).padStart(3, "0");
    const title = document.createElement("span");
    title.className = "bento-title";
    title.textContent = item.credit && CREDITS[item.credit] ? CREDITS[item.credit].linkText + " Build" : "Original Build";
    caption.appendChild(plate);
    caption.appendChild(title);
    tile.appendChild(caption);

    tile.dataset.cursorText = "View";
    tile.addEventListener("click", () => openLightbox(index));
    fragment.appendChild(tile);
  });

  bento.appendChild(fragment);
  applyPattern();

  const tiles = bento.querySelectorAll(".bento-item img");
  tiles.forEach((img, i) => {
    const tile = img.closest(".bento-item");
    if (i < 6) { tile.classList.add("in-view"); loadTileImage(img, tile, i); }
    else observer.observe(img);
  });

  window.addEventListener("load", () => setTimeout(scheduleIdleUpgrades, 1500));
}

function buildFooterCredits() {
  const seen = new Set();
  items.forEach((item) => { if (item.credit) seen.add(item.credit); });
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

function renderLightbox() {
  const item = items[currentIndex];
  lbImg.src = buildImageUrl(item.name, 1600, 85);

  [currentIndex - 1, currentIndex + 1].forEach((i) => {
    const n = ((i % items.length) + items.length) % items.length;
    const pre = new Image();
    pre.src = buildImageUrl(items[n].name, 1600, 85);
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
  if (lenis) lenis.stop();
}

function closeLightbox() {
  lightbox.classList.remove("open");
  document.body.style.overflow = "";
  if (lenis) lenis.start();
}

function showNext() { currentIndex = (currentIndex + 1) % items.length; renderLightbox(); }
function showPrev() { currentIndex = (currentIndex - 1 + items.length) % items.length; renderLightbox(); }

lbClose.addEventListener("click", closeLightbox);
lbNext.addEventListener("click", showNext);
lbPrev.addEventListener("click", showPrev);
lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });
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

function initSmoothScroll() {
  if (typeof Lenis === "undefined" || reduceMotion) return;
  lenis = new Lenis({ duration: 1.1, easing: (t) => 1 - Math.pow(1 - t, 3), smoothWheel: true });
  function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
  requestAnimationFrame(raf);
}

function initAnchors() {
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { offset: -20 });
      else target.scrollIntoView({ behavior: "smooth" });
    });
  });
}

function initReveal() {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: .15, rootMargin: "0px 0px -60px 0px" });
  document.querySelectorAll("[data-reveal]").forEach((el, i) => {
    el.style.transitionDelay = (i % 6) * 70 + "ms";
    revealObserver.observe(el);
  });
}

function initCounters() {
  statBuilds.dataset.count = items.length;
  const counters = document.querySelectorAll(".stat-num");
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = Number(el.dataset.count);
      let start = 0;
      const duration = 1200;
      const startTime = performance.now();
      function tick(now) {
        const p = Math.min(1, (now - startTime) / duration);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      counterObserver.unobserve(el);
    });
  }, { threshold: .5 });
  counters.forEach((c) => counterObserver.observe(c));
}

function initHeaderScroll() {
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      siteHeader.classList.toggle("scrolled", window.scrollY > 40);
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const p = maxScroll > 0 ? Math.min(1, window.scrollY / maxScroll) : 0;
      progressBar.style.width = (p * 100) + "%";
      const circumference = 182;
      dfRingFg.style.strokeDashoffset = String(circumference * (1 - p));
      ticking = false;
    });
  }, { passive: true });
}

function initParallax() {
  if (reduceMotion) return;
  const orbs = document.querySelectorAll("[data-parallax]");
  let ticking = false;
  function update() {
    const y = window.scrollY;
    orbs.forEach((el) => {
      const factor = parseFloat(el.dataset.parallax);
      el.style.transform = `translateY(${y * factor}px)`;
    });
    if (gallerySection) {
      const rect = gallerySection.getBoundingClientRect();
      const total = rect.height + window.innerHeight;
      const passed = window.innerHeight - rect.top;
      const progress = Math.max(0, Math.min(1, passed / total));
      galleryAmbient.style.filter = `blur(100px) hue-rotate(${progress * 280}deg)`;
    }
    ticking = false;
  }
  window.addEventListener("scroll", () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
  update();
}

function initCursor() {
  if (window.matchMedia("(pointer: coarse)").matches || reduceMotion) return;
  document.documentElement.classList.add("has-cursor");
  let mx = 0, my = 0, rx = 0, ry = 0;
  window.addEventListener("mousemove", (e) => { mx = e.clientX; my = e.clientY; cursorDot.style.left = mx + "px"; cursorDot.style.top = my + "px"; });
  function loop() {
    rx += (mx - rx) * .18;
    ry += (my - ry) * .18;
    cursorRing.style.left = rx + "px";
    cursorRing.style.top = ry + "px";
    requestAnimationFrame(loop);
  }
  loop();
  document.addEventListener("mouseover", (e) => {
    const target = e.target.closest("[data-cursor-text], a, button, .bento-item");
    if (!target) return;
    cursorRing.classList.add("hover");
    cursorRingText.textContent = target.dataset.cursorText || "";
  });
  document.addEventListener("mouseout", (e) => {
    const target = e.target.closest("[data-cursor-text], a, button, .bento-item");
    if (!target) return;
    cursorRing.classList.remove("hover");
    cursorRingText.textContent = "";
  });
}

function initPreloader() {
  let count = 0;
  const start = performance.now();
  function tick() {
    const elapsed = performance.now() - start;
    count = Math.min(100, Math.round((elapsed / 1200) * 100));
    preCount.textContent = count;
    if (count < 100) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
  const done = () => setTimeout(() => preloader.classList.add("hide"), 500);
  if (document.readyState === "complete") done();
  else window.addEventListener("load", done);
  setTimeout(done, 3000);
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}

detectAvif().then((supported) => {
  IMG_FORMAT = supported ? "avif" : "webp";
  initObserver();
  buildBento();
  buildFooterCredits();
  initSmoothScroll();
  initAnchors();
  initReveal();
  initCounters();
  initHeaderScroll();
  initParallax();
  initCursor();
  initPreloader();
  window.addEventListener("resize", debounce(applyPattern, 200));
});
