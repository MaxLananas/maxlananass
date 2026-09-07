// Loaded on the first screenshot interaction, not on every document page.
let dialog, image, caption, count, pending, opener, items = [], index = 0, token = 0, savedOverflow = "";
function close() {
  token++;
  if (pending) pending.src = "";
  pending = null;
  dialog.close();
  document.body.style.overflow = savedOverflow;
  image.removeAttribute("src");
  opener?.focus({ preventScroll: true });
}
function create() {
  dialog = document.createElement("dialog");
  dialog.className = "project-viewer";
  dialog.setAttribute("aria-label", "Project screenshot viewer");
  // Static interface only. Captions and image URLs are assigned as properties.
  dialog.innerHTML = '<button type="button" class="pv-close" aria-label="Close screenshot viewer">×</button><div class="pv-stage"><img alt=""></div><div class="pv-controls"><button type="button" class="pv-prev" aria-label="Previous screenshot">←</button><span class="pv-count" aria-live="polite"></span><a class="pv-full-size" target="_blank" rel="noopener">Full-size image ↗</a><button type="button" class="pv-next" aria-label="Next screenshot">→</button></div><p class="pv-caption" role="status"></p>';
  document.body.appendChild(dialog);
  image = dialog.querySelector("img");
  caption = dialog.querySelector(".pv-caption");
  count = dialog.querySelector(".pv-count");
  dialog.querySelector(".pv-close").addEventListener("click", close);
  dialog.querySelector(".pv-prev").addEventListener("click", () => show(-1));
  dialog.querySelector(".pv-next").addEventListener("click", () => show(1));
  dialog.addEventListener("cancel", (event) => { event.preventDefault(); close(); });
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) close();
  });
  dialog.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); show(event.key === "ArrowRight" ? 1 : -1); }
  });
}
async function show(direction = 0) {
  index = (index + direction + items.length) % items.length;
  const current = ++token;
  if (pending) pending.src = "";
  const item = items[index];
  const thumb = item.querySelector("img");
  image.src = thumb.currentSrc || thumb.src;
  image.alt = thumb.alt;
  caption.textContent = item.closest("figure").querySelector("figcaption strong").textContent;
  count.textContent = `${index + 1} / ${items.length}`;
  dialog.querySelector(".pv-full-size").href = item.href;
  dialog.querySelector(".pv-prev").disabled = dialog.querySelector(".pv-next").disabled = items.length < 2;
  const next = new Image();
  pending = next;
  next.decoding = "async";
  next.fetchPriority = "high";
  next.src = item.href;
  try {
    await next.decode();
    if (token === current && dialog.open) image.src = next.src;
  } catch (_) {
    if (token === current && dialog.open) caption.textContent += " — showing the available preview";
  } finally { if (pending === next) pending = null; }
}
export function openProjectViewer(item) {
  if (!dialog) create();
  items = [...document.querySelectorAll("a[data-project-viewer]")];
  index = items.indexOf(item);
  if (index < 0) return;
  opener = item;
  if (!dialog.open) { savedOverflow = document.body.style.overflow; document.body.style.overflow = "hidden"; dialog.showModal(); }
  dialog.querySelector(".pv-close").focus({ preventScroll: true });
  show();
}
