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

document.addEventListener("click", async (event) => {
  if (!(event.target instanceof Element)) return;
  const videoButton = event.target.closest("[data-load-video]");
  if (videoButton) {
    const facade = videoButton.closest("[data-drive-video]");
    const id = facade.dataset.driveVideo;
    if (!/^[\w-]{20,}$/.test(id) || facade.dataset.loaded) return;
    facade.dataset.loaded = "true";
    const iframe = document.createElement("iframe");
    iframe.src = `https://drive.google.com/file/d/${id}/preview`;
    iframe.title = "iProf 2026 video walkthrough — Google Drive";
    iframe.allow = "fullscreen; picture-in-picture";
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = "no-referrer";
    facade.replaceChildren(iframe);
    iframe.focus();
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
