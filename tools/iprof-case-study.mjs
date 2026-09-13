import { IPROF_STUDY } from "../content/iprof-case-study.js";
import { dateLabel } from "../content/dates.js";
import { projectPicture, projectScreenshots, projectVideo } from "./project-content.mjs";
import { brandIcon, brandNote } from "./brand.mjs";
import { ui } from "../ui.js";

export function caseMedia(page) {
  const language = page.lang || "en";
  const text = IPROF_STUDY[language];
  if (!text) throw new Error(`Missing case study language: ${language}`);
  return page.project.media.map((item, index) => ({ ...item, title: text.mediaTitles[index], alt: ui(language, "caseMediaAlt", { title: text.mediaTitles[index] }) }));
}

export function iprofCaseStudy(page, h) {
  const l = page.lang || "en";
  const t = IPROF_STUDY[l];
  if (!t) throw new Error(`Missing case study language: ${l}`);
  const p = { ...page.project, media: caseMedia(page) };
  const byline = `<p class="byline">${ui(l, "caseBy")} ${h.link("/about/", "MaxLananas")} · <time datetime="${page.published}">${dateLabel(page.published, l)}</time>${page.modified !== page.published ? ` · ${ui(l, "caseUpdated")} <time datetime="${page.modified}">${dateLabel(page.modified, l)}</time>` : ""}</p>`;
  const facts = `<dl class="case-facts"><div><dt>${ui(l, "caseRole")}</dt><dd>${t.role}</dd></div><div><dt>${ui(l, "caseStack")}</dt><dd>${t.stack}</dd></div><div><dt>${ui(l, "caseScope")}</dt><dd>${t.scope}</dd></div></dl>`;
  return `<div class="case-study"><p class="case-kicker">${brandIcon("cube")}<span>${t.eyebrow}</span></p><p class="case-deck">${t.deck}</p>${byline}<figure class="project-single-image case-hero">${projectPicture(p.leadMedia || p.cover, h, { alt: t.leadAlt, eager: true, sizes: "(max-width: 1100px) 92vw, 1050px" })}</figure><p class="case-intro">${t.introduction}</p>${facts}
  <section><h2>${t.contextTitle}</h2><p>${t.context}</p>${brandNote(ui(l, "caseEvidence"), t.contextNote, "compass")}</section>
  ${t.sections.map((chapter) => `<section class="case-chapter" id="${chapter.id}"><h2>${chapter.title}</h2><p>${chapter.text}</p><figure class="project-single-image">${projectPicture(chapter.image, h, { alt: chapter.alt, sizes: "(max-width: 1100px) 92vw, 1050px" })}</figure>${brandNote(ui(l, "caseStudioNote"), chapter.decision, "pineapple")}</section>`).join("")}
  <section><h2>${t.systemTitle}</h2><p>${t.system}</p><div class="case-design-tokens" aria-hidden="true"><span class="token-blue"></span><span class="token-ink"></span><span class="token-paper"></span><span class="token-border"></span></div></section>
  <section><h2>${t.mobileTitle}</h2><p>${t.mobile}</p><div class="case-image-pair">${projectPicture("iprof-accessibility", h, { alt: ui(l, "caseDarkAlt") })}${projectPicture("iprof-responsive", h, { alt: ui(l, "casePhoneAlt") })}</div></section>
  <section><h2>${t.validationTitle}</h2><ul class="brand-checklist">${t.checklist.map((item) => `<li>${item}</li>`).join("")}</ul></section>
  <section><h2>${t.deliverablesTitle}</h2><p>${t.deliverables}</p></section>${projectVideo(p, h)}${projectScreenshots(p, h)}
  <section class="source-note"><h2>${t.limitsTitle}</h2><p>${t.limits}</p><p>${h.link(p.source.url, t.sourceLabel)} · ${ui(l, "caseSourcesReviewed")} <time datetime="${page.reviewed}">${dateLabel(page.reviewed, l)}</time>.</p></section>
  <section class="case-next"><p class="case-kicker">${brandIcon("code")}<span>MaxLananas · ${ui(l, "caseKicker")}</span></p><h2>${t.nextTitle}</h2><p>${t.next}</p><div class="project-actions">${h.link("/#contact", t.contact, 'class="btn-pill-solid"')}${h.link("/development/", t.explore)}</div></section></div>`;
}
