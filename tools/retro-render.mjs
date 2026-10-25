/* ==========================================================================
   retro-render.mjs — rebuilds the whole site as a 1999-era personal homepage.
   Same content sources as before (content/*.js, gallery-data.js), new skin:
   bevels, tiled backgrounds, pixel fonts, guestbook, hit counter, MAXAMP.
   Run: npm run retro:render
   ========================================================================== */
import { writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { SITE, PAGE_SIZE, galleryPath, canonical, projectPath } from "../content/site.js";
import { sitePages } from "../content/pages.js";
import { PROJECTS, FEATURED_PROJECT_SLUGS } from "../content/projects.js";
import { copy, label, LANGS, pathFor } from "../content/i18n.js";
import { ui, fill } from "../ui.js";
import { FILES, CREDITS } from "../gallery-data.js";
import { proxyUrl, originalUrl } from "../image-utils.js";
import { mediaData, mediaText, iprofVideo } from "./project-content.mjs";
import { MUSEUM_ARTICLE, MUSEUM_ARTICLE_PATH } from "../content/museum-article.js";
import { META } from "../content/projects-i18n.js";
import { IPROF_STUDY } from "../content/iprof-case-study.js";
import { dateLabel } from "../content/dates.js";

const root = resolve(import.meta.dirname, "..");
const esc = (v = "") => String(v).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const bySlug = (slug) => PROJECTS.find((p) => p.slug === slug);

/* ------------------------------------------------- trilingual chrome copy -- */
const TR = {
  en: {
    marquee: "★ welcome to my little corner of the web!! ★ minecraft builds, mods & interface experiments ★ crank the maxamp radio before you leave ★ new screenshots every month ★",
    bannerNote: "screenshots belong to their builders & crews — credits below",
    visitors: "visitor count", youAre: "you are number", since: "counting since the dial-up days",
    main: "main", fun: "fun stuff", shrines: "shrines", other: "other",
    navHome: "home", navAbout: "about me", navBuilds: "my builds", navProjects: "projects", navJournal: "journal", navGuides: "guides", navGuestbook: "guestbook", navSitemap: "sitemap",
    navSearch: "search", navLinks: "links", navArchive: "photo archive",
    funDev: "dev lab", funGuide: "mods vs plugins", funShaders: "shaders", funJukebox: "jukebox", funColorflow: "block palettes",
    shrineBte: "buildtheearth", shrineLemans: "le mans 24h", shrineMuseum: "the museum page",
    updates: "updates", older: "older entries…",
    nowPlaying: "maxamp v2.91", currently: "currently",
    curBuilding: "building", curPlaying: "playing", curListening: "listening", curMood: "mood",
    curBuildingV: "corsica coastlines for BTE France", curPlayingV: "minecraft 1.21.1 (fabric, obviously)", curListeningV: "minecraft volume alpha, again", curMoodV: "caffeinated & blocky",
    shoutbox: "shoutbox", shoutSend: "ok", shoutPlaceholder: "say hi…", signGb: "sign my guestbook!",
    welcomeWin: "welcome.txt — notepad", notice: "heads up!!",
    noticeBody: "this site contains <b>minecraft screenshots</b>, strong opinions about block palettes, animated gifs and zero cookies. it is hand-coded, slightly messy and best enjoyed with a slow connection. if you want my réasumé-style portfolio… this is it. ^^",
    journalTitle: "journal", featuredTitle: "featured projects", galleryTitle: "latest builds", viewGallery: "open the full gallery",
    contactTitle: "commissions & contact", processTitle: "how a build happens", faqTitle: "questions people ask",
    powered: "powered by", webring: "« prev · minecraft builders webring · next »", webringNote: "member site #47 · join the ring",
    footCopy: "© 1997–2026 MaxLananas · no frames were used, only tables", footMade: "hand-coded in notepad at 2am · every commit is a genuine regret",
    footBest: "best viewed at 800×600", footView: "you are visitor",
    statsTitle: "site statistics", statsBuilds: "builds photographed", statsProjects: "projects documented", statsReleases: "mods & tools published", statsLangs: "languages spoken here", statsUptime: "uptime since 1999",
    gbTitle: "guestbook.exe", gbIntro: "please be nice!! guestbook entries are stored in your own browser (this is a static site, we have no server money). sign it, refresh, it stays. magic.",
    gbName: "name", gbUrl: "your site", gbMsg: "message", gbMood: "mood", gbSend: "sign it!", gbThanks: "thanks for signing!! ♥", gbErr: "write something first!!", gbCount: "entries so far", gbNoscript: "the guestbook needs javascript — leave a shout on discord instead!",
    journalWin: "journal.txt", linksWin: "links.html", linksIntro: "the obligatory links page. cool sites, official profiles and places that shaped this website's look.",
    linksOfficial: "official profiles", linksFun: "cool sites & inspiration", linksRetro: "retro web resources",
    mapWin: "sitemap.txt", mapIntro: "every page of this site, listed like it's 1999 and xml sitemaps don't exist yet.",
    mapMain: "main pages", mapProjects: "project files", mapBuilds: "build gallery", mapExtra: "the fun wing",
    searchTitle: "search the site", searchBtn: "find!", searchPlaceholder: "type a block, a build, a mod…",
    newFlag: "new!", download: "download", source: "source code",
    mediaTitle: "media center", mediaLink: "about this video", aboutWin: "aboutme.txt — notepad",
    blockTitle: "block of the day", blockNote: "palette pulled from my colour obsessions — mixed with", wipTitle: "construction site", wipPct: "overall progress: 69% nice", wip1: "corsica coastline (BTE France) — 68%, waiting on WorldEdit to stop crying", wip2: "jukeboxplus disco UI — 41%, the vinyl texture needs more pixels", wip3: "this website — 99%, forever", journalNote: "this journal is transcribed from real git commits. the embarrassment is authentic.", radioNote: "real chiptunes, synthesized live in your browser by maxamp. no mp3 was harmed.",
    lastUpdated: "page last watered"
  },
  fr: {
    marquee: "★ bienvenue dans mon petit coin du web !! ★ builds minecraft, mods & expériences d'interface ★ monte le son de la radio maxamp avant de partir ★ nouvelles captures chaque mois ★",
    bannerNote: "les captures appartiennent à leurs constructeurs — crédits plus bas",
    visitors: "compteur de visites", youAre: "vous êtes le n°", since: "compte depuis l'époque du modem",
    main: "principal", fun: "coin fun", shrines: "shrines", other: "autre",
    navHome: "accueil", navAbout: "à propos", navBuilds: "mes builds", navProjects: "projets", navJournal: "journal", navGuides: "guides", navGuestbook: "livre d'or", navSitemap: "plan du site",
    navSearch: "recherche", navLinks: "liens", navArchive: "archive photos",
    funDev: "labo dev", funGuide: "mods vs plugins", funShaders: "shaders", funJukebox: "jukebox", funColorflow: "palettes de blocs",
    shrineBte: "buildtheearth", shrineLemans: "le mans 24h", shrineMuseum: "la page du muséum",
    updates: "news", older: "entrées plus anciennes…",
    nowPlaying: "maxamp v2.91", currently: "en ce moment",
    curBuilding: "construction", curPlaying: "je joue à", curListening: "j'écoute", curMood: "humeur",
    curBuildingV: "côtes corses pour BTE France", curPlayingV: "minecraft 1.21.1 (fabric, évidemment)", curListeningV: "minecraft volume alpha, encore", curMoodV: "caféiné & blocky",
    shoutbox: "shoutbox", shoutSend: "ok", shoutPlaceholder: "dis bonjour…", signGb: "signe mon livre d'or !",
    welcomeWin: "bienvenue.txt — bloc-notes", notice: "attention !!",
    noticeBody: "ce site contient <b>des captures minecraft</b>, des avis très tranchés sur les palettes de blocs, des gifs animés et zéro cookie. codé à la main, un peu fouillis, meilleur avec une connexion lente. si tu cherches un portfolio version cv… c'est ici. ^^",
    journalTitle: "journal", featuredTitle: "projets à la une", galleryTitle: "builds récents", viewGallery: "ouvrir la galerie complète",
    contactTitle: "commandes & contact", processTitle: "comment naît un build", faqTitle: "questions fréquentes",
    powered: "propulsé par", webring: "« préc · webring des builders minecraft · suiv »", webringNote: "site membre n°47 · rejoindre",
    footCopy: "© 1997–2026 MaxLananas · aucune frame, seulement des tableaux", footMade: "codé à la main dans le bloc-notes à 2h du mat · chaque commit est un regret authentique",
    footBest: "affiché au mieux en 800×600", footView: "vous êtes le visiteur",
    statsTitle: "statistiques du site", statsBuilds: "builds photographiés", statsProjects: "projets documentés", statsReleases: "mods & outils publiés", statsLangs: "langues parlées ici", statsUptime: "en ligne depuis 1999",
    gbTitle: "livredor.exe", gbIntro: "soyez gentils !! les messages sont gardés dans votre propre navigateur (site statique, pas de sous pour un serveur). signez, rafraîchissez, ça reste. magie.",
    gbName: "pseudo", gbUrl: "ton site", gbMsg: "message", gbMood: "humeur", gbSend: "signer !", gbThanks: "merci pour ta signature !! ♥", gbErr: "écris quelque chose d'abord !!", gbCount: "messages pour l'instant", gbNoscript: "le livre d'or a besoin de javascript — laisse un message sur discord !",
    journalWin: "journal.txt", linksWin: "liens.html", linksIntro: "la page de liens obligatoire. sites cool, profils officiels et endroits qui ont donné son look à ce site.",
    linksOfficial: "profils officiels", linksFun: "sites cool & inspiration", linksRetro: "ressources web rétro",
    mapWin: "plan.txt", mapIntro: "toutes les pages du site, listées comme en 1999, avant les sitemaps xml.",
    mapMain: "pages principales", mapProjects: "fiches projets", mapBuilds: "galerie de builds", mapExtra: "l'aile fun",
    searchTitle: "chercher sur le site", searchBtn: "trouver !", searchPlaceholder: "un bloc, un build, un mod…",
    newFlag: "nouveau !", download: "télécharger", source: "code source",
    mediaTitle: "centre média", mediaLink: "à propos de cette vidéo", aboutWin: "apropos.txt — bloc-notes",
    blockTitle: "bloc du jour", blockNote: "palette tirée de mes obsessions de couleurs — mixée avec", wipTitle: "chantier en cours", wipPct: "progression globale : 69 % nice", wip1: "côtes corses (BTE France) — 68 %, on attend que WorldEdit arrête de pleurer", wip2: "jukeboxplus UI disco — 41 %, la texture vinyle réclame plus de pixels", wip3: "ce site — 99 %, pour toujours", journalNote: "ce journal est transcrit depuis de vrais commits git. la gêne est authentique.", radioNote: "vraies chiptunes, synthétisées en direct dans ton navigateur par maxamp. aucun mp3 blessé.",
    lastUpdated: "page arrosée le"
  },
  es: {
    marquee: "★ ¡bienvenido a mi rinconcito de la web!! ★ builds de minecraft, mods y experimentos de interfaz ★ súbele a la radio maxamp antes de irte ★ capturas nuevas cada mes ★",
    bannerNote: "las capturas pertenecen a sus constructores — créditos abajo",
    visitors: "contador de visitas", youAre: "eres el número", since: "contando desde la época del módem",
    main: "principal", fun: "cosas fun", shrines: "shrines", other: "otro",
    navHome: "inicio", navAbout: "sobre mí", navBuilds: "mis builds", navProjects: "proyectos", navJournal: "diario", navGuides: "guías", navGuestbook: "libro de visitas", navSitemap: "mapa del sitio",
    navSearch: "buscar", navLinks: "enlaces", navArchive: "archivo de fotos",
    funDev: "lab dev", funGuide: "mods vs plugins", funShaders: "shaders", funJukebox: "jukebox", funColorflow: "paletas de bloques",
    shrineBte: "buildtheearth", shrineLemans: "le mans 24h", shrineMuseum: "la página del museo",
    updates: "noticias", older: "entradas anteriores…",
    nowPlaying: "maxamp v2.91", currently: "ahora mismo",
    curBuilding: "construyendo", curPlaying: "jugando", curListening: "escuchando", curMood: "humor",
    curBuildingV: "costas de córcega para BTE France", curPlayingV: "minecraft 1.21.1 (fabric, obvio)", curListeningV: "minecraft volume alpha, otra vez", curMoodV: "con café y bloques",
    shoutbox: "shoutbox", shoutSend: "ok", shoutPlaceholder: "saluda…", signGb: "¡firma mi libro de visitas!",
    welcomeWin: "bienvenida.txt — bloc de notas", notice: "¡aviso!",
    noticeBody: "este sitio contiene <b>capturas de minecraft</b>, opiniones muy fuertes sobre paletas de bloques, gifs animados y cero cookies. está hecho a mano, algo desordenado y se disfruta mejor con conexión lenta. si buscas mi portfolio estilo cv… es este. ^^",
    journalTitle: "diario", featuredTitle: "proyectos destacados", galleryTitle: "builds recientes", viewGallery: "abrir la galería completa",
    contactTitle: "encargos y contacto", processTitle: "cómo nace un build", faqTitle: "preguntas frecuentes",
    powered: "funciona con", webring: "« ant · webring de builders minecraft · sig »", webringNote: "sitio miembro #47 · únete",
    footCopy: "© 1997–2026 MaxLananas · sin frames, solo tablas", footMade: "escrito a mano en el bloc de notas a las 2am · cada commit es un arrepentimiento auténtico",
    footBest: "mejor visto a 800×600", footView: "eres el visitante",
    statsTitle: "estadísticas del sitio", statsBuilds: "builds fotografiados", statsProjects: "proyectos documentados", statsReleases: "mods y herramientas publicadas", statsLangs: "idiomas aquí", statsUptime: "en línea desde 1999",
    gbTitle: "libro.exe", gbIntro: "¡sed majos! los mensajes se guardan en vuestro propio navegador (sitio estático, no hay dinero para servidores). firma, refresca, se queda. magia.",
    gbName: "nombre", gbUrl: "tu sitio", gbMsg: "mensaje", gbMood: "humor", gbSend: "¡firmar!", gbThanks: "¡gracias por firmar!! ♥", gbErr: "¡escribe algo primero!", gbCount: "entradas hasta ahora", gbNoscript: "el libro necesita javascript — ¡deja un saludo en discord!",
    journalWin: "diario.txt", linksWin: "enlaces.html", linksIntro: "la obligatoria página de enlaces. sitios guays, perfiles oficiales y lugares que dieron su look a esta web.",
    linksOfficial: "perfiles oficiales", linksFun: "sitios guays e inspiración", linksRetro: "recursos web retro",
    mapWin: "mapa.txt", mapIntro: "todas las páginas del sitio, listadas como en 1999, antes de los sitemaps xml.",
    mapMain: "páginas principales", mapProjects: "fichas de proyectos", mapBuilds: "galería de builds", mapExtra: "el ala fun",
    searchTitle: "buscar en el sitio", searchBtn: "¡buscar!", searchPlaceholder: "un bloque, un build, un mod…",
    newFlag: "¡nuevo!", download: "descargar", source: "código fuente",
    mediaTitle: "centro de medios", mediaLink: "sobre este vídeo", aboutWin: "sobremi.txt — bloc de notas",
    blockTitle: "bloque del día", blockNote: "paleta sacada de mis obsesiones de color — mezclada con", wipTitle: "obra en curso", wipPct: "progreso total: 69 % nice", wip1: "costa corsa (BTE France) — 68 %, esperando que WorldEdit deje de llorar", wip2: "jukeboxplus UI disco — 41 %, la textura de vinilo pide más píxeles", wip3: "esta web — 99 %, para siempre", journalNote: "este diario se transcribe desde commits git reales. la vergüenza es auténtica.", radioNote: "chiptunes reales, sintetizadas en vivo en tu navegador por maxamp. ningún mp3 fue herido.",
    lastUpdated: "página regada el"
  }
};

/* ------------------------------------------------------------- journal -- */
const JOURNAL = [
  { d: "2026-10-25", h: "cb0a9a7", en: "the guestbook is gone: the spam bots found it in under a week. the 90s were nicer, the bots are modern. shout at the radio instead, it actually plays music now.", fr: "le livre d'or a disparu : les bots de spam l'ont trouvé en moins d'une semaine. les années 90 étaient plus douces, les bots sont modernes. crie vers la radio plutôt, elle joue vraiment de la musique maintenant.", es: "el libro de visitas se fue: los bots de spam lo encontraron en menos de una semana. los 90 eran más amables, los bots son modernos. grítale a la radio, ahora sí suena música." },
  { d: "2026-10-25", h: "6e459e8", en: "redesigned the whole site again!! third time this year. sorry mom, the table layouts were calling me. i hand-rolled a PNG and a GIF encoder for this. my therapist asked me to say hi.", fr: "refonte complète du site, encore !! troisième fois cette année. pardon maman, les tableaux m'appelaient. j'ai codé un encodeur PNG et un encodeur GIF à la main pour ça. ma thérapeute me dit de vous saluer.", es: "¡rediseñé todo el sitio otra vez!! tercera vez este año. perdón mamá, las tablas me llamaban. escribí a mano un codificador PNG y uno GIF para esto. mi terapeuta saluda." },
  { d: "2026-09-30", h: "5189837", link: MUSEUM_ARTICLE_PATH, en: "the Muséum de Toulouse featured our Pont Neuf build!! page published, image metadata polished, tears shed, commit pushed, more tears shed. worth it.", fr: "le Muséum de Toulouse a parlé de notre build du Pont-Neuf !! page publiée, métadonnées images soignées, larmes versées, commit poussé, autres larmes versées. ça valait le coup.", es: "¡el Muséum de Toulouse destacó nuestro build del Pont Neuf!! página publicada, metadatos pulidos, lágrimas derramadas, commit subido, más lágrimas. valió la pena." },
  { d: "2026-09-13", h: "45d5207", en: "spent the day bisecting a horizontal overflow on small screens. the culprit was one (1) tab control. twelve commits of public embarrassment, archived forever in git. do not look at them. look at them.", fr: "journée passée à faire une bissection de débordement horizontal sur petits écrans. le coupable : un (1) onglet. douze commits de gêne publique, archivés pour l'éternité dans git. ne les regardez pas. regardez-les.", es: "día entero haciendo bisect de un desborde horizontal en pantallas pequeñas. el culpable: una (1) pestaña. doce commits de vergüenza pública, archivados para siempre en git. no los miren. mírenlos." },
  { d: "2026-09-13", h: "36d0e42", link: "/projects/riptide/", en: "Riptide went trilingual and the SEO program now compiles. yes, « the SEO program compiles » is a real sentence in my life now. no, i will not explain it at dinner.", fr: "Riptide est passé trilingue et le programme SEO compile désormais. oui, « le programme SEO compile » est une vraie phrase dans ma vie maintenant. non, je ne l'expliquerai pas au dîner.", es: "Riptide ahora es trilingüe y el programa SEO compila. sí, «el programa SEO compila» es una frase real en mi vida. no, no lo explicaré en la cena." },
  { d: "2026-09-08", h: "fa594d6", en: "the build now validates encoded media signatures, not just dimensions. every image shows its papers at the border before entering dist/. customs is strict but fair.", fr: "le build valide maintenant les signatures des médias encodés, pas seulement les dimensions. chaque image présente ses papiers à la frontière avant d'entrer dans dist/. la douane est stricte mais juste.", es: "el build ahora valida firmas de medios codificados, no solo dimensiones. cada imagen muestra sus papeles en la frontera antes de entrar a dist/. la aduana es estricta pero justa." },
  { d: "2026-09-07", h: "c5a752b", link: "/projects/iprof-redesign/", en: "remuxed the iProf walkthrough video without re-encoding: 8 MB of H.264 handled like a vintage wine, bottle never opened. native player shipped, preload none, dignity intact.", fr: "remuxage de la vidéo iProf sans réencodage : 8 Mo de H.264 traités comme un grand cru, bouteille jamais ouverte. lecteur natif livré, preload none, dignité intacte.", es: "remux del vídeo de iProf sin recodificar: 8 MB de H.264 tratados como un vino de guarda, botella nunca abierta. lector nativo listo, preload none, dignidad intacta." },
  { d: "2026-09-07", h: "cfaac07", en: "the iProf redesign became the featured project: eleven visuals, zero invented KPIs, one very honest disclaimer. interface work finally has a home that isn't a readme.", fr: "la refonte iProf est devenue le projet vedette : onze visuels, zéro KPI inventé, un avertissement très honnête. le travail d'interface a enfin une maison qui n'est pas un readme.", es: "el rediseño de iProf pasó a proyecto destacado: once visuales, cero KPI inventados, un aviso muy honesto. el trabajo de interfaz por fin tiene casa que no es un readme." },
  { d: "2026-07-21", h: "e2b54fe", en: "committed « Update index.html » twelve times in one single day. TWELVE. the twelfth one was the good one. sorry mom, it was 3am and the pixels wouldn't align.", fr: "douze commits « Update index.html » dans la même journée. DOUZE. le douzième était le bon. pardon maman, il était 3h et les pixels ne voulaient pas s'aligner.", es: "doce commits «Update index.html» en un solo día. DOCE. el duodécimo era el bueno. perdón mamá, eran las 3am y los píxeles no se alineaban." },
  { d: "2026-07-21", h: "0354ac5", en: "created sw.js. the service worker has been caching our regrets offline ever since, and it refuses to let go. unsubscribe at your own risk.", fr: "création de sw.js. le service worker met nos regrets en cache hors-ligne depuis ce jour, et refuse de lâcher l'affaire. désinscription à vos risques et périls.", es: "creé sw.js. el service worker guarda nuestros regrets en caché sin conexión desde entonces, y no suelta. date de baja bajo tu propio riesgo." },
  { d: "2026-07-21", h: "f6e914b", en: "manifest.json entered the chat: the site is now « installable », which means the browser keeps asking to put it on the home screen. we are a real app now. someone call the press.", fr: "manifest.json est entré dans le chat : le site est désormais « installable », ce qui signifie que le navigateur supplie de le mettre sur l'écran d'accueil. on est une vraie app maintenant. appelez la presse.", es: "manifest.json entró al chat: el sitio ya es «instalable», o sea el navegador ruega ponerlo en la pantalla de inicio. ya somos una app de verdad. llamen a la prensa." }
];

/* ---------------------------------------------------------------- helpers -- */
function helpersFor(lang) {
  const route = (path) => pathFor(lang, path);
  const link = (path, text, attrs = "") => `<a href="${esc(/^https?:|#|mailto:/.test(path) ? path : route(path))}"${attrs ? " " + attrs : ""}>${esc(text)}</a>`;
  const t = (key, values) => ui(lang, key, values);
  const c = (key, field) => copy(lang, key, field);
  const tr = (key) => TR[lang][key];
  return { lang, route, link, t, c, tr };
}

const panel = (title, inner, cls = "") => `<div class="panel ${cls}"><div class="panel-h"><span class="deco">†</span> ${esc(title)} <span class="deco">†</span></div><div class="rule"></div>${inner}</div>`;
const win = (title, inner) => `<div class="win"><div class="tbar"><span>${esc(title)}</span><span class="wb"><span>_</span><span>□</span><span>×</span></span></div><div class="win-b">${inner}</div></div>`;
const h2 = (text) => `<h2 class="pixel">${esc(text)}</h2>`;

function photoTable(items, h, cols = 3) {
  let out = '<table class="shots">';
  items.forEach((item, i) => {
    if (i % cols === 0) out += "<tr>";
    const index = FILES.findIndex((f) => f.name === item.name);
    const text = label(h.lang, item, index);
    const credit = item.credit ? copy(h.lang, "credits", item.credit) : null;
    out += `<td><a class="thumb" href="${esc(originalUrl(item))}" target="_blank" rel="noopener"><img src="${esc(proxyUrl(item, 320))}" alt="${esc(text)} — MaxLananas (#${index + 1})" loading="lazy"></a><div class="cap"><b>${esc(text)}</b><br>${credit ? esc(credit.text) + " " + esc(credit.linkText) : esc(copy(h.lang, "/builds/", "captionDefault"))}<br><span class="tiny">${esc(fill(copy(h.lang, "/builds/", "imageMeta"), { index: index + 1, file: item.name }))}</span></div></td>`;
    if (i % cols === cols - 1) out += "</tr>";
  });
  if (items.length % cols) out += "</tr>";
  return out + "</table>";
}

function mediaShot(keys, h, cols = 2) {
  let out = '<table class="shots">';
  keys.forEach((key, i) => {
    if (i % cols === 0) out += "<tr>";
    const data = mediaData(key.key || key);
    const title = key.title || mediaText(h.lang, key, "title") || "";
    out += `<td><a class="thumb" href="${esc(data.full)}" target="_blank" rel="noopener"><img src="${esc(data.src)}" alt="${esc(key.alt || title)}" loading="lazy"></a>${title ? `<div class="cap"><b>${esc(title)}</b></div>` : ""}</td>`;
    if (i % cols === cols - 1) out += "</tr>";
  });
  if (keys.length % cols) out += "</tr>";
  return out + "</table>";
}

function cardRow(p, h) {
  const l = h.lang;
  let visual;
  if (p.cover || p.icon) {
    const data = mediaData(p.cover || p.icon);
    visual = `<img src="${esc(data.src)}" alt="${esc(ui(l, "cardAlt", { name: p.name }))}" loading="lazy" style="width:84px;height:auto;">`;
  } else {
    visual = '<span class="b88 grey">pic soon(tm)</span>';
  }
  const recent = p.collection === "release";
  return `<tr class="card-row"><td class="ic">${visual}</td><td><h3 class="pixel">${h.link(projectPath(p.slug), p.name)} ${recent ? `<span class="newflag blink">[${esc(h.tr("newFlag"))}]</span>` : ""}</h3><p>${esc(p.summaryFor(l))}</p><span class="kind">${esc(p.categoryFor(l))}</span> ${p.language ? `<span class="kind">${esc(p.language)}</span>` : ""} ${p.modrinth ? `<span class="tiny">· ${h.link(p.modrinth, copy(l, "shared", "modrinthLink"))}</span>` : ""}</td></tr>`;
}
const cards = (projects, h) => `<table class="cards">${projects.map((p) => cardRow(p, h)).join("")}</table>`;

/* ------------------------------------------------------------------ rails -- */
function leftRail(h, current) {
  const nav = (path, labelKey) => `<a class="navbtn" href="${esc(h.route(path))}"${current === path ? ' aria-current="page"' : ""}>${esc(h.tr(labelKey))}</a>`;
  return [
    panel(h.tr("visitors"), `<div class="center"><span class="odo" id="odo"></span><div class="tiny">${esc(h.tr("youAre"))} <span id="odo-mini">??????</span><br>${esc(h.tr("since"))}</div></div>`),
    panel(h.tr("main"), [nav("/", "navHome"), nav("/about/", "navAbout"), nav("/builds/", "navBuilds"), nav("/projects/", "navProjects"), nav("/journal/", "navJournal"), nav("/guides/minecraft-mods-plugins-addons/", "navGuides"), nav("/sitemap/", "navSitemap")].join("")),
    panel(h.tr("fun"), [nav("/development/", "funDev"), nav("/guides/minecraft-mods-plugins-addons/", "funGuide"), nav("/projects/nostalgia-ultra/", "funShaders"), nav("/projects/jukeboxplus/", "funJukebox"), nav("/projects/colorflow/", "funColorflow")].join("")),
    panel(h.tr("shrines"), `<div class="blinkie-row"><img class="pixel" src="/assets/retro/star.gif" alt="" width="21" height="21"><br>${h.link("/buildtheearth/", h.tr("shrineBte"))}<br><img class="pixel" src="/assets/retro/heart.gif" alt="" width="17" height="15"><br>${h.link("/projects/le-mans/", h.tr("shrineLemans"))}<br>${h.link(MUSEUM_ARTICLE_PATH, h.tr("shrineMuseum"))}</div>`),
    panel(h.tr("other"), [nav("/links/", "navLinks"), nav("/search/", "navSearch"), `<a class="navbtn" href="https://github.com/MaxLananas/Asset-Portfolio/releases/tag/images-v1" target="_blank" rel="noopener">${esc(h.tr("navArchive"))}</a>`, `<a class="navbtn" href="${esc(SITE.discord)}" target="_blank" rel="noopener">discord</a>`].join(""))
  ].join("");
}

function rightRail(h) {
  const journal = JOURNAL.slice(0, 5).map((e) => `<li><b>[${e.d} · ${e.h}]</b>${esc(e[h.lang])} ${e.link ? h.link(e.link, "→") : ""}</li>`).join("");
  return [
    panel(h.tr("updates"), `<ul class="upd">${journal}</ul><p class="center tiny">${h.link("/journal/", h.tr("older"))}</p>`),
    `<div class="winamp" id="winamp"><div class="wa-tbar"><span>${esc(h.tr("nowPlaying"))}</span><span class="wb"><span>_</span><span>□</span><span>×</span></span></div><div class="wa-body"><div class="wa-lcd"><marquee scrollamount="2"><span id="wa-track">--:--</span></marquee></div><div class="wa-row"><div class="wa-eq"><i></i><i></i><i></i><i></i><i></i></div><div class="wa-time" id="wa-time">00:00:00</div></div><div class="wa-btns"><button class="wa-btn" id="wa-play" type="button">&gt;</button><button class="wa-btn" id="wa-pause" type="button">||</button><button class="wa-btn" id="wa-stop" type="button">[]</button><span class="wa-vol">vol<input type="range" id="wa-vol" min="0" max="100" value="60"></span></div><ul class="wa-list" id="wa-list"></ul><p class="tiny" style="margin:5px 0 0;color:#8f8b83;">${esc(h.tr("radioNote"))}</p></div></div>`,
    panel(h.tr("currently"), `<div class="cur"><b>${esc(h.tr("curBuilding"))}:</b> ${esc(h.tr("curBuildingV"))}<br><b>${esc(h.tr("curPlaying"))}:</b> ${esc(h.tr("curPlayingV"))}<br><b>${esc(h.tr("curListening"))}:</b> ${esc(h.tr("curListeningV"))}<br><b>${esc(h.tr("curMood"))}:</b> ${esc(h.tr("curMoodV"))}</div>`),
    `<div class="dark"><div class="panel-h"><span class="deco">†</span> awards <span class="deco">†</span></div><div class="rule"></div><div class="center"><span class="b88 rainbow">cool site of the day · self-awarded</span><div class="tiny" style="margin-top:5px;">this award belongs to me because i gave it to myself ★</div></div></div>`
  ].join("");
}

/* ------------------------------------------------------------------ pages -- */
function homeBody(page, h) {
  const l = h.lang, k = "/";
  const featured = FEATURED_PROJECT_SLUGS.map(bySlug);
  const services = copy(l, k, "services");
  const process = copy(l, k, "process");
  const faq = copy(l, k, "faq");
  return [
    win(h.tr("welcomeWin"), `<div class="welcome"><div class="ava"><img class="pixel" src="/assets/retro/avatar.png" alt="pixel avatar of MaxLananas" width="96" height="96"></div><div class="txt"><h1 class="pixel">${esc(page.heading)}</h1><p class="tiny">${esc(copy(l, k, "identity"))}</p><p>${fill(copy(l, k, "intro"), { iprof: h.link("/projects/iprof-redesign/", copy(l, k, "introIprof")), bte: h.link("/buildtheearth/", copy(l, k, "introBte")), dev: h.link("/development/", copy(l, k, "introDev")), about: h.link("/about/", copy(l, k, "introAbout")) })}</p></div></div>`),
    `<div class="sunken notice"><b>${esc(h.tr("notice"))}</b> <img class="pixel" src="/assets/retro/construction.gif" alt="" width="88" height="31" style="float:right;margin-left:6px;"> ${h.tr("noticeBody")}</div>`,
    panel(h.tr("journalTitle"), JOURNAL.slice(0, 2).map((e) => `<p><b class="tiny">[${e.d}]</b> ${esc(e[l])} ${e.link ? h.link(e.link, "→") : ""}</p>`).join("") + `<p class="center">${h.link("/journal/", h.tr("older"))}</p>`),
    panel(h.tr("featuredTitle"), `<p>${esc(copy(l, k, "projectsIntro"))}</p>` + cards(featured, h) + `<p class="center tiny">${h.link("/development/", copy(l, k, "sectionLinksDev"))} · ${h.link(SITE.modrinth, copy(l, k, "sectionLinksModrinth"))}</p>`),

    panel(h.tr("blockTitle"), `<div id="block-day" class="swatches"></div><p class="tiny center">${esc(h.tr("blockNote"))} ${h.link("/projects/colorflow/", "Colorflow")}</p>`),
    panel(h.tr("wipTitle"), `<div class="pbar"><i></i></div><p class="tiny center">${esc(h.tr("wipPct"))}</p><ul class="pix"><li>${esc(h.tr("wip1"))}</li><li>${esc(h.tr("wip2"))}</li><li>${esc(h.tr("wip3"))}</li></ul><pre class="ascii" aria-hidden="true">
########
#@@##@@#
#@@##@@#
###@@###
##@@@@##
##@##@##
########</pre>`),
    panel(h.tr("mediaTitle"), `<figure class="shot" style="margin:2px 0 4px;"><video class="native" controls playsinline preload="none" poster="/${esc(iprofVideo.poster)}" width="${iprofVideo.width}" height="${iprofVideo.height}"><source src="/${esc(iprofVideo.file)}" type="video/mp4"></video><figcaption>${esc(ui(l, "videoTitle"))} · ${h.link("/projects/iprof-redesign/", h.tr("mediaLink"))}</figcaption></figure>`),
    panel(h.tr("contactTitle"), `<p>${esc(copy(l, k, "contactIntro"))}</p><p class="center"><a class="btn95 primary" href="${esc(SITE.discord)}" target="_blank" rel="noopener">${esc(copy(l, k, "contactCta"))}</a><br><span class="tiny">${esc(copy(l, k, "contactNote"))}</span></p><ul class="pix">${services.map((s) => `<li><b>${esc(s.title)}</b> — ${esc(s.text)}</li>`).join("")}</ul>`),
    panel(h.tr("processTitle"), `<ol class="pix">${process.map((s) => `<li><b>${esc(s.title)}</b> — ${esc(s.text)}</li>`).join("")}</ol>`),
    panel(h.tr("faqTitle"), faq.map((item) => `<details><summary>${esc(item.q)}</summary><p>${esc(item.a)}</p></details>`).join("")),

  ].join("");
}

function aboutBody(page, h) {
  const l = h.lang, k = "/about/", c = (f) => copy(l, k, f);
  const profiles = [SITE.github, SITE.modrinth, SITE.instagram, SITE.discord];
  const releases = PROJECTS.filter((p) => p.collection === "release").length;
  return win(h.tr("aboutWin"), [
    `<p class="tiny">${esc(c("eyebrow"))}</p>`,
    `<div class="welcome"><div class="ava"><img class="pixel" src="/assets/retro/avatar.png" alt="" width="96" height="96"></div><div class="txt"><p>${esc(c("p1"))}</p><p>${fill(c("p2"), { strong: "<strong>MaxLananas</strong>" })}</p></div></div>`,
    panel(h.tr("statsTitle"), `<table class="data"><tbody><tr><th>${esc(h.tr("statsBuilds"))}</th><td>${FILES.length}</td></tr><tr><th>${esc(h.tr("statsProjects"))}</th><td>${PROJECTS.length}</td></tr><tr><th>${esc(h.tr("statsReleases"))}</th><td>${releases}</td></tr><tr><th>${esc(h.tr("statsLangs"))}</th><td>3 (en · fr · es)</td></tr><tr><th>${esc(h.tr("statsUptime"))}</th><td>~27 years, give or take</td></tr></tbody></table>`),
    h2(c("s1Title")) + `<p>${fill(c("s1"), { builds: h.link("/builds/", c("s1Builds")), bte: h.link("/buildtheearth/", c("s1Bte")) })}</p>`,
    h2(c("s2Title")) + `<p>${fill(c("s2a"), { iprof: h.link("/projects/iprof-redesign/", c("s2aIprof")), modrinth: h.link(SITE.modrinth, c("s2aModrinth")) })}</p><p>${fill(c("s2b"), { homegui: h.link("/projects/homegui/", "HomeGUI"), tracebte: h.link("/projects/tracebte/", "TraceBTE"), railway: h.link("/projects/railway-tools-axiom/", "Railway Tools"), pineapple: h.link("/projects/pineappleui/", "PineappleUI") })}</p><p>${fill(c("s2c"), { projects: h.link("/projects/", c("s2cProjects")) })}</p>`,
    h2(c("s3Title")) + `<ul class="pix">${c("s3Items").map((item, i) => `<li>${h.link(profiles[i], item.label, 'target="_blank" rel="noopener"')} : ${esc(item.text)}</li>`).join("")}</ul><p>${fill(c("s3Note"), { process: h.link("/#process", c("s3NoteProcess")), contact: h.link("/#contact", c("s3NoteContact")) })}</p>`,
    `<div class="sunken notice" id="image-rights">${h2(c("s4Title"))}<p>${esc(c("s4"))}</p><p class="tiny">${esc(c("imageRights"))}</p></div>`
  ].join(""));
}

function spotlight(h, eager = false) {
  const l = h.lang, p = bySlug("iprof-redesign");
  const data = mediaData(p.cover);
  return `<div class="sunken" style="padding:7px;"><table style="width:100%;border-collapse:collapse;"><tr><td style="width:46%;vertical-align:top;padding:0 8px 0 0;"><a href="${esc(h.route(projectPath(p.slug)))}"><img src="${esc(data.src)}" alt="${esc(copy(l, "shared", "spotlightAlt"))}" style="width:100%;height:auto;border:1px solid #5f5b54;"></a></td><td style="vertical-align:top;"><p class="tiny">${esc(copy(l, "shared", "spotlightEyebrow"))}</p><h2 class="pixel">${h.link(projectPath(p.slug), META[l]["/projects/iprof-redesign/"].heading)}</h2><p>${esc(copy(l, "shared", "spotlightCopy"))}</p><p class="tiny">${esc(copy(l, "shared", "spotlightKind"))}<br>${esc(copy(l, "shared", "spotlightVisuals"))}</p><p><a class="btn95 primary" href="${esc(h.route(projectPath(p.slug)))}">${esc(copy(l, "shared", "spotlightCta"))}</a></p><p class="tiny">${esc(copy(l, "shared", "spotlightDisclaimer"))}</p></td></tr></table></div>`;
}

function projectsHubBody(h) {
  const l = h.lang, k = "/projects/", c = (f) => copy(l, k, f);
  const group = (cols) => PROJECTS.filter((p) => cols.includes(p.collection));
  return [
    `<p>${esc(c("intro"))}</p>`,
    spotlight(h),
    h2(c("modrinthTitle")) + cards(group(["release"]), h) + `<p class="center">${h.link(SITE.modrinth, c("modrinthCta"), 'class="btn95" target="_blank" rel="noopener"')}</p>`,
    h2(c("labTitle")) + `<p>${esc(c("labIntro"))}</p>` + cards(group(["lab"]), h),
    h2(c("refsTitle")) + `<p>${esc(c("refsIntro"))}</p>` + cards(group(["reference", "build"]), h)
  ].join("");
}

function projectBody(page, h) {
  const l = h.lang, p = page.project, t = h.t;
  const sourceUrl = p.source?.url || (p.repo && p.revision ? p.repo + "/blob/" + p.revision + "/" + p.evidenceFile : p.repo);
  const primary = p.modrinth ? [p.modrinth, t("launchModrinth")] : p.web && p.launch?.url ? [p.launch.url, t("launchApp")] : p.repo ? [p.repo, t("launchGithub")] : p.source ? [p.source.url, t("launchSource")] : [SITE.discord, t("launchContact")];
  const lead = p.cover || p.leadMedia || p.icon;
  const figure = lead ? `<figure class="shot"><img src="${esc(mediaData(lead).src)}" alt="${esc(ui(l, "cardAlt", { name: p.name }))}"><figcaption>${esc(p.categoryFor(l))}</figcaption></figure>` : "";
  const mediaShots = p.media?.length ? h2(t("screenshotsTitle")) + mediaShot(p.media.map((m) => ({ ...m, title: mediaText(l, m, "title", p.name), alt: mediaText(l, m, "alt", p.name) })), h) : "";
  const buildShots = p.images?.length ? h2(p.kind === "build" ? t("sectionShots") : t("sectionExampleBuilds")) + photoTable(p.images.map((name) => FILES.find((f) => f.name === name)), h) : "";
  const related = p.related?.length ? h2(t("sectionRelated")) + cards(p.related.map(bySlug), h) + `<p class="center tiny">${h.link("/projects/", t("relatedAll"))} · ${h.link(p.bte ? "/buildtheearth/" : "/development/", p.bte ? t("relatedBte") : t("relatedDev"))}</p>` : "";
  return win(p.name + " — " + (p.kind === "build" ? "build file" : "project file"), [
    figure,
    `<p class="tiny">${esc(p.categoryFor(l))}</p>`,
    p.introFor(l).map((text) => `<p>${esc(text)}</p>`).join(""),
    `<p class="center"><a class="btn95 primary" href="${esc(primary[0])}" target="_blank" rel="noopener">${esc(primary[1])}</a> ${sourceUrl ? `<a class="btn95" href="${esc(sourceUrl)}" target="_blank" rel="noopener">${esc(h.tr("source"))}</a>` : ""}</p>`,
    p.kind === "design" ? `<p class="tiny">${esc(t("scopeNotice"))}</p>` : "",
    p.video ? `<figure class="shot"><video class="native" controls playsinline preload="none" poster="/${esc(iprofVideo.poster)}" width="${iprofVideo.width}" height="${iprofVideo.height}"><source src="/${esc(iprofVideo.file)}" type="video/mp4"></video><figcaption>${esc(ui(l, "videoTitle"))} · ${iprofVideo.width}×${iprofVideo.height}</figcaption></figure>` : "",
    mediaShots,
    h2(p.kind === "build" ? t("sectionExplore") : t("sectionDoes")) + `<ul class="pix">${p.featuresFor(l).map((f) => `<li>${esc(f)}</li>`).join("")}</ul>`,
    p.hasFor(l, "faq") ? h2(t("sectionFaq")) + p.faqFor(l).map((item) => `<details><summary>${esc(item.q)}</summary><p>${esc(item.a)}</p></details>`).join("") : "",
    (l === "en" ? p.requirements : p.requirementsFor(l)) ? h2(t("sectionEnv")) + `<p>${esc(l === "en" ? p.requirements : p.requirementsFor(l))}</p>` : "",
    h2(p.kind === "build" ? t("sectionUsing") : t("sectionStart")) + `<p>${esc(p.usageFor(l))}</p>`,
    buildShots,
    h2(t("sectionScope")) + `<p>${esc(p.limitsFor(l))}</p>` + (p.upstream ? `<p class="tiny">${fill(t("upstreamNote"), { upstream: h.link(p.upstream, "TehBrian’s BuildersUtilities"), original: h.link("https://www.spigotmc.org/resources/builders-utilities.42361/", "Arcaniax’s Builder’s Utilities"), license: h.link(p.repo + "/blob/" + p.revision + "/LICENSE", t("upstreamLicense")) })}</p>` : ""),
    sourceUrl ? `<div class="sunken notice">${h2(t("projectSources"))}<p>${h.link(sourceUrl, p.modrinth ? t("sourceModrinth") : t("sourceRepo"))} · ${fill(t("reviewedOn"), { date: `<time datetime="${page.reviewed}">${dateLabel(page.reviewed, l)}</time>` })}</p>${p.modrinth ? `<p class="tiny">${h.link(p.modrinth + "/versions", t("versionsDownloads"))}</p>` : ""}</div>` : "",
    related
  ].join(""));
}

function caseStudyBody(page, h) {
  const l = h.lang, s = IPROF_STUDY[l];
  const deliverableKeys = ["iprof-showcase", "iprof-cover", "iprof-overview", "iprof-login", "iprof-dashboard", "iprof-career", "iprof-mobility", "iprof-documents", "iprof-messaging", "iprof-accessibility", "iprof-responsive"];
  return win("iprof 2026 — case study", [
    `<p class="tiny">${esc(s.eyebrow)}</p><h1 class="pixel">${esc(s.deck)}</h1>`,
    `<p>${esc(s.introduction)}</p>`,
    `<table class="data"><tbody><tr><th>role</th><td>${esc(s.role)}</td></tr><tr><th>stack</th><td>${esc(s.stack)}</td></tr><tr><th>scope</th><td>${esc(s.scope)}</td></tr></tbody></table>`,
    h2(s.contextTitle) + `<p>${esc(s.context)}</p><p class="tiny">${esc(s.contextNote)}</p>`,
    s.sections.map((sec) => h2(sec.title) + `<figure class="shot"><img src="${esc(mediaData(sec.image).src)}" alt="${esc(sec.alt)}" loading="lazy"><figcaption>${esc(sec.alt)}</figcaption></figure><p>${esc(sec.text)}</p><p class="tiny">${esc(sec.decision)}</p>`).join(""),
    h2(s.systemTitle) + `<p>${esc(s.system)}</p>`,
    h2(s.mobileTitle) + `<p>${esc(s.mobile)}</p>`,
    h2(s.validationTitle) + `<ul class="pix">${s.checklist.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>`,
    h2(s.deliverablesTitle) + `<p>${esc(s.deliverables)}</p>` + mediaShot(deliverableKeys.map((key, i) => ({ key, title: s.mediaTitles[i] })), h),
    `<figure class="shot"><video class="native" controls playsinline preload="none" poster="/${esc(iprofVideo.poster)}" width="${iprofVideo.width}" height="${iprofVideo.height}"><source src="/${esc(iprofVideo.file)}" type="video/mp4"></video><figcaption>${esc(ui(l, "videoTitle"))} · ${iprofVideo.duration}s · ${iprofVideo.width}×${iprofVideo.height}</figcaption></figure>`,
    `<div class="sunken notice">${h2(s.limitsTitle)}<p>${esc(s.limits)}</p></div>`,
    h2(s.nextTitle) + `<p>${esc(s.next)}</p><p class="center"><a class="btn95 primary" href="${esc(SITE.discord)}" target="_blank" rel="noopener">${esc(s.contact)}</a> <a class="btn95" href="${esc(h.route("/development/"))}">${esc(s.explore)}</a></p>`
  ].join(""));
}

function bteBody(h) {
  const l = h.lang, k = "/buildtheearth/", c = (f) => copy(l, k, f);
  return [
    `<p>${esc(c("p1"))}</p><p>${fill(c("p2"), { strong: `<strong>${esc(c("p2Strong"))}</strong>`, bte: h.link(SITE.bte, c("p2Bte")) })}</p>`,
    `<p class="center"><img class="pixel" src="/assets/retro/star.gif" alt="" width="21" height="21"> ${h.link(MUSEUM_ARTICLE_PATH, c("museumArticleLink"))} <img class="pixel" src="/assets/retro/star.gif" alt="" width="21" height="21"></p>`,
    h2(c("s1Title")) + `<p>${esc(c("s1"))}</p><ul class="pix">${c("s1Items").map((item) => `<li>${h.link(`/projects/${item.slug}/`, item.label)} ${esc(item.after)}</li>`).join("")}</ul>`,
    h2(c("s2Title")) + cards(PROJECTS.filter((p) => p.bte), h),
    h2(c("s3Title")) + `<p>${fill(c("s3"), { builds: h.link("/builds/", c("s3Builds")), bu: h.link("/projects/builders-utilities-bt-corsica/", c("s3Bu")) })}</p><p class="center tiny">${fill(c("s3Links"), { about: h.link("/about/", c("s3LinksAbout")), guide: h.link("/guides/minecraft-mods-plugins-addons/", c("s3LinksGuide")) })}</p>`
  ].join("");
}

function devBody(h) {
  const l = h.lang, k = "/development/", c = (f) => copy(l, k, f);
  const group = (col) => PROJECTS.filter((p) => p.collection === col);
  return [
    `<p>${fill(c("intro"), { about: h.link("/about/", c("introAbout")) })}</p>`,
    `<div class="sunken webring"><a href="#interface-work">${esc(c("navInterface"))}</a> · <a href="#minecraft-releases">${esc(c("navReleases"))}</a> · <a href="#software-lab">${esc(c("navLab"))}</a></div>`,
    `<div id="interface-work"></div>` + h2(c("interfaceLabel")) + spotlight(h, true),
    `<div id="minecraft-releases"></div>` + `<p class="tiny">${esc(c("releasesEyebrow"))}</p>` + h2(c("releasesTitle")) + `<p>${esc(c("releases"))}</p>` + cards(group("release"), h) + `<p class="center tiny">${fill(c("releasesLinks"), { modrinth: h.link(SITE.modrinth, c("releasesLinksModrinth")), guide: h.link("/guides/minecraft-mods-plugins-addons/", c("releasesLinksGuide")) })}</p>`,
    `<div id="software-lab"></div>` + `<p class="tiny">${esc(c("labEyebrow"))}</p>` + h2(c("labTitle")) + `<p>${esc(c("lab"))}</p>` + cards(group("lab"), h) + `<p class="center tiny">${fill(c("labLinks"), { github: h.link(SITE.github + "?tab=repositories", c("labLinksGithub")) })}</p>`,
    h2(c("refsTitle")) + `<p>${fill(c("refs"), { bte: h.link("/buildtheearth/", c("refsBte")) })}</p>`
  ].join("");
}

function guideBody(page, h) {
  const l = h.lang, k = "/guides/minecraft-mods-plugins-addons/", c = (f) => copy(l, k, f);
  const closing = c("sections")[c("sections").length - 1];
  const chapters = c("sections").slice(0, -1);
  return [
    `<p class="byline">${fill(h.t("byline"), { author: h.link("/about/", "MaxLananas"), date: `<time datetime="${page.published}">${dateLabel(page.published, l)}</time>` })}${page.modified !== page.published ? ` · ${fill(h.t("updated"), { date: `<time datetime="${page.modified}">${dateLabel(page.modified, l)}</time>` })}` : ""}</p>`,
    `<p>${esc(c("intro"))}</p>`,
    h2(c("compareTitle")) + `<table class="data"><caption>${esc(c("tableCaption"))}</caption><thead><tr><th>${esc(c("thProject"))}</th><th>${esc(c("thRuns"))}</th><th>${esc(c("thBoundary"))}</th></tr></thead><tbody>${c("rows").map((row) => `<tr><th>${h.link(`/projects/${row.slug}/`, row.label)}</th><td>${esc(row.runs)}</td><td>${esc(row.boundary)}</td></tr>`).join("")}</tbody></table>`,
    chapters.map((s) => h2(s.title) + s.body.map((text) => `<p>${fill(esc(text), { code: "<code>/homes</code>" })}</p>`).join("")).join(""),
    h2(closing.title) + `<ol class="pix">${closing.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol><p>${fill(closing.closing, { dev: h.link("/development/", closing.closingDev) })}</p>`
  ].join("");
}

function museumBody(page, h) {
  const l = h.lang, article = MUSEUM_ARTICLE[l], image = MUSEUM_ARTICLE.image;
  const sourceLinks = `<p class="tiny">${h.link("https://museum.toulouse-metropole.fr/le-museum-de-toulouse-construit-sur-minecraft/", article.sourceLabel, 'target="_blank" rel="noopener noreferrer"')} · ${h.link("https://www.btefrance.fr/fr/", article.bteLabel, 'target="_blank" rel="noopener noreferrer"')} · ${h.link("/about/#image-rights", article.rightsLabel)}</p>`;
  return [
    `<p class="byline">${fill(h.t("byline"), { author: h.link("/about/", "MaxLananas"), date: `<time datetime="${page.published}">${dateLabel(page.published, l)}</time>` })}</p>`,
    article.sections.map((section, i) => h2(section.title) + (i === 1 ? `<figure class="shot"><img src="${esc(image.src)}" alt="${esc(image.title[l])}" loading="lazy"><figcaption>${esc(image.caption[l])}</figcaption></figure>` : "") + section.paragraphs.map((p) => `<p>${esc(p)}</p>`).join("") + (i === 2 ? sourceLinks : "")).join("")
  ].join("");
}

function galleryBody(page, h) {
  const l = h.lang, k = "/builds/", c = (f) => copy(l, k, f);
  const first = (page.galleryPage - 1) * PAGE_SIZE;
  const items = FILES.slice(first, first + PAGE_SIZE);
  const total = Math.ceil(FILES.length / PAGE_SIZE);
  const pager = `<div class="pager">${page.galleryPage > 1 ? h.link(galleryPath(page.galleryPage - 1), "« prev") : ""}${Array.from({ length: total }, (_, i) => i + 1).map((n) => n === page.galleryPage ? `<span aria-current="page">${n}</span>` : h.link(galleryPath(n), String(n))).join("")}${page.galleryPage < total ? h.link(galleryPath(page.galleryPage + 1), "next »") : ""}</div>`;
  return [
    `<p>${esc(fill(c("intro1"), { first: first + 1, last: first + items.length, total: FILES.length }))}</p>`,
    `<p class="tiny">${fill(c("intro2"), { gallery: h.link("/#work", c("intro2Gallery")), lemans: h.link("/projects/le-mans/", c("intro2Lemans")), bte: h.link("/buildtheearth/", c("intro2Bte")) })}</p>`,
    pager, photoTable(items, h), pager,
    `<div class="sunken notice">${h2(c("creditsTitle"))}<p>${esc(c("credits1"))}</p><p class="tiny">${fill(c("credits2"), { about: h.link("/about/", c("credits2About")) })}</p></div>`
  ].join("");
}

function searchBody(page, h) {
  const l = h.lang, k = "/search/";
  const index = [
    ...PROJECTS.map((p) => ({ href: projectPath(p.slug), text: `${p.name} ${p.summaryFor(l)}` })),
    ...FILES.map((f, i) => ({ href: galleryPath(Math.floor(i / PAGE_SIZE) + 1), text: label(l, f, i) }))
  ];
  return [
    `<p>${fill(copy(l, k, "intro"), { projects: h.link("/projects/", copy(l, k, "introProjects")), builds: h.link("/builds/", copy(l, k, "introBuilds")) })}</p>`,
    `<form role="search"><input type="search" id="q" placeholder="${esc(h.tr("searchPlaceholder"))}" style="width:70%;"> <button class="btn95" type="submit">${esc(h.tr("searchBtn"))}</button></form>`,
    `<p id="searchHits"></p>`,
    `<ul class="sres" id="search-results">${index.map((item) => `<li data-text="${esc(item.text.toLowerCase())}">${h.link(item.href, item.text.split(" ").slice(0, 14).join(" "))}</li>`).join("")}</ul>`
  ].join("");
}

function journalBody(h) {
  return win(h.tr("journalWin"), `<ul class="upd">${JOURNAL.map((e) => `<li><b>[${e.d} · ${e.h}]</b>${esc(e[h.lang])} ${e.link ? h.link(e.link, "→") : ""}</li>`).join("")}</ul><p class="tiny center">${esc(h.tr("journalNote"))}</p>`);
}

function linksBody(h) {
  const official = [
    ["github", SITE.github, "source code, labs and half-finished things"],
    ["modrinth", SITE.modrinth, "published minecraft mods & plugins"],
    ["instagram", SITE.instagram, "build photos, vertical format, very 2020s"],
    ["discord", SITE.discord, "commissions, help, random block talk"],
    ["buildtheearth", SITE.bte, "the 1:1 earth project"],
    ["bte france", "https://www.btefrance.fr/", "my french build crew"]
  ];
  const fun = [
    ["neocities", "https://neocities.org/", "where personal homepages went to live forever"],
    ["the old net", "https://theoldnet.com/", "browse the geocities era like it's still up"],
    ["webamp", "https://webamp.org/", "winamp in your browser. yes, really"],
    ["muséum de toulouse", "https://museum.toulouse-metropole.fr/le-museum-de-toulouse-construit-sur-minecraft/", "they wrote about our pont neuf build!!"]
  ];
  const retro = [
    ["minecraft builders webring", "/links/", "member site #47 (this site)"],
    ["photo archive release", "https://github.com/MaxLananas/Asset-Portfolio/releases/tag/images-v1", "the original 101 screenshots, untouched"]
  ];
  const rows = (list) => `<table class="links">${list.map(([name, href, desc]) => `<tr><td class="w"><b>${esc(name)}</b></td><td>${h.link(href, href.replace(/^https?:\/\//, "").slice(0, 44), href.startsWith("http") ? 'target="_blank" rel="noopener"' : "")}<br><span class="tiny">${esc(desc)}</span></td></tr>`).join("")}</table>`;
  return win(h.tr("linksWin"), `<p>${esc(h.tr("linksIntro"))}</p>` + h2(h.tr("linksOfficial")) + rows(official) + h2(h.tr("linksFun")) + rows(fun) + h2(h.tr("linksRetro")) + rows(retro));
}

function sitemapBody(h, pages) {
  const l = h.lang;
  const main = ["/", "/about/", "/projects/", "/buildtheearth/", "/development/", "/guides/minecraft-mods-plugins-addons/", MUSEUM_ARTICLE_PATH, "/builds/"];
  const extras = ["/journal/", "/links/", "/search/", "/sitemap/"];
  const li = (path) => `<li>${h.link(path, path === "/" ? "home sweet home" : path)}</li>`;
  return win(h.tr("mapWin"), `<p>${esc(h.tr("mapIntro"))}</p>` +
    h2(h.tr("mapMain")) + `<ul class="map">${main.map(li).join("")}</ul>` +
    h2(h.tr("mapProjects")) + `<ul class="map">${PROJECTS.map((p) => li(projectPath(p.slug))).join("")}</ul>` +
    h2(h.tr("mapBuilds")) + `<ul class="map">${Array.from({ length: Math.ceil(FILES.length / PAGE_SIZE) }, (_, i) => li(galleryPath(i + 1))).join("")}</ul>` +
    h2(h.tr("mapExtra")) + `<ul class="map">${extras.map(li).join("")}</ul>` +
    `<p class="tiny">${pages.filter((p) => p.lang === l).length} pages exist in ${l.toUpperCase()} · languages: ${LANGS.map((x) => h.link(pathFor(x, "/"), x)).join(" · ")}</p>`);
}

/* ------------------------------------------------------------------ shell -- */
function head(page, extra = "") {
  const alternates = (page.alternates || []).map((a) => `<link rel="alternate" hreflang="${a.lang}" href="${canonical(a.path)}">`).join("");
  return `<!DOCTYPE html>
<html lang="${page.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=880">
<title>${esc(page.title)}</title>
<meta name="description" content="${esc(page.description)}">
<meta name="generator" content="Microsoft FrontPage 4.0">
<meta name="author" content="MaxLananas">
<link rel="canonical" href="${canonical(page.path)}">
${alternates}<link rel="alternate" hreflang="x-default" href="${canonical((page.alternates || []).find((a) => a.lang === "en")?.path || page.path)}">
<link rel="icon" href="/favicon.ico">
<link rel="stylesheet" href="/retro.css">
${page.noindex ? '<meta name="robots" content="noindex, follow">' : ""}
<script src="/retro.js" defer></script>
${extra}</head>`;
}

function shell(page, body, h) {
  const langLinks = (page.alternates || []).map((a) => `<a href="${esc(a.path)}">${a.lang === "en" ? "english" : a.lang === "fr" ? "français" : "español"}</a>`).join(" · ");
  return `${head(page)}
<body>
<table class="frame" cellspacing="7" cellpadding="0">
<tr><td colspan="3" class="col-banner">
  <div class="banner"><div class="banner-logo">MaxLananas</div><div class="banner-note">${esc(h.tr("bannerNote"))}</div></div>
  <div class="marq"><marquee scrollamount="3">${esc(h.tr("marquee"))}</marquee></div>
</td></tr>
<tr>
  <td class="col-left">${leftRail(h, page.enPath || page.path)}</td>
  <td class="col-main">${body}</td>
  <td class="col-right">${rightRail(h)}</td>
</tr>
<tr><td colspan="3" class="col-foot">
  <img class="hr pixel" src="/assets/retro/rainbow-hr.gif" alt="" width="432" height="8">
  <div>${h.link("/", h.tr("navHome"))} · ${h.link("/about/", h.tr("navAbout"))} · ${h.link("/builds/", h.tr("navBuilds"))} · ${h.link("/projects/", h.tr("navProjects"))} · ${h.link("/journal/", h.tr("navJournal"))} · ${h.link("/sitemap/", h.tr("navSitemap"))}</div>
  <div class="tiny" style="margin:4px 0;">${langLinks}</div>
  <div class="foot-badges"><span class="b88 grey">${esc(h.tr("footBest"))}</span><span class="b88 navy">made with notepad</span><span class="b88 black">no cookies</span></div>
  <div class="tiny">${esc(h.tr("footCopy"))}<br>${esc(h.tr("footMade"))}<br>${esc(h.tr("footView"))} <span id="odo-mini-foot"></span> · ${esc(h.tr("lastUpdated"))} 10/2026</div>
</td></tr>
</table>
</body>
</html>`;
}

/* ------------------------------------------------------------------- run -- */
const pageFile = (path) => path === "/" ? "index.html" : path.replace(/^\//, "") + "index.html";

function bodyFor(page, h, allPages) {
  const en = page.enPath || page.path.replace(/^\/(fr|es)(?=\/)/, "");
  if (en === "/journal/") return journalBody(h);
  if (en === "/links/") return linksBody(h);
  if (en === "/sitemap/") return sitemapBody(h, allPages);
  if (page.home && !page.noindex) return homeBody(page, h);
  if (page.noindex) return searchBody(page, h);
  if (page.caseStudy) return caseStudyBody(page, h);
  if (page.project) return projectBody(page, h);
  if (page.type === "ProfilePage") return aboutBody(page, h);
  if (en === "/projects/") return projectsHubBody(h);
  if (en === "/buildtheearth/") return bteBody(h);
  if (en === "/development/") return devBody(h);
  if (page.editorialArticle) return museumBody(page, h);
  if (page.type === "Article") return guideBody(page, h);
  if (page.galleryPage) return galleryBody(page, h);
  throw new Error("no retro renderer for " + page.path);
}

const all = sitePages();
const extras = [];
for (const lang of LANGS) {
  for (const path of ["/journal/", "/links/", "/sitemap/"]) {
    extras.push({
      lang, path: pathFor(lang, path), enPath: path, type: "WebPage",
      title: `${TR[lang][{ "/journal/": "journalWin", "/links/": "linksWin", "/sitemap/": "mapWin" }[path]].replace(/\.exe|\.txt|\.html/, "")} | MaxLananas`,
      description: TR[lang][{ "/journal/": "journalWin", "/links/": "linksIntro", "/sitemap/": "mapIntro" }[path]].slice(0, 155),
      heading: TR[lang][{ "/journal/": "journalTitle", "/links/": "linksWin", "/sitemap/": "mapWin" }[path]],
      alternates: LANGS.map((l) => ({ lang: l, path: pathFor(l, path) })),
      published: "2026-10-25", modified: "2026-10-25", reviewed: "2026-10-25"
    });
  }
}
const pages = [...all, ...extras];
let written = 0;
for (const page of pages) {
  const h = helpersFor(page.lang);
  const html = shell(page, bodyFor(page, h, pages), h);
  const file = resolve(root, pageFile(page.path));
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, html);
  written += 1;
}

/* 404 — single file at the root, like the old days */
const notFound = { lang: "en", path: "/404.html", title: copy("en", "notFound", "title"), description: copy("en", "notFound", "description"), alternates: [], noindex: true };
const h404 = helpersFor("en");
await writeFile(resolve(root, "404.html"), shell(notFound, win("404 — file not found", `<p class="center"><img class="pixel" src="/assets/retro/construction.gif" alt="" width="88" height="31"></p><h1 class="pixel">${esc(copy("en", "notFound", "heading"))}</h1><p>${esc(copy("en", "notFound", "body"))}</p><p class="center">${h404.link("/", copy("en", "notFound", "home"), 'class="btn95"')} ${h404.link("/projects/", copy("en", "notFound", "projects"), 'class="btn95"')} ${h404.link("/builds/", copy("en", "notFound", "gallery"), 'class="btn95"')}</p>`), h404));

console.log(`retro render: ${written + 1} pages written`);
