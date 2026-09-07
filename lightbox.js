import { altFor, imageMetadata, requestedImageWidth, originalUrl } from "./image-utils.js";
import { clearImage, loadImage } from "./image-loader.js";

export function createLightbox({ files, credits, getOrder, getThumbnail, getProfile, onOpenChange }) {
  const $ = (id) => document.getElementById(id);
  const dialog = $("lightbox");
  const frame = $("lbFrame");
  const preview = $("lbPreview");
  const spinner = $("lbSpinner");
  const caption = $("lbCaption");
  const status = $("lbStatus");
  const retry = $("lbRetry");
  const closeButton = $("lbClose");
  const tools = dialog.querySelector(".lb-tools");
  let currentIndex = 0;
  let opener;
  let token = 0;
  let controller;
  let picture = $("lbPicture");
  let img = $("lbImg");
  let prefetchTimer;
  let prefetched;
  let background = [];
  let savedOverflow = "";
  let ready = false;
  let lastFullImage;

  const isOpen = () => dialog.classList.contains("open");
  function imageHeightLimit() {
    // Account for real caption/control heights on short landscape screens too.
    const reserved = 40 + tools.getBoundingClientRect().height + 14 +
      (caption.hidden ? 0 : caption.getBoundingClientRect().height + 18) +
      (status.textContent ? status.getBoundingClientRect().height + 8 : 0);
    return Math.max(1, Math.min(innerHeight * .78, innerHeight - reserved));
  }
  function widthFor(index) {
    const meta = imageMetadata(files[index]);
    const thumb = getThumbnail(index).img;
    const ratio = meta ? meta.width / meta.height :
      (lastFullImage?.index === index ? lastFullImage.ratio : 0) || thumb.naturalWidth / thumb.naturalHeight || 4 / 3;
    return { ratio, width: Math.min(innerWidth * .88, imageHeightLimit() * ratio) };
  }

  function cancelPrefetch() {
    clearTimeout(prefetchTimer);
    if (prefetched) {
      prefetched.controller.abort();
      clearImage(prefetched.picture, prefetched.img);
      prefetched = null;
    }
  }

  function schedulePrefetch() {
    clearTimeout(prefetchTimer);
    if (!ready || !getProfile().prefetch || document.hidden || !isOpen() || navigator.onLine === false) return;
    prefetchTimer = setTimeout(() => {
      if (!isOpen() || !getProfile().prefetch || document.hidden) return;
      const order = getOrder();
      if (order.length < 2) return;
      const nextIndex = order[(order.indexOf(currentIndex) + 1) % order.length];
      if (prefetched?.index === nextIndex) return;
      cancelPrefetch();
      const nextPicture = document.createElement("picture");
      const nextImg = document.createElement("img");
      nextPicture.appendChild(nextImg);
      const nextController = new AbortController();
      const { width } = widthFor(nextIndex);
      if (getThumbnail(nextIndex).loadedWidth >= requestedImageWidth(files[nextIndex], width, devicePixelRatio || 1, "viewer")) return;
      const promise = loadImage(nextPicture, nextImg, files[nextIndex], width, {
        signal: nextController.signal,
        priority: "low",
        purpose: "viewer",
        timeout: getProfile().timeout,
        fallback: "local" // AVIF → local WebP only. Never speculate on a release original.
      });
      prefetched = { index: nextIndex, picture: nextPicture, img: nextImg, controller: nextController, promise, failed: false };
      promise.catch(() => { if (prefetched?.promise === promise) prefetched.failed = true; });
    }, 900); // Let the requested photo paint before considering ONE neighbour.
  }

  function renderCaption(item) {
    caption.replaceChildren();
    const credit = credits[item.credit];
    caption.hidden = !credit;
    if (!credit) return;
    const logo = document.createElement("img");
    logo.src = credit.logo;
    logo.width = logo.height = 20;
    logo.alt = "";
    logo.decoding = "async";
    const link = document.createElement(credit.linkUrl ? "a" : "strong");
    link.textContent = credit.linkText;
    if (credit.linkUrl) { link.href = credit.linkUrl; link.target = "_blank"; link.rel = "noopener"; }
    caption.append(logo, document.createTextNode(credit.text + " "), link);
  }

  async function render() {
    const myToken = ++token;
    controller?.abort();
    ready = false;
    clearTimeout(prefetchTimer);
    const prepared = prefetched?.index === currentIndex && !prefetched.failed ? prefetched : null;
    if (prepared) prefetched = null;
    else cancelPrefetch();
    const item = files[currentIndex];
    const thumb = getThumbnail(currentIndex);
    const meta = imageMetadata(item);
    status.textContent = "";
    retry.hidden = true;
    $("lbOriginal").href = originalUrl(item);
    $("lbCounter").textContent = `${getOrder().indexOf(currentIndex) + 1} / ${getOrder().length}`;
    $("lbNext").disabled = $("lbPrev").disabled = getOrder().length < 2;
    renderCaption(item);
    const { ratio, width } = widthFor(currentIndex);
    frame.style.width = `${width}px`;
    frame.style.aspectRatio = String(ratio);
    frame.style.backgroundColor = meta?.color || "var(--surface)";
    preview.hidden = true;
    preview.removeAttribute("src");
    const previousFull = lastFullImage?.index === currentIndex ? lastFullImage : null;
    if (previousFull || thumb.url || meta?.placeholder) {
      if (previousFull ? previousFull.cors : thumb.img.hasAttribute("crossorigin")) preview.crossOrigin = "anonymous";
      else preview.removeAttribute("crossorigin");
      preview.src = previousFull?.url || thumb.url || meta.placeholder;
      preview.hidden = false;
    }
    const nextPicture = prepared?.picture || document.createElement("picture");
    const nextImg = prepared?.img || document.createElement("img");
    if (!prepared) nextPicture.appendChild(nextImg);
    nextPicture.id = "lbPicture";
    nextImg.id = "lbImg";
    nextImg.className = "lb-img";
    nextImg.alt = altFor(item, currentIndex);
    nextImg.fetchPriority = "high";
    picture.replaceWith(nextPicture);
    picture = nextPicture;
    img = nextImg;
    spinner.hidden = false;
    frame.setAttribute("aria-busy", "true");
    controller = prepared?.controller || new AbortController();

    try {
      const requestedWidth = requestedImageWidth(item, width, devicePixelRatio || 1, "viewer");
      let loadedWidth = requestedWidth;
      if (!prepared && thumb.url && thumb.loadedWidth >= requestedWidth) {
        // On a small screen the loaded tile may already have all required pixels.
        if (thumb.img.hasAttribute("crossorigin")) img.crossOrigin = "anonymous";
        img.src = thumb.url;
        await img.decode();
        loadedWidth = thumb.loadedWidth;
      } else {
        const options = { signal: controller.signal, purpose: "viewer", priority: "high", timeout: getProfile().timeout };
        let result;
        if (prepared) {
          try { result = await prepared.promise; }
          catch (error) {
            if (myToken !== token || error.name === "AbortError") throw error;
            // Failed speculation is not a failed user request: now permit the
            // normal bounded fallback chain (including the untouched original).
            clearImage(picture, img);
            result = await loadImage(picture, img, item, width, options);
          }
        } else result = await loadImage(picture, img, item, width, options);
        if (prepared && result.width < requestedWidth && myToken === token) {
          // A different caption or a rotation may leave more room than when this
          // neighbour was prefetched. Do not settle for insufficient resolution.
          result = await loadImage(picture, img, item, width, options);
        }
        loadedWidth = result.width;
      }
      if (myToken !== token || !isOpen()) return;
      lastFullImage = { index: currentIndex, url: img.currentSrc || img.src, width: loadedWidth, ratio: img.naturalWidth / img.naturalHeight || ratio, cors: img.hasAttribute("crossorigin") };
      if (!meta && img.naturalWidth && img.naturalHeight) {
        const naturalRatio = img.naturalWidth / img.naturalHeight;
        frame.style.aspectRatio = String(naturalRatio);
        frame.style.width = `${Math.min(innerWidth * .88, imageHeightLimit() * naturalRatio)}px`;
      }
      img.classList.add("loaded");
      frame.style.backgroundColor = "transparent";
      preview.hidden = true;
      preview.removeAttribute("src");
      ready = true;
      schedulePrefetch();
    } catch (error) {
      if (myToken !== token || error.name === "AbortError") return;
      status.textContent = navigator.onLine === false
        ? "This photo is not available offline yet."
        : "The full-size photo could not load. Try again or open the original.";
      retry.hidden = false;
      frame.style.width = `${widthFor(currentIndex).width}px`;
    } finally {
      if (myToken === token) {
        spinner.hidden = true;
        frame.setAttribute("aria-busy", "false");
      }
    }
  }

  function open(index, trigger) {
    currentIndex = index;
    opener = trigger;
    if (!isOpen()) {
      savedOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      background = [...document.body.children]
        .filter((element) => element !== dialog && element instanceof HTMLElement && element.tagName !== "SCRIPT")
        .map((element) => ({ element, inert: element.inert }));
      background.forEach(({ element }) => { element.inert = true; });
      dialog.classList.add("open");
      dialog.setAttribute("aria-hidden", "false");
      onOpenChange(true);
      closeButton.focus({ preventScroll: true });
    }
    render();
  }

  function close() {
    if (!isOpen()) return;
    token++;
    controller?.abort();
    cancelPrefetch();
    clearImage(picture, img);
    preview.removeAttribute("src");
    lastFullImage = null;
    dialog.classList.remove("open");
    dialog.setAttribute("aria-hidden", "true");
    spinner.hidden = true;
    document.body.style.overflow = savedOverflow;
    background.forEach(({ element, inert }) => { element.inert = inert; });
    background = [];
    onOpenChange(false);
    opener?.focus({ preventScroll: true });
  }

  function step(direction) {
    if (!isOpen()) return;
    const order = getOrder();
    if (order.length < 2) return;
    currentIndex = order[(order.indexOf(currentIndex) + direction + order.length) % order.length];
    render();
  }
  closeButton.addEventListener("click", close);
  $("lbNext").addEventListener("click", () => step(1));
  $("lbPrev").addEventListener("click", () => step(-1));
  retry.addEventListener("click", render);
  dialog.addEventListener("click", (event) => { if (event.target === dialog) close(); });
  document.addEventListener("keydown", (event) => {
    if (!isOpen()) return;
    if (event.key === "Escape") { event.preventDefault(); close(); }
    if (event.key === "ArrowRight") { event.preventDefault(); step(1); }
    if (event.key === "ArrowLeft") { event.preventDefault(); step(-1); }
    if (event.key !== "Tab") return;
    const controls = [...dialog.querySelectorAll("button:not(:disabled), a[href]")].filter((el) => el.getClientRects().length);
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  let touchStart;
  dialog.addEventListener("touchstart", (event) => {
    touchStart = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
  }, { passive: true });
  dialog.addEventListener("touchend", (event) => {
    if (!touchStart || event.touches.length) return;
    const dx = event.changedTouches[0].clientX - touchStart.x;
    const dy = event.changedTouches[0].clientY - touchStart.y;
    touchStart = null;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.5) step(dx < 0 ? 1 : -1);
  }, { passive: true });
  dialog.addEventListener("touchcancel", () => { touchStart = null; }, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) cancelPrefetch();
    else schedulePrefetch();
  });
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  connection?.addEventListener("change", () => {
    if (!getProfile().prefetch) cancelPrefetch();
    else schedulePrefetch();
  });
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (!isOpen()) return;
      cancelPrefetch();
      const { width, ratio } = widthFor(currentIndex);
      frame.style.width = `${width}px`;
      frame.style.aspectRatio = String(ratio);
      const needed = requestedImageWidth(files[currentIndex], width, devicePixelRatio || 1, "viewer");
      if (!ready || !lastFullImage || lastFullImage.width < needed) render();
      else schedulePrefetch();
      // Shrinking a window should not re-download or flash a smaller photo.
    }, 180);
  });
  return { open, close };
}
