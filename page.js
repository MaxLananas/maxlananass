// Static content never depends on this script. It only adds resilient image
// delivery and an offline shell for people browsing the document pages.
const base = new URL(document.documentElement.dataset.base || "/", document.baseURI);
document.addEventListener("error", (event) => {
  const img = event.target;
  if (!(img instanceof HTMLImageElement) || !img.dataset.original) return;
  const step = Number(img.dataset.fallback || 0);
  img.dataset.fallback = String(step + 1);
  const picture = img.closest("picture");
  if (step === 0 && picture?.querySelector("source")) {
    picture.querySelector("source").remove();
    img.removeAttribute("srcset"); // Keep the real WebP src, already present in the HTML.
    img.src = img.getAttribute("src");
  } else if (step < 2 && img.src !== img.dataset.original) {
    picture?.querySelector("source")?.remove();
    img.removeAttribute("srcset");
    img.src = img.dataset.original;
  } else {
    img.closest("figure")?.classList.add("image-unavailable");
  }
}, true);
if ("serviceWorker" in navigator) {
  const register = () => navigator.serviceWorker.register(new URL("sw.js", base), { updateViaCache: "none" }).catch(() => {});
  if (document.readyState === "complete") setTimeout(register, 1500);
  else window.addEventListener("load", () => setTimeout(register, 1500), { once: true });
}

document.querySelectorAll("[data-native-player]").forEach(player => { player.hidden = false; });
document.addEventListener("click", async (event) => {
  if (!(event.target instanceof Element)) return;
  const start = event.target.closest("[data-start-native-video]");
  if (start) {
    const video = start.closest("[data-native-player]").querySelector("video");
    video.querySelectorAll("source[data-src]").forEach(source => { source.src = source.dataset.src; });
    start.hidden = true;
    video.load();
    video.play().catch(() => { /* The native controls remain available if playback is denied. */ });
    video.focus();
    return;
  }
  const item = event.target.closest("a[data-project-viewer]");
  if (!item || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || !("HTMLDialogElement" in window)) return;
  event.preventDefault();
  try {
    const { openProjectViewer } = await import("./project-viewer.js");
    openProjectViewer(item);
  } catch (_) { location.assign(item.href); }
});
