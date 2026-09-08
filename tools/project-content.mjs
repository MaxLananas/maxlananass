import media from "../content/project-media.json" with { type: "json" };
import { brandIcon } from "./brand.mjs";
import nativeVideo from "../content/iprof-video.json" with { type: "json" };
export const iprofVideo = nativeVideo;

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
    : `<div class="project-card-mark" aria-hidden="true">${brandIcon(p.collection === "lab" ? "code" : "cube")}</div>`;
  const label = p.collection === "release" ? "Published on Modrinth" : p.collection === "lab" ? "GitHub lab" : p.collection === "interface" ? "Interface study" : p.category;
  return `<article class="project-card project-card-visual">${visual}<div class="project-card-copy"><p class="eyebrow">${esc(label)}</p><h3>${h.link(`/projects/${p.slug}/`, p.name)}</h3><p>${esc(p.summary)}</p><span class="project-kind">${esc(p.language || "Build screenshots")}</span>${p.modrinth ? `<p class="project-platform-link">${h.link(p.modrinth, "Modrinth releases ↗")}</p>` : ""}</div></article>`;
}
export function iprofSpotlight(p, h, { eager = false } = {}) {
  return `<article class="dev-spotlight"><a class="dev-spotlight-image" href="${h.local(`projects/${p.slug}/`)}" aria-label="Explore the iProf interface redesign">${projectPicture(p.cover, h, { alt: "iProf 2026 — MaxLananas’s interface redesign presentation", eager, sizes: "(max-width: 760px) 92vw, 58vw" })}</a><div class="dev-spotlight-copy"><span class="eyebrow">Featured interface project</span><h2>${h.link(`/projects/${p.slug}/`, "iProf 2026")}</h2><p>A teacher portal rethought as a coherent service: dashboard, career, mobility, documents and messaging.</p><p class="project-kind">PHP · CSS · JavaScript<br>11 presentation visuals · video walkthrough</p><p>${h.link(`/projects/${p.slug}/`, "Explore the redesign →", 'class="btn-pill-solid"')}</p><p class="project-disclaimer">Independent redesign · fictitious demonstration data</p></div></article>`;
}
export function projectScreenshots(p, h, { lang = "en" } = {}) {
  const fr = lang === "fr";
  if (!p.media?.length) return "";
  if (p.kind !== "design") return `<section><h2>Project image</h2><figure class="project-single-image">${projectPicture(p.media[0].key, h, { alt: p.media[0].alt, eager: true, sizes: "(max-width: 1100px) 92vw, 1050px" })}<figcaption>${esc(p.media[0].caption || p.media[0].title)}</figcaption></figure></section>`;
  return `<section class="project-screenshots"><h2>${fr ? "Explorer les onze visuels" : "Explore the eleven visuals"}</h2><p>${fr ? "Sélectionne une image pour l’agrandir. Les flèches du clavier permettent de parcourir la présentation ; les données affichées sont fictives." : "Select an image to enlarge it. Keyboard arrows move through the presentation; the displayed data is fictitious."}</p><div class="project-image-grid">${p.media.map((shot, index) => {
    const data = mediaData(shot.key, h.local);
    return `<figure class="project-gallery-item"><a data-project-viewer href="${esc(data.full)}" aria-label="${esc(`${fr ? "Agrandir" : "Enlarge"} ${shot.title}`)}">${projectPicture(shot.key, h, { alt: shot.alt, eager: index === 0 })}<span class="image-enlarge" aria-hidden="true">↗</span></a><figcaption><span class="project-image-number">${String(index + 1).padStart(2, "0")}</span><strong>${esc(shot.title)}</strong></figcaption></figure>`;
  }).join("")}</div></section>`;
}
export function projectVideo(p, h, { lang = "en" } = {}) {
  if (!p.video) return "";
  const fr = lang === "fr";
  return `<section class="project-video" id="walkthrough"><h2>${fr ? "La refonte en vidéo" : "Watch the redesign"}</h2><p>${fr ? "Présentation indépendante avec données fictives. Le lecteur est natif : aucune iframe ni connexion à Google n’est nécessaire pour lire la vidéo." : "Independent presentation with fictitious data. The native player needs no iframe or Google connection to play the video."}</p><div class="native-video-shell" data-native-player hidden><video class="native-project-video" controls playsinline preload="none" width="${nativeVideo.width}" height="${nativeVideo.height}" poster="${h.local(nativeVideo.poster)}" aria-label="${fr ? "Présentation vidéo de la refonte iProf 2026" : "iProf 2026 redesign walkthrough"}" aria-describedby="video-description"><source data-src="${h.local(nativeVideo.file)}" type="video/mp4"><p>${fr ? "Votre navigateur ne prend pas en charge cette vidéo." : "Your browser does not support this video."}</p></video><button type="button" class="native-video-start" data-start-native-video>${fr ? "Lire la vidéo" : "Play the video"}</button></div><noscript><video class="native-project-video" controls playsinline preload="none" width="${nativeVideo.width}" height="${nativeVideo.height}" poster="${h.local(nativeVideo.poster)}" aria-label="${fr ? "Présentation vidéo iProf" : "iProf video walkthrough"}"><source src="${h.local(nativeVideo.file)}" type="video/mp4"></video></noscript><p class="video-note">${h.link("/" + nativeVideo.file, fr ? "Ouvrir le fichier vidéo" : "Open the video file", 'target="_blank" rel="noopener"')} · 1280 × 720 · ${fr ? "47,68 secondes" : "47.68 seconds"} · ${fr ? "Lecture à la demande" : "Loaded on request"}</p><details class="video-description" id="video-description"><summary>${fr ? "Description textuelle des écrans présentés" : "Text description of the on-screen sequence"}</summary><p>${fr ? "Le film ouvre sur les références visuelles au service public, puis présente le titre iProf. Il montre ensuite le tableau de bord et ses échéances, la vue carrière avec sa progression, puis la vitrine publique. Il se termine par la synthèse de la présentation. Les chiffres et promesses affichés dans le film font partie de la maquette fournie ; ils ne constituent pas des mesures d’usage réalisées pour cette étude. Cette description porte sur les images, pas sur une transcription de la piste audio." : "The film opens with public-service visual references and the iProf title. It then shows the dashboard and its deadlines, the career view and its progression, followed by the public-facing page. It ends with the presentation summary. Figures and claims visible in the film belong to the supplied mockup, not measured usage results established by this case study. This describes the images, not a transcription of the audio track."}</p></details></section>`;
}
