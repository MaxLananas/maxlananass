import media from "../content/project-media.json" with { type: "json" };
import nativeVideo from "../content/iprof-video.json" with { type: "json" };
import { brandIcon } from "./brand.mjs";
import { ui } from "../ui.js";
import { copy } from "../content/i18n.js";
import { META } from "../content/projects-i18n.js";

export const iprofVideo = nativeVideo;
export const projectMedia = media;

const esc = (value = "") => String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const lang = (h) => h?.lang || "en";
export const escapeHtml = esc;

export function mediaData(key, local = (path) => "/" + path) {
  const item = media[key];
  if (!item?.variants?.length) throw new Error(`Missing prepared project media: ${key}`);
  const webp = item.variants.filter((v) => v.format === "webp");
  const selected = webp.find((v) => v.width >= 640) || webp[webp.length - 1];
  return { width: item.width, height: item.height, src: local(selected.path), full: local(webp[webp.length - 1].path),
    webp: webp.map((v) => `${local(v.path)} ${v.width}w`).join(", "),
    avif: item.variants.filter((v) => v.format === "avif").map((v) => `${local(v.path)} ${v.width}w`).join(", ") };
}

export function mediaText(language, item, field, name) {
  const key = item[field + "Key"];
  if (key) return ui(language, key, { name });
  if (field in item) return item[field];
  return field === "caption" ? item.title : "";
}

export function projectPicture(key, h, { alt = "", eager = false, sizes = "(max-width: 640px) 92vw, 44vw", className = "" } = {}) {
  const item = mediaData(key, h.local);
  return `<picture${className ? ` class="${esc(className)}"` : ""}>${item.avif ? `<source type="image/avif" srcset="${esc(item.avif)}" sizes="${esc(sizes)}">` : ""}<img data-project-media="${key}" src="${esc(item.src)}" srcset="${esc(item.webp)}" sizes="${esc(sizes)}" width="${item.width}" height="${item.height}" alt="${esc(alt)}" loading="${eager ? "eager" : "lazy"}" fetchpriority="${eager ? "high" : "low"}" decoding="async"></picture>`;
}

export function projectCard(p, h) {
  const l = lang(h);
  const visual = p.cover ? `<div class="project-card-media">${projectPicture(p.cover, h, { alt: ui(l, "cardAlt", { name: p.name }) })}</div>`
    : p.icon ? `<div class="project-card-icon">${projectPicture(p.icon, h, { alt: "", sizes: "72px" })}</div>`
    : `<div class="project-card-mark" aria-hidden="true">${brandIcon(p.collection === "lab" ? "code" : "cube")}</div>`;
  const label = p.collection === "release" ? copy(l, "shared", "publishedEyebrow")
    : p.collection === "lab" ? copy(l, "shared", "githubLabEyebrow")
    : p.collection === "interface" ? ui(l, "interfaceStudy") : p.categoryFor(l);
  const kind = p.kind === "build" ? ui(l, "cardBuilds") : p.language || p.categoryFor(l);
  return `<article class="project-card project-card-visual">${visual}<div class="project-card-copy"><p class="eyebrow">${esc(label)}</p><h3>${h.link(`/projects/${p.slug}/`, p.name)}</h3><p>${esc(p.summaryFor(l))}</p><span class="project-kind">${esc(kind)}</span>${p.modrinth ? `<p class="project-platform-link">${h.link(p.modrinth, copy(l, "shared", "modrinthLink"))}</p>` : ""}</div></article>`;
}

export function iprofSpotlight(p, h, { eager = false } = {}) {
  const l = lang(h);
  const shared = copy(l, "shared", "spotlightCopy");
  const heading = META[l]["/projects/iprof-redesign/"].heading;
  return `<article class="dev-spotlight"><a class="dev-spotlight-image" href="${h.route(`/projects/${p.slug}/`)}" aria-label="${esc(copy(l, "shared", "spotlightAria"))}">${projectPicture(p.cover, h, { alt: copy(l, "shared", "spotlightAlt"), eager, sizes: "(max-width: 760px) 92vw, 58vw" })}</a><div class="dev-spotlight-copy"><span class="eyebrow">${esc(copy(l, "shared", "spotlightEyebrow"))}</span><h2>${h.link(`/projects/${p.slug}/`, heading)}</h2><p>${esc(shared)}</p><p class="project-kind">${esc(copy(l, "shared", "spotlightKind"))}<br>${esc(copy(l, "shared", "spotlightVisuals"))}</p><p>${h.link(`/projects/${p.slug}/`, copy(l, "shared", "spotlightCta"), 'class="btn-pill-solid"')}</p><p class="project-disclaimer">${esc(copy(l, "shared", "spotlightDisclaimer"))}</p></div></article>`;
}

export function projectScreenshots(p, h) {
  const l = lang(h);
  if (!p.media?.length) return "";
  if (p.kind !== "design") {
    const shot = p.media[0];
    return `<section><h2>${ui(l, "projectImage")}</h2><figure class="project-single-image">${projectPicture(shot.key, h, { alt: mediaText(l, shot, "alt", p.name) || mediaText(l, shot, "title", p.name), eager: true, sizes: "(max-width: 1100px) 92vw, 1050px" })}<figcaption>${esc(mediaText(l, shot, "caption", p.name) || mediaText(l, shot, "title", p.name))}</figcaption></figure></section>`;
  }
  return `<section class="project-screenshots"><h2>${ui(l, "screenshotsTitle")}</h2><p>${ui(l, "screenshotsBody")}</p><div class="project-image-grid">${p.media.map((shot, index) => {
    const data = mediaData(shot.key, h.local);
    const title = mediaText(l, shot, "title", p.name);
    return `<figure class="project-gallery-item"><a data-project-viewer href="${esc(data.full)}" aria-label="${esc(ui(l, "enlarge", { title }))}">${projectPicture(shot.key, h, { alt: mediaText(l, shot, "alt", p.name) || title, eager: index === 0 })}<span class="image-enlarge" aria-hidden="true">↗</span></a><figcaption><span class="project-image-number">${String(index + 1).padStart(2, "0")}</span><strong>${esc(title)}</strong></figcaption></figure>`;
  }).join("")}</div></section>`;
}

export function projectVideo(p, h) {
  const l = lang(h);
  if (!p.video) return "";
  return `<section class="project-video" id="walkthrough"><h2>${ui(l, "videoTitle")}</h2><p>${ui(l, "videoBody")}</p><div class="native-video-shell" data-native-player hidden><video class="native-project-video" controls playsinline preload="none" width="${nativeVideo.width}" height="${nativeVideo.height}" poster="${h.local(nativeVideo.poster)}" aria-label="${esc(ui(l, "videoAria"))}" aria-describedby="video-description"><source data-src="${h.local(nativeVideo.file)}" type="video/mp4"><p>${ui(l, "videoUnsupported")}</p></video><button type="button" class="native-video-start" data-start-native-video>${ui(l, "videoPlay")}</button></div><noscript><video class="native-project-video" controls playsinline preload="none" width="${nativeVideo.width}" height="${nativeVideo.height}" poster="${h.local(nativeVideo.poster)}" aria-label="${esc(ui(l, "videoAriaShort"))}"><source src="${h.local(nativeVideo.file)}" type="video/mp4"></video></noscript><p class="video-note"><a href="${esc(h.local(nativeVideo.file))}" target="_blank" rel="noopener">${esc(ui(l, "videoOpen"))}</a> · ${nativeVideo.width} × ${nativeVideo.height} · ${ui(l, "videoDuration")} · ${ui(l, "videoOnDemand")}</p><details class="video-description" id="video-description"><summary>${ui(l, "videoDescSummary")}</summary><p>${ui(l, "videoDescBody")}</p></details></section>`;
}
