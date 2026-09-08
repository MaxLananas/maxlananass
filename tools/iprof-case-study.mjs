import { IPROF_STUDY } from "../content/iprof-case-study.js";
import { dateLabel } from "../content/dates.js";
import { projectPicture, projectScreenshots, projectVideo } from "./project-content.mjs";
import { brandIcon, brandNote } from "./brand.mjs";

export function caseMedia(page) {
  const text = IPROF_STUDY[page.lang || "en"];
  return page.project.media.map((item, index) => ({ ...item, title: text.mediaTitles[index], alt: page.lang === "fr" ? `Refonte iProf 2026 — ${text.mediaTitles[index].toLowerCase()} (maquette)` : item.alt }));
}
export function iprofCaseStudy(page, h) {
  const fr = page.lang === "fr", t = IPROF_STUDY[page.lang || "en"];
  const p = { ...page.project, media: caseMedia(page) };
  const languageNav = `<nav class="language-nav" aria-label="${fr ? "Langue" : "Language"}">${h.link("/projects/iprof-redesign/", "English", 'lang="en" hreflang="en"')} · ${h.link("/fr/projets/refonte-iprof/", "Français", 'lang="fr" hreflang="fr"')}</nav>`;
  const byline = `<p class="byline">${fr ? "Par" : "By"} ${h.link(fr ? "/fr/a-propos/" : "/about/", "MaxLananas")} · <time datetime="${page.published}">${dateLabel(page.published, page.lang)}</time>${page.modified !== page.published ? ` · ${fr ? "Mis à jour le" : "Updated"} <time datetime="${page.modified}">${dateLabel(page.modified, page.lang)}</time>` : ""}</p>`;
  const facts = `<dl class="case-facts"><div><dt>${fr ? "Rôle" : "Role"}</dt><dd>${t.role}</dd></div><div><dt>${fr ? "Support technique" : "Technical context"}</dt><dd>${t.stack}</dd></div><div><dt>${fr ? "Éléments présentés" : "Presented material"}</dt><dd>${t.scope}</dd></div></dl>`;
  return `<div class="case-study">${languageNav}<p class="case-kicker">${brandIcon("cube")}<span>${t.eyebrow}</span></p><p class="case-deck">${t.deck}</p>${byline}<figure class="project-single-image case-hero">${projectPicture(p.leadMedia || p.cover, h, { alt: t.leadAlt, eager: true, sizes: "(max-width: 1100px) 92vw, 1050px" })}</figure><p class="case-intro">${t.introduction}</p>${facts}
  <section><h2>${t.contextTitle}</h2><p>${t.context}</p>${brandNote(fr ? "Ce que les sources permettent d’affirmer" : "What the evidence supports", t.contextNote, "compass")}</section>
  ${t.sections.map((chapter) => `<section class="case-chapter" id="${chapter.id}"><h2>${chapter.title}</h2><p>${chapter.text}</p><figure class="project-single-image">${projectPicture(chapter.image, h, { alt: chapter.alt, sizes: "(max-width: 1100px) 92vw, 1050px" })}</figure>${brandNote(fr ? "Note d’atelier" : "Studio note", chapter.decision, "pineapple")}</section>`).join("")}
  <section><h2>${t.systemTitle}</h2><p>${t.system}</p><div class="case-design-tokens" aria-hidden="true"><span class="token-blue"></span><span class="token-ink"></span><span class="token-paper"></span><span class="token-border"></span></div></section>
  <section><h2>${t.mobileTitle}</h2><p>${t.mobile}</p><div class="case-image-pair">${projectPicture("iprof-accessibility", h, { alt: fr ? "Maquette du mode sombre et intentions d’accessibilité" : "Dark-theme mockup and accessibility intentions" })}${projectPicture("iprof-responsive", h, { alt: fr ? "Présentation de la maquette sur téléphone" : "Presentation of the mockup on a phone" })}</div></section>
  <section><h2>${t.validationTitle}</h2><ul class="brand-checklist">${t.checklist.map((item) => `<li>${item}</li>`).join("")}</ul></section>
  <section><h2>${t.deliverablesTitle}</h2><p>${t.deliverables}</p></section>${projectVideo(p, h, { lang: page.lang })}${projectScreenshots(p, h, { lang: page.lang })}
  <section class="source-note"><h2>${t.limitsTitle}</h2><p>${t.limits}</p><p>${h.link(p.source.url, t.sourceLabel)} · ${fr ? "Sources revues le" : "Sources reviewed"} <time datetime="${page.reviewed}">${dateLabel(page.reviewed, page.lang)}</time>.</p></section>
  <section class="case-next"><p class="case-kicker">${brandIcon("code")}<span>MaxLananas · ${fr ? "Interfaces & outils" : "Interfaces & tools"}</span></p><h2>${t.nextTitle}</h2><p>${t.next}</p><div class="project-actions">${h.link("/#contact", t.contact, 'class="btn-pill-solid"')}${h.link("/development/", t.explore)}</div></section></div>`;
}
