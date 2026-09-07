import media from "../content/project-media.json" with { type: "json" };

const esc = (value = "") => String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
export const projectMedia = media;
export function mediaData(key, local = (path) => "/" + path) {
  const item = media[key];
  if (!item?.variants?.length) throw new Error(`Missing prepared project media: ${key}`);
  const webp = item.variants.filter((v) => v.format === "webp");
  const selected = webp.find((v) => v.width >= 640) || webp[webp.length - 1];
  return { width: item.width, height: item.height, src: local(selected.path), full: local(webp[webp.length - 1].path),
    webp: webp.map((v) => `${local(v.path)} ${v.width}w`).join(", "),
    avif: item.variants.filter((v) => v.format === "avif").map((v) => `${local(v.path)} ${v.width}w`).join(", ") };
}
export function projectPicture(key, h, { alt = "", eager = false, sizes = "(max-width: 640px) 92vw, 44vw", className = "" } = {}) {
  const item = mediaData(key, h.local);
  return `<picture${className ? ` class="${esc(className)}"` : ""}>${item.avif ? `<source type="image/avif" srcset="${esc(item.avif)}" sizes="${esc(sizes)}">` : ""}<img data-project-media="${key}" src="${esc(item.src)}" srcset="${esc(item.webp)}" sizes="${esc(sizes)}" width="${item.width}" height="${item.height}" alt="${esc(alt)}" loading="${eager ? "eager" : "lazy"}" fetchpriority="${eager ? "high" : "low"}" decoding="async"></picture>`;
}
export function projectCard(p, h) {
  const visual = p.cover ? `<div class="project-card-media">${projectPicture(p.cover, h, { alt: "" })}</div>`
    : p.icon ? `<div class="project-card-icon">${projectPicture(p.icon, h, { alt: "", sizes: "72px" })}</div>`
    : `<div class="project-card-mark" aria-hidden="true">${p.collection === "lab" ? "{ }" : "↗"}</div>`;
  const label = p.collection === "release" ? "Published on Modrinth" : p.collection === "lab" ? "GitHub lab" : p.collection === "interface" ? "Interface study" : p.category;
  return `<article class="project-card project-card-visual">${visual}<div class="project-card-copy"><p class="eyebrow">${esc(label)}</p><h3>${h.link(`/projects/${p.slug}/`, p.name)}</h3><p>${esc(p.summary)}</p><span class="project-kind">${esc(p.language || "Build screenshots")}</span>${p.modrinth ? `<p class="project-platform-link">${h.link(p.modrinth, "Modrinth releases ↗")}</p>` : ""}</div></article>`;
}
export function iprofSpotlight(p, h, { eager = false } = {}) {
  return `<article class="dev-spotlight"><a class="dev-spotlight-image" href="${h.local(`projects/${p.slug}/`)}" aria-label="Explore the iProf interface redesign">${projectPicture(p.cover, h, { alt: "iProf 2026 — MaxLananas’s interface redesign presentation", eager, sizes: "(max-width: 760px) 92vw, 58vw" })}</a><div class="dev-spotlight-copy"><span class="eyebrow">Featured interface project</span><h2>${h.link(`/projects/${p.slug}/`, "iProf 2026")}</h2><p>A teacher portal rethought as a coherent service: dashboard, career, mobility, documents and messaging.</p><p class="project-kind">PHP · CSS · JavaScript<br>11 presentation visuals · video walkthrough</p><p>${h.link(`/projects/${p.slug}/`, "Explore the redesign →", 'class="btn-pill-solid"')}</p><p class="project-disclaimer">Independent redesign · fictitious demonstration data</p></div></article>`;
}
export function projectScreenshots(p, h) {
  if (!p.media?.length) return "";
  if (p.kind !== "design") return `<section><h2>Project image</h2><figure class="project-single-image">${projectPicture(p.media[0].key, h, { alt: p.media[0].alt, eager: true, sizes: "(max-width: 1100px) 92vw, 1050px" })}<figcaption>${esc(p.media[0].caption || p.media[0].title)}</figcaption></figure></section>`;
  return `<section class="project-screenshots"><h2>Explore the interface</h2><p>Eleven visuals from the supplied presentation. Select an image to enlarge it; keyboard arrows move through the set. The presentation explicitly uses fictitious data.</p><div class="project-image-grid">${p.media.map((shot, index) => {
    const data = mediaData(shot.key, h.local);
    return `<figure class="project-gallery-item"><a data-project-viewer href="${esc(data.full)}" aria-label="${esc(`Enlarge ${shot.title}`)}">${projectPicture(shot.key, h, { alt: shot.alt, eager: index === 0 })}<span class="image-enlarge" aria-hidden="true">↗</span></a><figcaption><span class="project-image-number">${String(index + 1).padStart(2, "0")}</span><strong>${esc(shot.title)}</strong></figcaption></figure>`;
  }).join("")}</div></section>`;
}
export function projectVideo(p, h) {
  if (!p.video) return "";
  const url = `https://drive.google.com/file/d/${p.video.driveId}/view`;
  return `<section class="project-video"><h2>Video walkthrough</h2><p>The supplied trailer stays on Google Drive. The player and video are loaded only after you choose to open them.</p><div class="video-facade" data-drive-video="${p.video.driveId}">${projectPicture(p.video.poster, h, { alt: "iProf 2026 presentation — video poster", sizes: "(max-width: 1100px) 92vw, 1050px" })}<button type="button" data-load-video class="video-play" aria-label="Load the iProf video from Google Drive"><span aria-hidden="true">▶</span> Load video</button></div><p class="video-note">${h.link(url, "Open the original video in Google Drive ↗", 'target="_blank" rel="noopener"')} · External player; Google’s privacy and playback settings apply.</p></section>`;
}
