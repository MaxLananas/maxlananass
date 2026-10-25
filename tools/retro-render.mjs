/* ==========================================================================
   retro-render.mjs — rebuilds the whole site as a 1999-era personal homepage.
   Same content sources as before (content/*.js, gallery-data.js), new skin:
   bevels, tiled backgrounds, pixel fonts, guestbook, hit counter, MAXAMP.
   Run: npm run retro:render
   ========================================================================== */
import { writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import sharp from "sharp";
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
import { MOBILISATION_ARTICLE, MOBILISATION_ARTICLE_PATH } from "../content/mobilisation-article.js";
import { META } from "../content/projects-i18n.js";
import { IPROF_STUDY } from "../content/iprof-case-study.js";
import { dateLabel } from "../content/dates.js";
import { schemaFor } from "./seo-render.mjs";
import { helpers as seoHelpers } from "./seo-content.mjs";

const root = resolve(import.meta.dirname, "..");
const outRoot = process.env.RETRO_OUT ? resolve(process.env.RETRO_OUT) : root;
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
    curBuildingV: "centre pompidou, paris (BTE France)", curPlayingV: "minecraft 26.2, obviously", curListeningV: "indochine & théa, on repeat", curMoodV: "in full incomprehension of french politics",
    shoutbox: "shoutbox", shoutSend: "ok", shoutPlaceholder: "say hi…", signGb: "sign my guestbook!",
    welcomeWin: "welcome.txt — notepad", notice: "heads up!!",
    noticeBody: "warning!! side effects of this site include: sparkles under your cursor, chiptunes in your ears and a sudden urge to place blocks. <b>101 minecraft screenshots</b> inside, zero cookies, zero trackers, zero refunds. welcome home, traveller.",
    journalTitle: "journal", featuredTitle: "featured projects", galleryTitle: "latest builds", viewGallery: "open the full gallery",
    contactTitle: "commissions & contact", processTitle: "how a build happens", faqTitle: "questions people ask",
    powered: "powered by", webring: "« prev · minecraft builders webring · next »", webringNote: "member site #47 · join the ring",
    footCopy: "© 1997–2026 MaxLananas", footMade: "hand-coded in notepad at 2am · every commit is a genuine regret",
    footBest: "best viewed at 800×600", footView: "you are visitor",
    statsTitle: "site statistics", statsBuilds: "builds photographed", statsProjects: "projects documented", statsReleases: "mods & tools published", statsLangs: "languages spoken here", statsUptime: "uptime since 1999",
    gbTitle: "guestbook.exe", gbIntro: "please be nice!! guestbook entries are stored in your own browser (this is a static site, we have no server money). sign it, refresh, it stays. magic.",
    gbName: "name", gbUrl: "your site", gbMsg: "message", gbMood: "mood", gbSend: "sign it!", gbThanks: "thanks for signing!! ♥", gbErr: "write something first!!", gbCount: "entries so far", gbNoscript: "the guestbook needs javascript — leave a shout on discord instead!",
    journalWin: "journal.txt", linksWin: "links.html", linksIntro: "everywhere i exist online. seven doors, all official, no webrings: pick one and knock.",
    linksOfficial: "official profiles", linksFun: "cool sites & inspiration", linksRetro: "retro web resources",
    mapWin: "sitemap.txt", mapIntro: "every page of this site, listed like it's 1999 and xml sitemaps don't exist yet.",
    mapMain: "main pages", mapProjects: "project files", mapBuilds: "build gallery", mapExtra: "the fun wing",
    searchTitle: "search the site", searchBtn: "find!", searchPlaceholder: "type a block, a build, a mod…",
    newFlag: "new!", download: "download", source: "source code",
    mediaTitle: "media center", mediaLink: "about this video", aboutWin: "aboutme.txt — notepad",
    edKicker: "minecraft builder & developer — guadeloupe, fr — online since forever", heroTitle: "I BUILD WHOLE WORLDS, THEN BREAK THEM OPEN TO SEE INSIDE", heroStand: "MaxLananas: Minecraft builds for BuildTheEarth, Fabric mods, interfaces — and a website that refuses to behave. Scroll, click, listen.", readMore: "READ MORE", edArtTitle: "Guadeloupe, October 2026: the mobilization I coded", edArtStand: "950 students, 600 signatures, the rectorat, the press: the whole story, with dates and links.", term1: "loading seriousness... failed. retry... failed. keeping the chaos.", term2: "this site runs on CC0 chiptunes and torn paper. no cookie was ever baked.", term3: "if the eyes follow you, that is normal. they are paid in minecraft blocks.", term4: "ctrl+shift+r if you still see the old site. yes, it actually works.", termSign: "written between two classes", navMobilisation: "the mobilization article", journalArticleLink: "read the full article: Guadeloupe, October 2026", radioHowto: "how it works: 1) press the big green ▶ button. 2) music plays. that's it. real royalty-free tracks (CC0), no account, no cookies.", radioPick: "or pick a track yourself:", playLabel: "PLAY", pauseLabel: "pause", stopLabel: "stop", volLabel: "volume", radioReady: "READY — press ▶ PLAY", radioOn: "ON AIR", radioPaused: "paused — press ▶ to resume", radioLocked: "audio locked by the browser — click anywhere once", eyesTitle: "on watch", eyesNote: "this site looks back at you, fondly", wheelHint: "click the colour wheel to remix today's palette", blockTitle: "block of the day", blockNote: "palette pulled from my colour obsessions — mixed with", wipTitle: "construction site", wipPct: "overall progress: 69% nice", wip1: "corsica coastline (BTE France) — 68%, waiting on WorldEdit to stop crying", wip2: "jukeboxplus disco UI — 41%, the vinyl texture needs more pixels", wip3: "this website — 99%, forever", journalNote: "this journal is transcribed from real git commits. the embarrassment is authentic.", radioNote: "music: Royalty Free Music Pack by effacestudios — CC0 (public domain). why not the minecraft ost? c418 & lena raine own those notes; we don't steal other people's chords. no lawyer was summoned.",
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
    curBuildingV: "centre pompidou, paris (BTE France)", curPlayingV: "minecraft 26.2, évidemment", curListeningV: "indochine & théa, en boucle", curMoodV: "en pleine incompréhension de la politique française",
    shoutbox: "shoutbox", shoutSend: "ok", shoutPlaceholder: "dis bonjour…", signGb: "signe mon livre d'or !",
    welcomeWin: "bienvenue.txt — bloc-notes", notice: "attention !!",
    noticeBody: "attention !! effets secondaires de ce site : étincelles sous le curseur, chiptunes dans les oreilles et envie soudaine de poser des blocs. <b>101 captures minecraft</b> à l'intérieur, zéro cookie, zéro tracker, zéro remboursement. bienvenue chez toi, voyageur.",
    journalTitle: "journal", featuredTitle: "projets à la une", galleryTitle: "builds récents", viewGallery: "ouvrir la galerie complète",
    contactTitle: "commandes & contact", processTitle: "comment naît un build", faqTitle: "questions fréquentes",
    powered: "propulsé par", webring: "« préc · webring des builders minecraft · suiv »", webringNote: "site membre n°47 · rejoindre",
    footCopy: "© 1997–2026 MaxLananas", footMade: "codé à la main dans le bloc-notes à 2h du mat · chaque commit est un regret authentique",
    footBest: "affiché au mieux en 800×600", footView: "vous êtes le visiteur",
    statsTitle: "statistiques du site", statsBuilds: "builds photographiés", statsProjects: "projets documentés", statsReleases: "mods & outils publiés", statsLangs: "langues parlées ici", statsUptime: "en ligne depuis 1999",
    gbTitle: "livredor.exe", gbIntro: "soyez gentils !! les messages sont gardés dans votre propre navigateur (site statique, pas de sous pour un serveur). signez, rafraîchissez, ça reste. magie.",
    gbName: "pseudo", gbUrl: "ton site", gbMsg: "message", gbMood: "humeur", gbSend: "signer !", gbThanks: "merci pour ta signature !! ♥", gbErr: "écris quelque chose d'abord !!", gbCount: "messages pour l'instant", gbNoscript: "le livre d'or a besoin de javascript — laisse un message sur discord !",
    journalWin: "journal.txt", linksWin: "liens.html", linksIntro: "partout où j'existe en ligne. sept portes, toutes officielles, aucun webring : choisis-en une et frappe.",
    linksOfficial: "profils officiels", linksFun: "sites cool & inspiration", linksRetro: "ressources web rétro",
    mapWin: "plan.txt", mapIntro: "toutes les pages du site, listées comme en 1999, avant les sitemaps xml.",
    mapMain: "pages principales", mapProjects: "fiches projets", mapBuilds: "galerie de builds", mapExtra: "l'aile fun",
    searchTitle: "chercher sur le site", searchBtn: "trouver !", searchPlaceholder: "un bloc, un build, un mod…",
    newFlag: "nouveau !", download: "télécharger", source: "code source",
    mediaTitle: "centre média", mediaLink: "à propos de cette vidéo", aboutWin: "apropos.txt — bloc-notes",
    edKicker: "minecraft builder & developer — guadeloupe, fr — en ligne depuis toujours", heroTitle: "JE CONSTRUIS DES MONDES ENTIERS, PUIS JE LES CASSE POUR VOIR DEDANS", heroStand: "MaxLananas : builds Minecraft pour BuildTheEarth, mods Fabric, interfaces — et un site qui refuse d'être sage. Scrolle, clique, écoute.", readMore: "LIRE LA SUITE", edArtTitle: "Guadeloupe, octobre 2026 : la mobilisation que j'ai codée", edArtStand: "950 élèves, 600 signatures, le rectorat, la presse : toute l'histoire, avec dates et liens.", term1: "chargement du sérieux... échec. nouvelle tentative... échec. on garde le bordel.", term2: "ce site tourne au chiptune CC0 et au papier déchiré. aucune cookie n'a été cuite.", term3: "si les yeux te suivent, c'est normal. ils sont payés en blocs minecraft.", term4: "ctrl+shift+r si tu vois encore l'ancien site. oui, ça marche vraiment.", termSign: "écrit entre deux cours", navMobilisation: "l'article mobilisation", journalArticleLink: "lire l'article complet : Guadeloupe, octobre 2026", radioHowto: "comment ça marche : 1) appuie sur le gros bouton vert ▶. 2) la musique joue. c'est tout. vraies musiques libres (CC0), sans compte ni cookies.", radioPick: "ou choisis un morceau toi-même :", playLabel: "ÉCOUTER", pauseLabel: "pause", stopLabel: "stop", volLabel: "volume", radioReady: "PRÊT — appuie sur ▶ ÉCOUTER", radioOn: "EN DIRECT", radioPaused: "en pause — appuie sur ▶ pour reprendre", radioLocked: "audio verrouillé par le navigateur — clique une fois n'importe où", eyesTitle: "je veille", eyesNote: "ce site te regarde aussi, avec tendresse", wheelHint: "clique sur la roue des couleurs pour remixer la palette du jour", blockTitle: "bloc du jour", blockNote: "palette tirée de mes obsessions de couleurs — mixée avec", wipTitle: "chantier en cours", wipPct: "progression globale : 69 % nice", wip1: "côtes corses (BTE France) — 68 %, on attend que WorldEdit arrête de pleurer", wip2: "jukeboxplus UI disco — 41 %, la texture vinyle réclame plus de pixels", wip3: "ce site — 99 %, pour toujours", journalNote: "ce journal est transcrit depuis de vrais commits git. la gêne est authentique.", radioNote: "musique : Royalty Free Music Pack d'effacestudios — CC0 (domaine public). pourquoi pas l'ost minecraft ? c418 & lena raine possèdent ces notes ; on ne vole pas les accords des autres. aucun avocat convoqué.",
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
    curBuildingV: "centre pompidou, parís (BTE France)", curPlayingV: "minecraft 26.2, obvio", curListeningV: "indochine & théa, en bucle", curMoodV: "en plena incomprensión de la política francesa",
    shoutbox: "shoutbox", shoutSend: "ok", shoutPlaceholder: "saluda…", signGb: "¡firma mi libro de visitas!",
    welcomeWin: "bienvenida.txt — bloc de notas", notice: "¡aviso!",
    noticeBody: "¡¡aviso!! efectos secundarios de este sitio: chispas bajo el cursor, chiptunes en los orejas y ganas repentinas de colocar bloques. <b>101 capturas de minecraft</b> dentro, cero cookies, cero rastreadores, cero reembolsos. bienvenido a casa, viajero.",
    journalTitle: "diario", featuredTitle: "proyectos destacados", galleryTitle: "builds recientes", viewGallery: "abrir la galería completa",
    contactTitle: "encargos y contacto", processTitle: "cómo nace un build", faqTitle: "preguntas frecuentes",
    powered: "funciona con", webring: "« ant · webring de builders minecraft · sig »", webringNote: "sitio miembro #47 · únete",
    footCopy: "© 1997–2026 MaxLananas", footMade: "escrito a mano en el bloc de notas a las 2am · cada commit es un arrepentimiento auténtico",
    footBest: "mejor visto a 800×600", footView: "eres el visitante",
    statsTitle: "estadísticas del sitio", statsBuilds: "builds fotografiados", statsProjects: "proyectos documentados", statsReleases: "mods y herramientas publicadas", statsLangs: "idiomas aquí", statsUptime: "en línea desde 1999",
    gbTitle: "libro.exe", gbIntro: "¡sed majos! los mensajes se guardan en vuestro propio navegador (sitio estático, no hay dinero para servidores). firma, refresca, se queda. magia.",
    gbName: "nombre", gbUrl: "tu sitio", gbMsg: "mensaje", gbMood: "humor", gbSend: "¡firmar!", gbThanks: "¡gracias por firmar!! ♥", gbErr: "¡escribe algo primero!", gbCount: "entradas hasta ahora", gbNoscript: "el libro necesita javascript — ¡deja un saludo en discord!",
    journalWin: "diario.txt", linksWin: "enlaces.html", linksIntro: "todas partes donde existo en línea. siete puertas, todas oficiales, sin webrings: elige una y llama.",
    linksOfficial: "perfiles oficiales", linksFun: "sitios guays e inspiración", linksRetro: "recursos web retro",
    mapWin: "mapa.txt", mapIntro: "todas las páginas del sitio, listadas como en 1999, antes de los sitemaps xml.",
    mapMain: "páginas principales", mapProjects: "fichas de proyectos", mapBuilds: "galería de builds", mapExtra: "el ala fun",
    searchTitle: "buscar en el sitio", searchBtn: "¡buscar!", searchPlaceholder: "un bloque, un build, un mod…",
    newFlag: "¡nuevo!", download: "descargar", source: "código fuente",
    mediaTitle: "centro de medios", mediaLink: "sobre este vídeo", aboutWin: "sobremi.txt — bloc de notas",
    edKicker: "minecraft builder & developer — guadalupe, fr — en línea desde siempre", heroTitle: "CONSTRUYO MUNDOS ENTEROS Y LUEGO LOS ABRO PARA VER DENTRO", heroStand: "MaxLananas: builds de Minecraft para BuildTheEarth, mods Fabric, interfaces — y un sitio que se niega a portarse bien. Desliza, clickea, escucha.", readMore: "LEER MÁS", edArtTitle: "Guadalupe, octubre 2026: la movilización que codifiqué", edArtStand: "950 estudiantes, 600 firmas, el rectorado, la prensa: toda la historia, con fechas y enlaces.", term1: "cargando seriedad... falló. reintentando... falló. nos quedamos con el caos.", term2: "este sitio funciona con chiptunes CC0 y papel rasgado. ninguna cookie fue horneada.", term3: "si los ojos te siguen, es normal. cobran en bloques de minecraft.", term4: "ctrl+shift+r si aún ves el sitio viejo. sí, funciona de verdad.", termSign: "escrito entre dos clases", navMobilisation: "el artículo movilización", journalArticleLink: "lee el artículo completo: Guadalupe, octubre 2026", radioHowto: "cómo funciona: 1) pulsa el gran botón verde ▶. 2) suena la música. ya. pistas reales libres (CC0), sin cuenta ni cookies.", radioPick: "o elige una pista tú:", playLabel: "ESCUCHAR", pauseLabel: "pausa", stopLabel: "stop", volLabel: "volumen", radioReady: "LISTO — pulsa ▶ ESCUCHAR", radioOn: "AL AIRE", radioPaused: "en pausa — pulsa ▶ para seguir", radioLocked: "audio bloqueado por el navegador — haz clic una vez en cualquier parte", eyesTitle: "vigilando", eyesNote: "este sitio también te mira, con cariño", wheelHint: "haz clic en la rueda de colores para remezclar la paleta del día", blockTitle: "bloque del día", blockNote: "paleta sacada de mis obsesiones de color — mezclada con", wipTitle: "obra en curso", wipPct: "progreso total: 69 % nice", wip1: "costa corsa (BTE France) — 68 %, esperando que WorldEdit deje de llorar", wip2: "jukeboxplus UI disco — 41 %, la textura de vinilo pide más píxeles", wip3: "esta web — 99 %, para siempre", journalNote: "este diario se transcribe desde commits git reales. la vergüenza es auténtica.", radioNote: "música: Royalty Free Music Pack de effacestudios — CC0 (dominio público). ¿por qué no el ost de minecraft? c418 y lena raine son dueños de esas notas; no robamos acordes ajenos. ningún abogado convocado.",
    lastUpdated: "página regada el"
  }
};

/* ------------------------------------------------------------- journal -- */
const JOURNAL = [
  { d: "2026-10-05", h: "petition", link: "https://greve-petition.pages.dev/", en: "organized a mobilization of 950 students in my lyceum in Guadeloupe: petition site online (600 signatures!), representatives received by the rector and the Region president Ary Chalus, then articles in Guadeloupe 1ère, Canal 10 and Libération. the most enriching thing i ever built — and i have built bridges in minecraft.", fr: "organisé une mobilisation de 950 élèves dans mon lycée en Guadeloupe : site de pétition en ligne (600 signatures !), des représentants reçus par le recteur et le président de Région Ary Chalus, puis des articles dans Guadeloupe 1ère, Canal 10 et Libération. la chose la plus enrichissante que j'aie construite — et j'ai construit des ponts dans minecraft.", es: "organicé una movilización de 950 estudiantes en mi liceo en Guadalupe: sitio de petición en línea (¡600 firmas!), representantes recibidos por el rector y el presidente regional Ary Chalus, y artículos en Guadeloupe 1ère, Canal 10 y Libération. lo más enriquecedor que he construido — y he construido puentes en minecraft." },
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
  const shot = `/assets/projects/${p.slug}-shot.webp`;
  if (p.art && existsSync(resolve(root, "." + p.art))) {
    visual = `<img class="pixel" src="${esc(p.art)}" alt="${esc(ui(l, "cardAlt", { name: p.name }))}" loading="lazy" style="width:84px;height:auto;">`;
  } else if (p.cover || p.icon) {
    const data = mediaData(p.cover || p.icon);
    visual = `<img src="${esc(data.src)}" alt="${esc(ui(l, "cardAlt", { name: p.name }))}" loading="lazy" style="width:84px;height:auto;">`;
  } else if (existsSync(resolve(root, "." + shot))) {
    visual = `<img src="${esc(shot)}" alt="${esc(ui(l, "cardAlt", { name: p.name }))}" loading="lazy" style="width:84px;height:auto;">`;
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
    panel(h.tr("eyesTitle"), `<div class="eyes-row"><span class="eye"><i class="pupil" id="pupil-l"></i></span><span class="eye"><i class="pupil" id="pupil-r"></i></span></div><div class="tiny center">${esc(h.tr("eyesNote"))}</div>`),
    panel(h.tr("main"), [nav("/", "navHome"), nav("/about/", "navAbout"), nav("/builds/", "navBuilds"), nav("/projects/", "navProjects"), nav("/journal/", "navJournal"), nav("/sitemap/", "navSitemap")].join("")),
    panel(h.tr("fun"), [nav("/development/", "funDev"), nav("/projects/nostalgia-ultra/", "funShaders"), nav("/projects/jukeboxplus/", "funJukebox"), nav("/projects/colorflow/", "funColorflow")].join("")),
    panel(h.tr("shrines"), `<div class="blinkie-row"><img class="pixel" src="/assets/retro/star.gif" alt="" width="21" height="21"><br>${h.link("/buildtheearth/", h.tr("shrineBte"))}<br><img class="pixel" src="/assets/retro/heart.gif" alt="" width="17" height="15"><br>${h.link("/projects/le-mans/", h.tr("shrineLemans"))}<br>${h.link(MUSEUM_ARTICLE_PATH, h.tr("shrineMuseum"))}</div>`),
    panel(h.tr("other"), [nav("/links/", "navLinks"), nav("/search/", "navSearch"), nav(MOBILISATION_ARTICLE_PATH, "navMobilisation"), `<a class="navbtn" href="${esc(SITE.discord)}" target="_blank" rel="noopener">discord</a>`].join(""))
  ].join("");
}

function radioPanel(h) {
  return `<div class="winamp" id="winamp" data-ready="${esc(h.tr("radioReady"))}" data-on="${esc(h.tr("radioOn"))}" data-paused="${esc(h.tr("radioPaused"))}" data-locked="${esc(h.tr("radioLocked"))}"><div class="wa-tbar"><span>${esc(h.tr("nowPlaying"))}</span><span class="wb"><span>_</span><span>□</span><span>×</span></span></div><div class="wa-body"><p class="wa-howto">${esc(h.tr("radioHowto"))}</p><div class="wa-lcd"><marquee scrollamount="2"><span id="wa-track">--:--</span></marquee></div><div class="wa-statusline"><span class="wa-led"></span><span id="wa-status"></span></div><div class="wa-row"><div class="wa-eq"><i></i><i></i><i></i><i></i><i></i></div><div class="wa-time" id="wa-time">00:00:00</div></div><div class="wa-btns"><button class="wa-btn wa-big" id="wa-play" type="button">▶ ${esc(h.tr("playLabel"))}</button><button class="wa-btn" id="wa-pause" type="button">❚❚ ${esc(h.tr("pauseLabel"))}</button><button class="wa-btn" id="wa-stop" type="button">■ ${esc(h.tr("stopLabel"))}</button></div><div class="wa-vol"><label for="wa-vol">${esc(h.tr("volLabel"))}</label><input type="range" id="wa-vol" min="0" max="100" value="70"></div><p class="wa-pick">${esc(h.tr("radioPick"))}</p><ul class="wa-list" id="wa-list"></ul><p class="tiny wa-credit">${esc(h.tr("radioNote"))}</p></div></div>`;
}

function rightRail(h) {
  const journal = JOURNAL.slice(0, 5).map((e) => `<li><b>[${e.d} · ${e.h}]</b>${esc(e[h.lang])} ${e.link ? h.link(e.link, "→") : ""}</li>`).join("");
  return [
    panel(h.tr("updates"), `<ul class="upd">${journal}</ul><p class="center tiny">${h.link("/journal/", h.tr("older"))}</p>`),
    radioPanel(h),
    panel(h.tr("currently"), `<div class="cur"><b>${esc(h.tr("curBuilding"))}:</b> ${esc(h.tr("curBuildingV"))}<br><b>${esc(h.tr("curPlaying"))}:</b> ${esc(h.tr("curPlayingV"))}<br><b>${esc(h.tr("curListening"))}:</b> ${esc(h.tr("curListeningV"))}<br><b>${esc(h.tr("curMood"))}:</b> ${esc(h.tr("curMoodV"))}</div>`),
    `<div class="dark"><div class="panel-h"><span class="deco">†</span> awards <span class="deco">†</span></div><div class="rule"></div><div class="center"><span class="b88 rainbow">cool site of the day · self-awarded</span><div class="tiny" style="margin-top:5px;">this award belongs to me because i gave it to myself ★</div></div></div>`
  ].join("");
}

/* ------------------------------------------------------------------ pages -- */
const SCRIB_X = `<svg class="scrib scrib-x" viewBox="0 0 60 60" aria-hidden="true"><path d="M8 10 C 20 22, 38 40, 52 52 M50 8 C 38 22, 20 40, 8 52" fill="none" stroke="#e8160f" stroke-width="7" stroke-linecap="round"/></svg>`;
const SCRIB_LOOP = `<svg class="scrib scrib-loop" viewBox="0 0 220 90" aria-hidden="true"><path d="M6 70 C 40 10, 90 10, 96 44 C 100 70, 60 78, 58 52 C 56 28, 120 18, 214 30" fill="none" stroke="#e8160f" stroke-width="3.5" stroke-linecap="round"/></svg>`;

function homeEditorialBody(page, h) {
  const l = h.lang;
  const big = proxyUrl(FILES[24], 960);
  const strip = [5, 40, 66, 90].map((i, k) => `<img class="ed-s${k + 1}" src="${esc(proxyUrl(FILES[i], 480))}" alt="${esc(label(l, FILES[i], i))}" loading="lazy">`).join("");
  const teasers = ["colorflow", "sculk-vision", "jukeboxplus"].map((slug) => {
    const p = bySlug(slug);
    const m = mediaData(p.cover || p.icon);
    return `<a class="ed-row" href="${esc(projectPath(slug))}"><img src="${esc(m.src)}" alt="${esc(ui(l, "cardAlt", { name: p.name }))}" loading="lazy"><div><h3>${esc(p.name)}</h3><p class="ed-stand">${esc(p.summaryFor(l))}</p><span class="ed-more">${esc(h.tr("readMore"))} →</span></div></a>`;
  }).join("");
  return [
    `<div class="ed-masthead"><div class="ed-spray" aria-hidden="true">MAXLANANAS</div><div class="ed-name">MAXLANANAS</div><nav class="ed-nav">${[["/", "navHome"], ["/projects/", "navProjects"], ["/builds/", "navBuilds"], ["/journal/", "navJournal"], ["/links/", "navLinks"], ["/sitemap/", "navSitemap"]].map(([p2, k]) => h.link(p2, h.tr(k))).join("")}</nav></div>`,
    `<section class="ed-hero"><div class="ed-hero-photo"><img src="${esc(big)}" alt="${esc(label(l, FILES[24], 24))}" width="960" height="720">${SCRIB_LOOP}</div><div class="ed-hero-text"><p class="ed-kicker">${esc(h.tr("edKicker"))}</p><h1 class="ed-h1">${esc(h.tr("heroTitle"))}</h1><p class="ed-stand">${esc(h.tr("heroStand"))}</p><p class="ed-more big">${h.link("/projects/", h.tr("readMore") + " →")}</p>${SCRIB_X}</div></section>`,
    `<div class="ed-strip">${strip}</div>`,
    `<section class="ed-grid"><div class="ed-cell ed-term">${radioPanel(h)}</div><div class="ed-cell"><h2 class="ed-h2">${esc(h.tr("blockTitle"))}</h2><div class="wheel-row"><canvas id="wheel" width="110" height="110" title="${esc(h.tr("wheelHint"))}"></canvas><div id="block-day" class="swatches"></div></div><p class="tiny">${esc(h.tr("wheelHint"))} · ${esc(h.tr("blockNote"))} ${h.link("/projects/colorflow/", "Colorflow")}</p></div><div class="ed-cell ed-eyes"><h2 class="ed-h2">${esc(h.tr("eyesTitle"))}</h2><div class="eyes-row"><span class="eye"><i class="pupil" id="pupil-l"></i></span><span class="eye"><i class="pupil" id="pupil-r"></i></span></div><p class="tiny">${esc(h.tr("eyesNote"))}</p><p class="ed-more">${h.link("/links/", h.tr("navLinks") + " →")}</p></div></section>`,
    `<section class="ed-rows"><div class="ed-rowtext"><h2 class="ed-h2">${esc(h.tr("journalTitle"))}</h2><ul class="upd">${JOURNAL.slice(0, 4).map((e) => `<li><b>[${e.d}]</b>${esc(e[l])} ${e.link ? h.link(e.link, "→") : ""}</li>`).join("")}</ul><p class="ed-more">${h.link("/journal/", h.tr("readMore") + " →")}</p></div><div class="ed-rowtext ed-art"><h2 class="ed-h2">${esc(h.tr("edArtTitle"))}</h2><p class="ed-stand">${esc(h.tr("edArtStand"))}</p><p class="ed-more big">${h.link(MOBILISATION_ARTICLE_PATH, h.tr("readMore") + " →")}</p>${SCRIB_X}</div></section>`,
    `<section class="ed-rows"><div class="ed-col">${teasers}</div><div class="ed-term-aside"><p class="ta-h">ERROR 404: seriousness not found</p><p>&gt; ${esc(h.tr("term1"))}</p><p>&gt; ${esc(h.tr("term2"))}</p><p>&gt; ${esc(h.tr("term3"))}</p><p>&gt; ${esc(h.tr("term4"))}</p><p class="ta-sign">— maxamp v26.2, ${esc(h.tr("termSign"))}</p></div></section>`
  ].join("");
}


function homeBody(page, h) {
  const l = h.lang, k = "/";
  const featured = FEATURED_PROJECT_SLUGS.map(bySlug);
  const services = copy(l, k, "services");
  const process = copy(l, k, "process");
  const faq = copy(l, k, "faq");
  return [
    win(h.tr("welcomeWin"), `<div class="welcome"><div class="ava"><img class="photo" src="/assets/retro/avatar.png" alt="MaxLananas" width="112" height="112"></div><div class="txt"><h1 class="pixel">${esc(page.heading)}</h1><p class="tiny">${esc(copy(l, k, "identity"))}</p><p>${fill(copy(l, k, "intro"), { iprof: h.link("/projects/iprof-redesign/", copy(l, k, "introIprof")), bte: h.link("/buildtheearth/", copy(l, k, "introBte")), dev: h.link("/development/", copy(l, k, "introDev")), about: h.link("/about/", copy(l, k, "introAbout")) })}</p></div></div>`),
    `<div class="sunken notice"><b>${esc(h.tr("notice"))}</b> <img class="pixel" src="/assets/retro/construction.gif" alt="" width="88" height="31" style="float:right;margin-left:6px;"> ${h.tr("noticeBody")}</div>`,
    panel(h.tr("journalTitle"), JOURNAL.slice(0, 2).map((e) => `<p><b class="tiny">[${e.d}]</b> ${esc(e[l])} ${e.link ? h.link(e.link, "→") : ""}</p>`).join("") + `<p class="center">${h.link("/journal/", h.tr("older"))}</p>`),




    `<div class="center" style="margin:2px 0;"><img class="pixel" src="/assets/retro/sparkle-divider.gif" alt="" width="400" height="20"></div>`,
    panel(h.tr("blockTitle"), `<div class="wheel-row"><canvas id="wheel" width="110" height="110" title="${esc(h.tr("wheelHint"))}"></canvas><div id="block-day" class="swatches"></div></div><p class="tiny center">${esc(h.tr("wheelHint"))} · ${esc(h.tr("blockNote"))} ${h.link("/projects/colorflow/", "Colorflow")}</p>`),
    panel(h.tr("contactTitle"), `<p>${esc(copy(l, k, "contactIntro"))}</p><p class="center"><img class="pixel" src="/assets/retro/at.gif" alt="" width="15" height="15"> <a class="btn95 primary" href="${esc(SITE.discord)}" target="_blank" rel="noopener">${esc(copy(l, k, "contactCta"))}</a><br><span class="tiny">${esc(copy(l, k, "contactNote"))}</span></p><ul class="pix">${services.map((s) => `<li><b>${esc(s.title)}</b> — ${esc(s.text)}</li>`).join("")}</ul>`),
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
    `<div class="welcome"><div class="ava"><img class="photo" src="/assets/retro/avatar.png" alt="MaxLananas" width="112" height="112"></div><div class="txt"><p>${esc(c("p1"))}</p><p>${fill(c("p2"), { strong: "<strong>MaxLananas</strong>" })}</p></div></div>`,
    panel(h.tr("statsTitle"), `<table class="data"><tbody><tr><th>${esc(h.tr("statsBuilds"))}</th><td>${FILES.length}</td></tr><tr><th>${esc(h.tr("statsProjects"))}</th><td>${PROJECTS.length}</td></tr><tr><th>${esc(h.tr("statsReleases"))}</th><td>${releases}</td></tr><tr><th>${esc(h.tr("statsLangs"))}</th><td>3 (en · fr · es)</td></tr></tbody></table>`),
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

const np = (slug, collection, kind, repo, art, L, extra = {}) => ({
  slug, collection, kind, repo, art,
  name: L.en.name, category: L.en.category, language: L.en.language || "", bte: !!extra.bte,
  modrinth: extra.modrinth || null, web: extra.web || null,
  categoryFor: (l) => (L[l] || L.en).category,
  summaryFor: (l) => (L[l] || L.en).summary,
  introFor: (l) => (L[l] || L.en).intro,
  featuresFor: (l) => (L[l] || L.en).features,
  usageFor: (l) => (L[l] || L.en).usage,
  limitsFor: (l) => (L[l] || L.en).limits,
  hasFor: () => false, faqFor: () => [], requirements: "", requirementsFor: () => "",
  images: null, media: null, video: false, upstream: null, related: [],
  source: repo ? { url: repo } : null, reviewed: "2026-10-25", published: "2026-10-25", modified: "2026-10-25"
});
const NEW_PROJECTS = [
  np("greve-petition", "interface", "design", null, "/assets/retro/promo-petition.webp", {
    en: { name: "Grève Pétition 2026", category: "Petition & mobilization website", summary: "The petition site I built for the October 2026 lyceum mobilization in Guadeloupe: 600 signatures, 950 students organized, press coverage across the archipel and beyond.", intro: ["In October 2026, lyceens across Guadeloupe mobilized over heat in classrooms, crumbling buildings, canteens, missing teachers and endless schedules. In my lyceum I organized a mobilization of 950 students and built greve-petition.pages.dev to collect and publish our demands: 600 signatures in a few days.", "Representatives were received by the rector Gabriele Fioni and by Ary Chalus, president of the Regional Council. Guadeloupe 1ère, Canal 10 and Libération covered the movement. Beyond the code, it was an extremely enriching experience in organization, communication with the mairie, the Region, the rectorat — and in getting closer to the students themselves."], features: ["Demands collected and published: heat, buildings, canteen, staffing, schedules", "Signature counter and public support wall", "Press archive: Guadeloupe 1ère, Canal 10, Libération"], usage: "Open the site, read the demands, sign, share. The whole revendication list lives there.", limits: "A personal student initiative; signature counts are as declared by the site; not an official union or institutional platform." },
    fr: { name: "Grève Pétition 2026", category: "Site de pétition & mobilisation", summary: "Le site de pétition créé pour la mobilisation lycéenne d'octobre 2026 en Guadeloupe : 600 signatures, 950 élèves organisés, une couverture presse dans tout l'archipel et au-delà.", intro: ["En octobre 2026, les lycéens de Guadeloupe se mobilisent : chaleur dans les salles, bâtiments vétustes, restauration, manque de professeurs, emplois du temps à rallonge. Dans mon lycée, j'ai organisé une mobilisation de 950 élèves et construit greve-petition.pages.dev pour porter nos revendications : 600 signatures en quelques jours.", "Des représentants ont été reçus par le recteur Gabriele Fioni et par Ary Chalus, président du conseil régional. Guadeloupe 1ère, Canal 10 et Libération ont couvert le mouvement. Au-delà du code : une expérience extrêmement enrichissante d'organisation, de communication avec la mairie, la Région, le rectorat — et de rapprochement avec les élèves."], features: ["Revendications collectées et publiées : chaleur, bâtiments, cantine, moyens, emplois du temps", "Compteur de signatures et mur de soutien public", "Revue de presse : Guadeloupe 1ère, Canal 10, Libération"], usage: "Ouvrir le site, lire les revendications, signer, partager. Toute la liste des revendications y vit.", limits: "Initiative personnelle lycéenne ; compteur de signatures tel que déclaré par le site ; aucune plateforme syndicale ou institutionnelle officielle." },
    es: { name: "Grève Pétition 2026", category: "Sitio de petición y movilización", summary: "El sitio de petición que creé para la movilización liceal de octubre de 2026 en Guadalupe: 600 firmas, 950 estudiantes organizados, cobertura de prensa en todo el archipiélago.", intro: ["En octubre de 2026, los liceales de Guadalupe se movilizaron: calor en las aulas, edificios vetustos, cantina, falta de profesores, horarios interminables. En mi liceo organicé una movilización de 950 estudiantes y construí greve-petition.pages.dev: 600 firmas en pocos días.", "Representantes fueron recibidos por el rector Gabriele Fioni y por Ary Chalus, presidente del consejo regional. Guadeloupe 1ère, Canal 10 y Libération cubrieron el movimiento. Más allá del código: una experiencia enormemente enriquecedora de organización y comunicación con la alcaldía, la Región y el rectorado."], features: ["Reivindicaciones recopiladas y publicadas: calor, edificios, cantina, personal, horarios", "Contador de firmas y muro de apoyo público", "Cobertura: Guadeloupe 1ère, Canal 10, Libération"], usage: "Abrir el sitio, leer las reivindicaciones, firmar, compartir.", limits: "Iniciativa personal estudiantil; contador de firmas según el sitio; no es una plataforma oficial." }
  }, { web: { url: "https://greve-petition.pages.dev/" } }),
  np("hauteur", "lab", "software", "https://github.com/MaxLananas/Hauteur", null, {
    en: { name: "Hauteur", category: "Geyser extension", language: "Java", summary: "A Geyser extension that lets Bedrock players build and move at Java-world heights (think Y≈1950 on BuildTheEarth) by shifting the vertical window the client sees as they climb.", intro: ["Bedrock clients cannot display the extreme altitudes of Java worlds like BuildTheEarth. Hauteur shifts the vertical window the Bedrock client sees as the player climbs, so building at Y≈1950 stops being a void stare.", "It is a server-side Geyser extension: Bedrock players get a playable vertical slice of the Java world without touching the Java side."], features: ["Remaps the visible vertical window while climbing", "Works on BuildTheEarth-style altitudes", "No client mod needed on the Bedrock side"], usage: "Drop the extension next to Geyser on the server and let Bedrock builders climb.", limits: "Bedrock-side rendering approximations remain; check the repository for the supported Geyser versions." },
    fr: { name: "Hauteur", category: "Extension Geyser", language: "Java", summary: "Une extension Geyser qui permet aux joueurs Bedrock de construire aux altitudes Java (Y≈1950 sur BuildTheEarth) en décalant la fenêtre verticale vue par le client.", intro: ["Les clients Bedrock ne peuvent pas afficher les altitudes extrêmes des mondes Java comme BuildTheEarth. Hauteur décale la fenêtre verticale perçue par le client Bedrock pendant la montée.", "Côté serveur uniquement : les Bedrock obtiennent une tranche verticale jouable du monde Java."], features: ["Remappe la fenêtre verticale pendant l'ascension", "Altitudes type BuildTheEarth", "Aucun mod client côté Bedrock"], usage: "Déposer l'extension à côté de Geyser sur le serveur.", limits: "Approximations de rendu Bedrock restantes ; voir le dépôt pour les versions Geyser supportées." },
    es: { name: "Hauteur", category: "Extensión Geyser", language: "Java", summary: "Una extensión Geyser que permite a jugadores Bedrock construir a alturas Java (Y≈1950 en BuildTheEarth) desplazando la ventana vertical del cliente.", intro: ["Los clientes Bedrock no muestran las altitudes extremas de mundos Java como BuildTheEarth. Hauteur desplaza la ventana vertical que ve el cliente Bedrock al subir.", "Solo lado servidor: los Bedrock obtienen una franja vertical jugable del mundo Java."], features: ["Remapea la ventana vertical al subir", "Altitudes tipo BuildTheEarth", "Sin mod cliente en Bedrock"], usage: "Suelta la extensión junto a Geyser en el servidor.", limits: "Quedan aproximaciones de render Bedrock; consulta el repositorio." }
  }),
  np("fawe-butinmods", "lab", "software", "https://github.com/MaxLananas/FAWE-ButInMods", null, {
    en: { name: "FAWE But In Mods", category: "Fabric mod", language: "Java", summary: "The complete WorldEdit 7.3.17 + FastAsyncWorldEdit command set as a standalone Fabric mod for Minecraft 1.21.10. No plugin, no server software, no client mod, no placeholder commands.", intro: ["Everything you love typing — //stack, //copy, //paste, the whole FAWE grammar — running as a pure Fabric mod on 1.21.10.", "No Paper, no plugin folder, no half-implemented placeholders: the full command set, client-side where it can be, server-side where it must be."], features: ["Full WorldEdit 7.3.17 + FAWE command set", "Standalone Fabric mod, 1.21.10", "No plugin or server software required"], usage: "Put the jar in mods/, open a world, start typing slashes.", limits: "Fabric-only; multiplayer behaviour follows the mod's server/client split documented in the repository." },
    fr: { name: "FAWE But In Mods", category: "Mod Fabric", language: "Java", summary: "Tout le jeu de commandes WorldEdit 7.3.17 + FastAsyncWorldEdit en mod Fabric autonome pour Minecraft 1.21.10. Sans plugin, sans logiciel serveur, sans commandes factices.", intro: ["Tout ce que tu aimes taper — //stack, //copy, //paste, toute la grammaire FAWE — en pur mod Fabric sur 1.21.10.", "Pas de Paper, pas de dossier plugins, pas de placeholders à moitié implémentés."], features: ["Jeu de commandes WorldEdit 7.3.17 + FAWE complet", "Mod Fabric autonome, 1.21.10", "Aucun plugin ni logiciel serveur requis"], usage: "Le jar dans mods/, ouvrir un monde, taper des slashes.", limits: "Fabric uniquement ; voir le dépôt pour le découpage client/serveur." },
    es: { name: "FAWE But In Mods", category: "Mod Fabric", language: "Java", summary: "Todo el set de comandos WorldEdit 7.3.17 + FastAsyncWorldEdit como mod Fabric independiente para Minecraft 1.21.10. Sin plugin, sin software de servidor.", intro: ["Todo lo que amas escribir — //stack, //copy, //paste, toda la gramática FAWE — como mod Fabric puro en 1.21.10.", "Sin Paper, sin carpeta de plugins, sin placeholders a medias."], features: ["Set completo de comandos WorldEdit 7.3.17 + FAWE", "Mod Fabric independiente, 1.21.10", "Sin plugin ni software de servidor"], usage: "El jar en mods/, abrir un mundo, escribir slashes.", limits: "Solo Fabric; consulta el repositorio." }
  }),
  np("enchantforge", "lab", "software", "https://github.com/MaxLananas/EnchantForge", null, {
    en: { name: "EnchantForge", category: "Server mod / plugin", language: "Java", summary: "Buff, nerf and ban enchantments with precision: per-enchantment control of levels, costs and availability without gutting the vanilla table.", intro: ["Server owners keep asking for one thing: keep mending but make it cost something, kill frost walker on spawn islands, let level 5 unbreaking exist. EnchantForge is the scalpel.", "Configure per enchantment: max level, anvil and table availability, treasure behaviour."], features: ["Per-enchantment buffs, nerfs and bans", "Table, anvil and treasure channels controlled separately", "Config that survives updates"], usage: "Install, edit the config, reload. Players feel the balance, not the plugin.", limits: "Balance is your responsibility; the mod only obeys the config." },
    fr: { name: "EnchantForge", category: "Mod / plugin serveur", language: "Java", summary: "Buff, nerf et bannis des enchantements avec précision : contrôle par enchantement des niveaux, coûts et disponibilité, sans massacrer la table vanilla.", intro: ["Les propriétaires de serveur veulent une chose : garder mending mais le faire coûter, virer frost walker des îles de spawn, autoriser unbreaking V. EnchantForge est le scalpel.", "Configuration par enchantement : niveau max, disponibilité table/enclume, trésors."], features: ["Buffs, nerfs et bans par enchantement", "Canaux table, enclume et trésors séparés", "Config qui survit aux mises à jour"], usage: "Installer, éditer la config, recharger.", limits: "L'équilibrage reste ta responsabilité ; le mod obéit à la config." },
    es: { name: "EnchantForge", category: "Mod / plugin de servidor", language: "Java", summary: "Buffea, nerfea y banea encantamientos con precisión: control por encantamiento de niveles, costes y disponibilidad sin destrozar la tabla vanilla.", intro: ["Los dueños de servidores piden una cosa: mantener mending pero con coste, quitar frost walker del spawn, permitir unbreaking V. EnchantForge es el bisturí.", "Configuración por encantamiento: nivel máximo, tabla/yunque, tesoros."], features: ["Buffs, nerfs y baneos por encantamiento", "Canales de tabla, yunque y tesoros separados", "Config que sobrevive actualizaciones"], usage: "Instalar, editar config, recargar.", limits: "El balance es tu responsabilidad; el mod obedece la config." }
  }),
  np("terraplusminus", "reference", "software", "https://github.com/MaxLananas/TerraPlusMinus", null, {
    en: { name: "TerraPlusMinus (contributions)", category: "BuildTheEarth terrain generation", language: "Java", summary: "My contributions to TerraPlusMinus, the plugin that generates the real Earth inside Minecraft — the terrain backbone of BuildTheEarth servers.", intro: ["TerraPlusMinus turns geographic data into Minecraft terrain: elevation, landcover, buildings and roads streamed into the world at 1:1 scale.", "I contribute fixes and BuildTheEarth-facing improvements to the generator used by BTE servers, including the France projection workflows."], features: ["Real-world terrain generation at 1:1 scale", "Used by BuildTheEarth servers", "Contributions focused on BTE France workflows"], usage: "Server-side plugin; see the repository for dataset setup and version compatibility.", limits: "Upstream project; my role is contributor, not sole author. Dataset licences apply." },
    fr: { name: "TerraPlusMinus (contributions)", category: "Génération de terrain BuildTheEarth", language: "Java", summary: "Mes contributions à TerraPlusMinus, le plugin qui génère la vraie Terre dans Minecraft — la colonne vertébrale des serveurs BuildTheEarth.", intro: ["TerraPlusMinus transforme des données géographiques en terrain Minecraft : relief, occupation du sol, bâtiments et routes à l'échelle 1:1.", "Je contribue des correctifs et améliorations orientées BuildTheEarth, dont les workflows de projection France."], features: ["Génération de terrain réel à l'échelle 1:1", "Utilisé par les serveurs BuildTheEarth", "Contributions centrées sur BTE France"], usage: "Plugin serveur ; voir le dépôt pour les datasets et compatibilités.", limits: "Projet upstream ; je suis contributeur, pas auteur unique. Licences des datasets applicables." },
    es: { name: "TerraPlusMinus (contribuciones)", category: "Generación de terreno BuildTheEarth", language: "Java", summary: "Mis contribuciones a TerraPlusMinus, el plugin que genera la Tierra real en Minecraft — la columna vertebral de los servidores BuildTheEarth.", intro: ["TerraPlusMinus convierte datos geográficos en terreno Minecraft: relieve, cobertura, edificios y rutas a escala 1:1.", "Aporto correcciones y mejoras orientadas a BuildTheEarth, incluidos los flujos de proyección de Francia."], features: ["Terreno real a escala 1:1", "Usado por servidores BuildTheEarth", "Contribuciones centradas en BTE France"], usage: "Plugin de servidor; ver repositorio para datasets.", limits: "Proyecto upstream; soy contribuidor, no autor único." }
  }, { bte: true }),
  np("bte-france-bot", "reference", "software", "https://github.com/MaxLananas/BTE-France-Bot", null, {
    en: { name: "BTE France Bot", category: "Discord bot for BTE France", language: "JavaScript", summary: "The Discord bot of the BTE France server: build crew tooling, roles, claims and community glue for the French BuildTheEarth crew.", intro: ["A build crew of dozens needs more than a Minecraft server: claims, plots, roles, reminders, and a place where the meme channel stays separate from the build channel.", "I maintain the bot that keeps the BTE France community running on Discord."], features: ["Build crew tooling: claims, plots, roles", "Community moderation glue", "Maintained for the BTE France server"], usage: "Runs on the BTE France Discord; repository documents the commands and setup.", limits: "Community tooling; not affiliated with the official BuildTheEarth project." },
    fr: { name: "BTE France Bot", category: "Bot Discord pour BTE France", language: "JavaScript", summary: "Le bot Discord du serveur BTE France : outils d'équipe de build, rôles, claims et colle communautaire pour l'équipe BuildTheEarth française.", intro: ["Une équipe de build de dizaines de personnes a besoin de plus qu'un serveur Minecraft : claims, plots, rôles, rappels, et un salon meme séparé du salon build.", "Je maintiens le bot qui fait tourner la communauté BTE France sur Discord."], features: ["Outils d'équipe : claims, plots, rôles", "Colle de modération communautaire", "Maintenu pour le serveur BTE France"], usage: "Tourne sur le Discord BTE France ; commandes documentées au dépôt.", limits: "Outil communautaire ; sans affiliation officielle BuildTheEarth." },
    es: { name: "BTE France Bot", category: "Bot Discord para BTE France", language: "JavaScript", summary: "El bot Discord del servidor BTE France: herramientas de equipo de build, roles, claims y pegamento comunitario para el equipo francés de BuildTheEarth.", intro: ["Un equipo de decenas necesita más que un servidor de Minecraft: claims, plots, roles, recordatorios y un canal de memes separado.", "Mantengo el bot que hace funcionar la comunidad BTE France en Discord."], features: ["Herramientas de equipo: claims, plots, roles", "Pegamento de moderación", "Mantenido para BTE France"], usage: "Funciona en el Discord de BTE France; comandos en el repositorio.", limits: "Herramienta comunitaria; sin afiliación oficial." }
  }, { bte: true })
];
const NEW_PAGES = [];
for (const proj of NEW_PROJECTS) {
  for (const lang of LANGS) {
    const L = { en: proj.introFor("en"), fr: proj.introFor("fr"), es: proj.introFor("es") }[lang];
    NEW_PAGES.push({
      lang, path: pathFor(lang, `/projects/${proj.slug}/`), enPath: `/projects/${proj.slug}/`, type: "WebPage", project: proj,
      title: `${proj.name} — ${proj.categoryFor(lang)} | MaxLananas`,
      description: proj.summaryFor(lang).slice(0, 155),
      heading: proj.name,
      alternates: LANGS.map((l) => ({ lang: l, path: pathFor(l, `/projects/${proj.slug}/`) })),
      published: "2026-10-25", modified: "2026-10-25", reviewed: "2026-10-25"
    });
  }
}

const REF_EXCLUDE = ["bte-distortion-calculator", "bte-france-guidelines", "le-mans"];
for (const [slug, art] of [["sentinel", "/assets/retro/promo-sentinel.webp"], ["pineappleui", "/assets/retro/promo-pineappleui.webp"]]) {
  const proj = PROJECTS.find((x) => x.slug === slug);
  if (proj && !proj.cover && !proj.leadMedia && !proj.icon && existsSync(resolve(root, "." + art))) proj.art = art;
}
function projectsHubBody(h) {
  const l = h.lang, k = "/projects/", c = (f) => copy(l, k, f);
  const group = (cols) => PROJECTS.filter((p) => cols.includes(p.collection));
  return [
    `<p>${esc(c("intro"))}</p>`,
    spotlight(h),
    h2(c("modrinthTitle")) + cards(group(["release"]), h) + `<p class="center">${h.link(SITE.modrinth, c("modrinthCta"), 'class="btn95" target="_blank" rel="noopener"')}</p>`,
    h2(c("labTitle")) + `<p>${esc(c("labIntro"))}</p>` + cards(group(["lab"]), h),
    h2(c("refsTitle")) + `<p>${esc(c("refsIntro"))}</p>` + cards([...group(["reference", "build"]).filter((p) => !REF_EXCLUDE.includes(p.slug)), ...NEW_PROJECTS.filter((p) => p.collection === "reference")], h)
  ].join("");
}

function projectBody(page, h) {
  const l = h.lang, p = page.project, t = h.t;
  const sourceUrl = p.source?.url || (p.repo && p.revision ? p.repo + "/blob/" + p.revision + "/" + p.evidenceFile : p.repo);
  const primary = p.modrinth ? [p.modrinth, t("launchModrinth")] : p.web && p.launch?.url ? [p.launch.url, t("launchApp")] : p.repo ? [p.repo, t("launchGithub")] : p.source ? [p.source.url, t("launchSource")] : [SITE.discord, t("launchContact")];
  const lead = p.cover || p.leadMedia || p.icon;
  const shotPath = `/assets/projects/${p.slug}-shot.webp`;
  const figure = p.art ? `<figure class="shot"><img class="pixel" src="${esc(p.art)}" alt="${esc(ui(l, "cardAlt", { name: p.name }))}"><figcaption>${esc(p.categoryFor(l))} · illustration</figcaption></figure>`
    : lead ? `<figure class="shot"><img src="${esc(mediaData(lead).src)}" alt="${esc(ui(l, "cardAlt", { name: p.name }))}"><figcaption>${esc(p.categoryFor(l))}</figcaption></figure>`
    : existsSync(resolve(root, "." + shotPath)) ? `<figure class="shot"><img src="${esc(shotPath)}" alt="${esc(ui(l, "cardAlt", { name: p.name }))}"><figcaption>${esc(p.categoryFor(l))}</figcaption></figure>` : "";
  const mediaShots = p.media?.length ? h2(t("screenshotsTitle")) + mediaShot(p.media.map((m) => ({ ...m, title: mediaText(l, m, "title", p.name), alt: mediaText(l, m, "alt", p.name) })), h) : "";
  const buildShots = p.images?.length ? h2(p.kind === "build" ? t("sectionShots") : t("sectionExampleBuilds")) + photoTable(p.images.map((name) => FILES.find((f) => f.name === name)), h) : "";
  const related = p.related?.length ? h2(t("sectionRelated")) + cards(p.related.map((r) => bySlug(r.slug || r) || r).filter(Boolean), h) + `<p class="center tiny">${h.link("/projects/", t("relatedAll"))} · ${h.link(p.bte ? "/buildtheearth/" : "/development/", p.bte ? t("relatedBte") : t("relatedDev"))}</p>` : "";
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
    h2(s.nextTitle) + `<p>${esc(s.next)}</p><p class="center"><img class="pixel" src="/assets/retro/at.gif" alt="" width="15" height="15"> <a class="btn95 primary" href="${esc(SITE.discord)}" target="_blank" rel="noopener">${esc(s.contact)}</a> <a class="btn95" href="${esc(h.route("/development/"))}">${esc(s.explore)}</a></p>`
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

function mobBody(page, h) {
  const l = h.lang, A = MOBILISATION_ARTICLE[l], img = MOBILISATION_ARTICLE.image;
  const fig = `<figure class="shot collage-fig"><img src="${esc(img.src)}" alt="${esc(page.heading)}" width="${img.width}" height="${img.height}" loading="lazy"><figcaption>${esc(A.illustrationNote)}</figcaption></figure>`;
  const timeline = `<h2 class="pixel">${esc({ en: "the timeline", fr: "la chronologie", es: "la cronología" }[l])}</h2><table class="data"><tbody>${A.timeline.map(([d, t]) => `<tr><th><time datetime="${d}">${d}</time></th><td>${esc(t)}</td></tr>`).join("")}</tbody></table>`;
  const press = `<h2 class="pixel">${esc({ en: "press & sources", fr: "presse & sources", es: "prensa y fuentes" }[l])}</h2><ul class="pix">${A.press.map(([lb, url]) => `<li>${h.link(url, lb, 'target="_blank" rel="noopener noreferrer"')}</li>`).join("")}<li>${h.link("/projects/greve-petition/", { en: "the petition project file on this site", fr: "la fiche projet de la pétition sur ce site", es: "la ficha del proyecto de la petición" }[l])}</li></ul>`;
  return [
    `<h1 class="pixel">${esc(page.heading)}</h1>`,
    `<p class="byline">${fill(A.byline, { date: `<time datetime="${page.published}">${dateLabel(page.published, l)}</time>` })}</p>`,
    fig,
    `<p class="lead">${esc(A.intro)}</p>`,
    A.sections.map((sec) => h2(sec.title) + sec.paragraphs.map((pp) => `<p>${esc(pp)}</p>`).join("")).join(""),
    timeline, press
  ].join("");
}

function galleryBody(page, h) {
  const l = h.lang;
  return `<h1 class="pixel">${esc(page.heading)}</h1><div class="masonry90">${FILES.map((item, idx) => `<a class="pin" href="${esc(originalUrl(item))}" target="_blank" rel="noopener"><img src="${esc(proxyUrl(item, 640))}" alt="${esc(label(l, item, idx))} — MaxLananas (#${idx + 1})" loading="lazy"></a>`).join("")}</div>`;
}

function searchBody(page, h) {
  const l = h.lang, k = "/search/";
  const index = [
    ...PROJECTS.map((p) => ({ href: projectPath(p.slug), text: `${p.name} ${p.summaryFor(l)}` })),
    ...NEW_PROJECTS.map((p) => ({ href: projectPath(p.slug), text: `${p.name} ${p.summaryFor(l)}` })),
    ...FILES.map((f, i) => ({ href: "/builds/#s" + (i + 1), text: label(l, f, i) }))
  ];
  return [
    `<p>${fill(copy(l, k, "intro"), { projects: h.link("/projects/", copy(l, k, "introProjects")), builds: h.link("/builds/", copy(l, k, "introBuilds")) })}</p>`,
    `<form role="search"><input type="search" id="q" placeholder="${esc(h.tr("searchPlaceholder"))}" style="width:70%;"> <button class="btn95" type="submit">${esc(h.tr("searchBtn"))}</button></form>`,
    `<p id="searchHits"></p>`,
    `<ul class="sres" id="search-results">${index.map((item) => `<li data-text="${esc(item.text.toLowerCase())}">${h.link(item.href, item.text.split(" ").slice(0, 14).join(" "))}</li>`).join("")}</ul>`
  ].join("");
}

function journalBody(h) {
  return win(h.tr("journalWin"), `<ul class="upd">${JOURNAL.map((e) => `<li><b>[${e.d} · ${e.h}]</b>${esc(e[h.lang])} ${e.link ? h.link(e.link, "→") : ""}</li>`).join("")}</ul>`);
}

function linksBody(h) {
  const hubs = [
    ["discord", SITE.discord, "commissions, help, random block talk"],
    ["instagram", SITE.instagram, "@maxlananas.builds — build photos"],
    ["youtube", "https://www.youtube.com/@MaxLananass", "@MaxLananass — builds & timelapses"],
    ["website", "https://maxlananas.is-a.dev/", "the portfolio, canonical url"],
    ["modrinth", SITE.modrinth, "published minecraft mods & plugins"],
    ["github", SITE.github, "source code, labs and half-finished things"],
    ["tiktok", "https://www.tiktok.com/@maxlananas2", "@maxlananas2 — short vertical builds"]
  ];
  return win(h.tr("linksWin"), `<p>${esc(h.tr("linksIntro"))}</p><p class="tiny center"><img class="pixel" src="/assets/retro/click.gif" alt="" width="17" height="15"> click here, like it's 1998 <img class="pixel" src="/assets/retro/click.gif" alt="" width="17" height="15"></p><div class="hub">${hubs.map(([name, href, desc]) => `<a class="hubbtn" href="${esc(href)}" target="_blank" rel="noopener"><b>${esc(name)}</b><span>${esc(desc)}</span><i>${esc(href.replace(/^https?:\/\//, ""))}</i></a>`).join("")}</div>`);
}

function sitemapBody(h, pages) {
  const l = h.lang;
  const main = ["/", "/about/", "/projects/", "/buildtheearth/", "/development/", MUSEUM_ARTICLE_PATH, MOBILISATION_ARTICLE_PATH, "/builds/", "/journal/", "/links/", "/search/", "/sitemap/"];
  const allProjects = [...PROJECTS, ...NEW_PROJECTS].filter((p) => !REF_EXCLUDE.includes(p.slug) || p.collection !== "reference");
  const li = (path) => `<li>${h.link(path, path === "/" ? "home sweet home" : path)}</li>`;
  return win(h.tr("mapWin"), `<p>${esc(h.tr("mapIntro"))}</p>` +
    h2(h.tr("mapMain")) + `<ul class="map">${main.map(li).join("")}</ul>` +
    h2(h.tr("mapProjects")) + `<ul class="map">${allProjects.map((p) => li(projectPath(p.slug))).join("")}</ul>` +
    h2(h.tr("mapBuilds")) + `<ul class="map">${li("/builds/")}</ul>` +
    h2(h.tr("mapExtra")) + `<ul class="map">${LANGS.map((x) => li(pathFor(x, "/"))).map((x, k) => x + `<span class="tiny"> (${LANGS[k]})</span>`).join("")}</ul>` +
    `<p class="tiny">${pages.filter((p) => p.lang === l && !p.noindex).length} indexable pages in ${l.toUpperCase()} · languages: ${LANGS.map((x) => h.link(pathFor(x, "/"), x)).join(" · ")} · xml: ${h.link("/sitemap.xml", "/sitemap.xml")}</p>`);
}

function ogImageFor(page) {
  if (page.project?.art) return page.project.art;
  if (page.project?.cover) {
    try { return mediaData(page.project.cover).src; } catch { /* fall through */ }
  }
  return "/assets/retro/avatar.png";
}
function jsonLdFor(page) {
  const base = canonical("/");
  if (page.enPath === "/" && page.lang === "en") {
    return `<script type="application/ld+json">${JSON.stringify([{ "@context": "https://schema.org" },
      { "@type": "WebSite", name: "MaxLananas", url: base, description: page.description, inLanguage: "en", publisher: { "@type": "Person", name: "MaxLananas", url: "https://github.com/MaxLananas" }, potentialAction: { "@type": "SearchAction", target: { "@type": "EntryPoint", urlTemplate: canonical("/search/") + "?q={search_term_string}" }, "query-input": "required name=search_term_string" } },
      { "@type": "Person", name: "MaxLananas", url: "https://github.com/MaxLananas", sameAs: [SITE.github, SITE.modrinth, SITE.instagram, SITE.discord, "https://www.youtube.com/@MaxLananass", "https://www.tiktok.com/@maxlananas2"], knowsAbout: ["Minecraft building", "BuildTheEarth", "modding", "Guadeloupe"], address: { "@type": "PostalAddress", addressRegion: "Guadeloupe", addressCountry: "FR" } }
    ])}<\/script>`;
  }
  const crumbs = [
    { "@type": "ListItem", position: 1, name: "home", item: base },
    { "@type": "ListItem", position: 2, name: page.heading || page.title.split(" — ")[0], item: canonical(page.enPath || page.path) }
  ];
  const graph = [{ "@type": "BreadcrumbList", itemListElement: crumbs }];
  if (page.enPath === "/projects/") {
    graph.push({ "@type": "ItemList", name: "MaxLananas projects", numberOfItems: PROJECTS.length + NEW_PROJECTS.length, itemListElement: [...PROJECTS, ...NEW_PROJECTS].map((p, i) => ({ "@type": "ListItem", position: i + 1, name: p.name, url: canonical(projectPath(p.slug)) })) });
  }
  return `<script type="application/ld+json">${JSON.stringify([{ "@context": "https://schema.org" }, ...graph]).replace(/<\//g, "<\\/")}</script>`;
}

/* ------------------------------------------------------------------ shell -- */
function head(page, extra = "") {
  const alternates = (page.alternates || []).map((a) => `<link rel="alternate" hreflang="${a.lang}" href="${canonical(a.path)}">`).join("");
  return `<!DOCTYPE html>
<html lang="${page.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(page.title)}</title>
<meta name="description" content="${esc(page.description)}">
<meta name="generator" content="Microsoft FrontPage 4.0">
<meta name="author" content="MaxLananas">
${SITE.verification?.google ? `<meta name="google-site-verification" content="${esc(SITE.verification.google)}">` : ""}
<meta property="og:site_name" content="${esc(SITE.name)}">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(page.title)}">
<meta property="og:description" content="${esc(page.description)}">
<meta property="og:url" content="${canonical(page.path)}">
<meta property="og:image" content="${canonical(ogImageFor(page))}">
<meta property="og:image:alt" content="${esc(page.heading || page.title)}">
<meta property="og:image:width" content="${OG_DIMS.get(ogImageFor(page))?.width || 1200}">
<meta property="og:image:height" content="${OG_DIMS.get(ogImageFor(page))?.height || 630}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(page.title)}">
<meta name="twitter:description" content="${esc(page.description)}">
<meta name="twitter:image" content="${canonical(ogImageFor(page))}">
<meta name="twitter:image:alt" content="${esc(page.heading || page.title)}">
<link rel="canonical" href="${canonical(page.path)}">
${alternates}<link rel="alternate" hreflang="x-default" href="${canonical((page.alternates || []).find((a) => a.lang === "en")?.path || page.path)}">
<link rel="icon" href="/favicon.ico">
<link rel="stylesheet" href="/retro.css">
${page.noindex ? '<meta name="robots" content="noindex, follow">' : ""}
<script src="/retro.js" defer></script>
${extra}</head>`;
}

function shell(page, body, h, extra = jsonLdFor(page)) {
  const picks = [3, 7, 11, 19, 24, 30, 37, 44, 52, 61, 70, 84, 96];
  const mosaic = picks.map((i) => `<img src="${esc(proxyUrl(FILES[i % FILES.length], 320))}" alt="" loading="lazy">`).join("");
  const langLinks = (page.alternates || []).map((a) => `<a href="${esc(a.path)}">${a.lang === "en" ? "english" : a.lang === "fr" ? "français" : "español"}</a>`).join(" · ");
  const isHome = page.home && !page.noindex;
  const chrome = `<div class="chrome"><div class="chrome-tabs"><span class="chrome-tab on">${esc(h.tr("navHome"))}</span><span class="chrome-tab">${esc(h.tr("navProjects"))}</span><span class="chrome-tab">${esc(h.tr("navBuilds"))}</span><span class="chrome-dots"><i></i><i></i><i></i></span></div><div class="chrome-url"><span class="chrome-ar">‹ › ⟳</span><span class="chrome-bar">https://maxlananas.is-a.dev${esc(page.path)}</span><span class="chrome-x">— ✕</span></div></div>`;
  if (isHome) {
    return `${head(page, extra)}
<body class="ed-body">
${chrome}
<main class="ed-page">${body}</main>
<div class="ed-foot">
  <img class="hr pixel" src="/assets/retro/rainbow-hr.gif" alt="" width="432" height="8">
  <div>${h.link("/", h.tr("navHome"))} · ${h.link("/about/", h.tr("navAbout"))} · ${h.link("/builds/", h.tr("navBuilds"))} · ${h.link("/projects/", h.tr("navProjects"))} · ${h.link("/journal/", h.tr("navJournal"))} · ${h.link("/sitemap/", h.tr("navSitemap"))}</div>
  <div class="tiny" style="margin:4px 0;">${langLinks}</div>
  <div class="foot-badges"><span class="b88 grey">${FILES.length} screenshots inside</span><span class="b88 navy">en · fr · es</span><span class="b88 black">no cookies · no trackers</span></div>
  <div class="tiny">${esc(h.tr("footCopy"))}</div>
</div>
</body>
</html>`;
  }
  return `${head(page, extra)}
<body class="ed-body inner">
${chrome}
<table class="frame" cellspacing="7" cellpadding="0">
<tr><td colspan="3" class="col-banner">
  <div class="banner"><div class="mosaic">${mosaic}</div><div class="banner-logo">MaxLananas</div></div>
  <div class="marq"><marquee scrollamount="3">${esc(h.tr("marquee"))}</marquee></div>
  <div class="fire-row"><img class="pixel" src="/assets/retro/fire.gif" alt="" width="432" height="12"></div>
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
  <div class="foot-badges"><span class="b88 grey">${FILES.length} screenshots inside</span><span class="b88 navy">en · fr · es</span><span class="b88 black">no cookies · no trackers</span></div>
  <div class="tiny">${esc(h.tr("footCopy"))}</div>
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
  if (page.home && !page.noindex) return homeEditorialBody(page, h);
  if (page.noindex) return searchBody(page, h);
  if (page.caseStudy) return caseStudyBody(page, h);
  if (page.project) return projectBody(page, h);
  if (page.type === "ProfilePage") return aboutBody(page, h);
  if (en === "/projects/") return projectsHubBody(h);
  if (en === "/buildtheearth/") return bteBody(h);
  if (en === "/development/") return devBody(h);
  if (page.editorialArticle === MOBILISATION_ARTICLE) return mobBody(page, h);
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
const pages = [...all, ...extras, ...NEW_PAGES];
const OG_DIMS = new Map();
for (const pg of pages.concat([{ path: "/404.html" }])) {
  const img = ogImageFor(pg);
  if (!OG_DIMS.has(img)) {
    try { OG_DIMS.set(img, await sharp(resolve(root, "." + img)).metadata()); }
    catch { OG_DIMS.set(img, { width: 1200, height: 630 }); }
  }
}
let written = 0;
for (const page of pages) {
  const enRoute0 = page.enPath || page.path.replace(/^\/(fr|es)(?=\/)/, "");
  if (enRoute0 === "/guides/minecraft-mods-plugins-addons/") continue;
  const h = helpersFor(page.lang);
  let seoScript;
  try {
    seoScript = `<script type="application/ld+json">${JSON.stringify(schemaFor(page, pages, seoHelpers(page.path, {}, page.lang))).replace(/<\//g, "<\\/")}</script>`;
  } catch (e) {
    seoScript = jsonLdFor(page);
  }
  const html = shell(page, bodyFor(page, h, pages), h, seoScript);
  const file = resolve(outRoot, pageFile(page.path));
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, html);
  written += 1;
}

/* 404 — single file at the root, like the old days */
const notFound = { lang: "en", path: "/404.html", title: copy("en", "notFound", "title"), description: copy("en", "notFound", "description"), alternates: [], noindex: true };
const h404 = helpersFor("en");
await writeFile(resolve(outRoot, "404.html"), shell(notFound, win("404 — file not found", `<p class="center"><img class="pixel" src="/assets/retro/construction.gif" alt="" width="88" height="31"></p><h1 class="pixel">${esc(copy("en", "notFound", "heading"))}</h1><p>${esc(copy("en", "notFound", "body"))}</p><p class="center">${h404.link("/", copy("en", "notFound", "home"), 'class="btn95"')} ${h404.link("/projects/", copy("en", "notFound", "projects"), 'class="btn95"')} ${h404.link("/builds/", copy("en", "notFound", "gallery"), 'class="btn95"')}</p>`), h404));

/* sitemap.xml — the real one, for the machines */
const xesc = (v) => String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const indexable = pages.filter((pg) => !pg.noindex && (pg.enPath || pg.path.replace(/^\/(fr|es)(?=\/)/, "")) !== "/guides/minecraft-mods-plugins-addons/");
const xmlUrls = indexable.map((pg) => `<url><loc>${xesc(canonical(pg.path))}</loc><lastmod>2026-10-25</lastmod>${(pg.alternates || []).map((a) => `<xhtml:link rel="alternate" hreflang="${a.lang}" href="${xesc(canonical(a.path))}"/>`).join("")}</url>`).join("");
await writeFile(resolve(outRoot, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${xmlUrls}\n</urlset>\n`);

console.log(`retro render: ${written + 1} pages written + sitemap.xml (${indexable.length} urls)`);
