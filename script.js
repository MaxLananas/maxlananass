const RELEASE_BASE = "https://github.com/MaxLananas/Asset-Portfolio/releases/download/images-v1/";

const CREDITS = {
  bte: {
    text: "Réalisation collective dans le cadre du projet",
    linkText: "BuildTheEarth France",
    linkUrl: null,
    logo: "Logo_BTE_France-3632312792.png"
  },
  endorah: {
    text: "Réalisé en tant que bénévole au sein de l'association loi 1901",
    linkText: "Endorah",
    linkUrl: "https://endorah.net/",
    logo: "cropped-500x500Endorah_-_Copie-2322200814.png"
  },
  fight4glory: {
    text: "Réalisé pour l'événement",
    linkText: "Fight4Glory",
    linkUrl: null,
    logo: "image_v2-Photoroom.png"
  },
  mrbeast: {
    text: "Collaboration de 10 builders représentant la France dans une vidéo de",
    linkText: "MrBeast",
    linkUrl: "https://www.youtube.com/watch?v=qTMKHZelGAs",
    logo: "1701523229mr-beast-logo-transparent-background-2847774365.png"
  }
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

function buildImageUrl(filename, width, quality) {
  const source = RELEASE_BASE + encodeURIComponent(filename);
  const params = new URLSearchParams({
    url: source,
    w: width,
    output: "webp",
    q: quality,
    we: 1
  });
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

const masonry = document.getElementById("masonry");
const lightbox = document.getElementById("lightbox");
const lbImg = document.getElementById("lbImg");
const lbCaption = document.getElementById("lbCaption");
const lbClose = document.getElementById("lbClose");
const lbPrev = document.getElementById("lbPrev");
const lbNext = document.getElementById("lbNext");

let currentIndex = 0;

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const img = entry.target;
    const item = items[Number(img.dataset.index)];
    const full = new Image();
    full.src = buildImageUrl(item.name, 640, 80);
    full.onload = () => {
      img.src = full.src;
      img.classList.remove("lqip");
      img.classList.add("loaded");
    };
    full.onerror = () => {
      img.src = RELEASE_BASE + encodeURIComponent(item.name);
      img.classList.remove("lqip");
      img.classList.add("loaded");
    };
    observer.unobserve(img);
  });
}, { rootMargin: "400px 0px" });

items.forEach((item, index) => {
  const tile = document.createElement("div");
  tile.className = "tile";

  const img = document.createElement("img");
  img.className = "lqip";
  img.alt = "";
  img.dataset.index = index;
  img.src = buildImageUrl(item.name, 30, 40);

  tile.appendChild(img);
  tile.addEventListener("click", () => openLightbox(index));
  masonry.appendChild(tile);
  observer.observe(img);
});

function renderLightbox() {
  const item = items[currentIndex];
  lbImg.src = buildImageUrl(item.name, 1600, 85);

  if (item.credit) {
    const c = CREDITS[item.credit];
    const link = c.linkUrl
      ? `<a href="${c.linkUrl}" target="_blank" rel="noopener">${c.linkText}</a>`
      : `<strong>${c.linkText}</strong>`;
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
}

function closeLightbox() {
  lightbox.classList.remove("open");
  document.body.style.overflow = "";
}

function showNext() {
  currentIndex = (currentIndex + 1) % items.length;
  renderLightbox();
}

function showPrev() {
  currentIndex = (currentIndex - 1 + items.length) % items.length;
  renderLightbox();
}

lbClose.addEventListener("click", closeLightbox);
lbNext.addEventListener("click", showNext);
lbPrev.addEventListener("click", showPrev);

lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) closeLightbox();
});

document.addEventListener("keydown", (e) => {
  if (!lightbox.classList.contains("open")) return;
  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowRight") showNext();
  if (e.key === "ArrowLeft") showPrev();
});
