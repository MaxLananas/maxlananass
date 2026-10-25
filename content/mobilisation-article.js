// Editorial long-read: the October 2026 lyceum mobilization in Guadeloupe,
// the petition site I coded for it, and what it taught me. First person,
// trilingual, with a timeline and the press archive.
export const MOBILISATION_ARTICLE_PATH = "/articles/mobilisation-lyceens-guadeloupe-2026/";

const image = {
  src: "/assets/retro/promo-petition.webp",
  width: 640,
  height: 349,
  illustration: true,
  title: {
    en: "Pixel-art illustration of students signing a petition in a Caribbean schoolyard",
    fr: "Illustration pixel-art d'élèves signant une pétition dans une cour de lycée caribéenne",
    es: "Ilustración pixel-art de estudiantes firmando una petición en un patio de liceo caribeño"
  },
  caption: {
    en: "Pixel-art illustration made for this article — not a photograph of the real courtyards.",
    fr: "Illustration pixel-art créée pour cet article — pas une photographie des vraies cours.",
    es: "Ilustración pixel-art creada para este artículo — no una fotografía de los patios reales."
  }
};

export const MOBILISATION_ARTICLE = {
  image,
  en: {
    byline: "by MaxLananas, published {date} — written between two classes, like everything else",
    intro: "In October 2026, the lyceums of Guadeloupe mobilized. I was one of the students who organized it in my lyceum — 950 of us — and the one who coded greve-petition.pages.dev, the site that carried our demands and collected 600 signatures. This is the whole story, with dates, names and links, because a journal entry was not enough.",
    sections: [
      { title: "Monday 5 October: the courtyard becomes a parliament", paragraphs: [
        "It started on Monday 5 October 2026, almost simultaneously in Petit-Bourg, Basse-Terre, Les Abymes and Sainte-Anne. The grievances were not abstract: classrooms where the heat makes thinking impossible, buildings that leak, a canteen that runs out, missing teachers, schedules that end at night. Every student could name at least one of them from memory.",
        "In my lyceum, the courtyard turned into a parliament in one morning. We were 950 students mobilized at the peak — general assemblies between two bells, handwritten signs, delegations per class. I kept my notebook: counts, demands, promises. And I did what I know how to do: I opened my editor."
      ] },
      { title: "What we were demanding", paragraphs: [
        "The petition site published the list we agreed on: real solutions against the heat in classrooms (fans are not a climate plan), renovation of the buildings, a functioning canteen, replacement of missing teachers, and humane schedules. These are the demands that the representatives carried to the rectorat.",
        "Nothing revolutionary on paper. That is exactly why it worked: everyone had already lived every line of it."
      ] },
      { title: "A website as a tool of mobilization", paragraphs: [
        "greve-petition.pages.dev went online in the first days of the movement: the demands, a signature counter, a public support wall, and a press archive. 600 signatures arrived in a few days, from students, parents, teachers, people from other islands who had heard about it.",
        "Technically it is a small static site — hosting on Cloudflare Pages, no database, no cookies. Politically it was everything: a place where the movement could point, a number nobody could invent for us, and proof that we were not twelve kids shouting in a courtyard but a collective."
      ] },
      { title: "Facing the institutions", paragraphs: [
        "On Tuesday 6 October, around thirty representatives from the mobilized establishments were received at the rectorat by the rector Gabriele Fioni, in the presence of Ary Chalus, president of the Regional Council. The delegations spoke with lists, counts and photos — not with vibes.",
        "The same day, the movement counted 35 affected establishments across the archipelago (21 lyceums, 5 colleges, 9 schools), and tear gas was used near the lycées of Les Abymes, Baie-Mahault and Le Moule. Unions (SNES-FSU, SNEP-FSU) supported the mobilization and a national strike notice was filed. Nationally, that 6 October saw 266,000 to 450,000 demonstrators and 891 touched lyceums: we were a small piece of a big day."
      ] },
      { title: "The press archive", paragraphs: [
        "Guadeloupe 1ère followed the movement day by day; Canal 10 gave the courtyards a screen; Libération published on 6 October an article titled « C'est impossible d'étudier dans ces conditions », quoting the lycée Yves-Leborgne of Sainte-Anne. France-Antilles, ETV and cap-infos completed the archive.",
        "On Monday 12 October, the lycée Sonny-Rupaire of Sainte-Rose closed the sequence with a festive mobilization around gwoka — drums, dance, signs. A strike can also sound like a festival; that morning proved it."
      ] },
      { title: "What it taught me (and why it is on a Minecraft portfolio)", paragraphs: [
        "I build bridges in Minecraft and I ship mods for people I will never meet. The mobilization was the same muscle at a different scale: organize, document, communicate with the mairie, the Region, the rectorat, the journalists — and above all listen to 950 people who do not all want the same thing.",
        "The site is still online. The demands are still legible. Whether you sign it or not, it exists: that is my favorite definition of finished work. And yes, between two general assemblies, I fixed a CSS bug on it — priorities."
      ] }
    ],
    timeline: [
      ["2026-10-05", "Start of the mobilization: Petit-Bourg, Basse-Terre, Les Abymes, Sainte-Anne. 950 students mobilized in my lyceum."],
      ["2026-10-06", "35 establishments touched; delegates received by rector Gabriele Fioni and Ary Chalus; Libération article; tear gas at Les Abymes, Baie-Mahault, Le Moule."],
      ["2026-10-07", "600 signatures on greve-petition.pages.dev; support from SNES-FSU and SNEP-FSU."],
      ["2026-10-12", "Festive mobilization and gwoka at lycée Sonny-Rupaire, Sainte-Rose."],
      ["2026-10-25", "This article goes online. The demands are still standing."]
    ],
    press: [
      ["Libération, 06/10/2026 — « C'est impossible d'étudier dans ces conditions »", "https://www.liberation.fr/"],
      ["Guadeloupe 1ère (la1ere.franceinfo.fr) — daily coverage", "https://la1ere.franceinfo.fr/"],
      ["greve-petition.pages.dev — the petition site", "https://greve-petition.pages.dev/"]
    ],
    sourceLabel: "petition site", bteLabel: "my builds", rightsLabel: "image rights",
    illustrationNote: "pixel-art illustration made for this article — not a screenshot of the real courtyards (the real ones were too busy making history)."
  },
  fr: {
    byline: "par MaxLananas, publié le {date} — écrit entre deux cours, comme tout le reste",
    intro: "En octobre 2026, les lycées de Guadeloupe se sont mobilisés. J'étais de ceux qui l'ont organisée dans mon lycée — 950 élèves — et celui qui a codé greve-petition.pages.dev, le site qui portait nos revendications et a collecté 600 signatures. Voici toute l'histoire, avec dates, noms et liens, parce qu'une entrée de journal ne suffisait pas.",
    sections: [
      { title: "Lundi 5 octobre : la cour devient un parlement", paragraphs: [
        "Tout commence le lundi 5 octobre 2026, presque simultanément à Petit-Bourg, Basse-Terre, Les Abymes et Sainte-Anne. Les griefs n'ont rien d'abstrait : chaleur invivable dans les salles, bâtiments qui fuient, cantine en rupture, professeurs manquants, emplois du temps qui finissent la nuit. Chaque élève pouvait en citer au moins une de mémoire.",
        "Dans mon lycée, la cour est devenue un parlement en une matinée. 950 élèves mobilisés au plus fort : assemblées générales entre deux sonneries, pancartes manuscrites, délégations par classe. J'ai tenu mon carnet : comptages, revendications, promesses. Et j'ai fait ce que je sais faire : ouvert mon éditeur."
      ] },
      { title: "Ce que nous revendiquions", paragraphs: [
        "Le site de pétition publiait la liste arrêtée ensemble : de vraies solutions contre la chaleur (un ventilateur n'est pas un plan climat), des bâtiments rénovés, une cantine qui fonctionne, le remplacement des professeurs absents, des emplois du temps humainement vivables.",
        "Rien de révolutionnaire sur le papier. C'est exactement pour ça que ça a pris : tout le monde avait déjà vécu chaque ligne."
      ] },
      { title: "Un site web comme outil de mobilisation", paragraphs: [
        "greve-petition.pages.dev est monté en ligne dans les premiers jours : revendications, compteur de signatures, mur de soutien public, revue de presse. 600 signatures en quelques jours — élèves, parents, professeurs, gens des autres îles qui avaient entendu parler du mouvement.",
        "Techniquement, un petit site statique : hébergement Cloudflare Pages, pas de base de données, pas de cookies. Politiquement, c'était tout : un endroit vers lequel tendre le doigt, un chiffre que personne ne pouvait inventer à notre place, et la preuve que nous n'étions pas douze gamins qui crient dans une cour mais un collectif."
      ] },
      { title: "Face aux institutions", paragraphs: [
        "Le mardi 6 octobre, une trentaine de représentants des établissements mobilisés ont été reçus au rectorat par le recteur Gabriele Fioni, en présence d'Ary Chalus, président du conseil régional. Les délégations sont venues avec des listes, des comptages, des photos — pas avec des vibes.",
        "Le même jour : 35 établissements touchés dans l'archipel (21 lycées, 5 collèges, 9 écoles), et des gaz lacrymogènes près des lycées des Abymes, de Baie-Mahault et du Moule. Les syndicats (SNES-FSU, SNEP-FSU) ont soutenu le mouvement, un préavis de grève national a été déposé. Nationalement, ce 6 octobre a compté 266 000 à 450 000 manifestants et 891 lycées touchés : nous étions un petit morceau d'une grande journée."
      ] },
      { title: "La revue de presse", paragraphs: [
        "Guadeloupe 1ère a suivi le mouvement jour après jour ; Canal 10 a donné un écran aux cours ; Libération a publié le 6 octobre un article titré « C'est impossible d'étudier dans ces conditions », citant le lycée Yves-Leborgne de Sainte-Anne. France-Antilles, ETV et cap-infos complètent l'archive.",
        "Le lundi 12 octobre, le lycée Sonny-Rupaire de Sainte-Rose a clôturé la séquence par une mobilisation festive autour du gwoka — tambours, danse, pancartes. Une grève peut aussi sonner comme une fête ; ce matin-là l'a prouvé."
      ] },
      { title: "Ce que ça m'a appris (et pourquoi c'est sur un portfolio Minecraft)", paragraphs: [
        "Je construis des ponts dans Minecraft et je publie des mods pour des gens que je ne rencontrerai jamais. La mobilisation, c'était le même muscle à une autre échelle : organiser, documenter, parler avec la mairie, la Région, le rectorat, les journalistes — et surtout écouter 950 personnes qui ne veulent pas toutes la même chose.",
        "Le site est toujours en ligne. Les revendications sont toujours lisibles. Qu'on les signe ou non, elles existent : c'est ma définition préférée d'un travail fini. Et oui, entre deux assemblées générales, j'y ai corrigé un bug CSS — priorités."
      ] }
    ],
    timeline: [
      ["2026-10-05", "Début de la mobilisation : Petit-Bourg, Basse-Terre, Les Abymes, Sainte-Anne. 950 élèves mobilisés dans mon lycée."],
      ["2026-10-06", "35 établissements touchés ; délégations reçues par le recteur Gabriele Fioni et Ary Chalus ; article de Libération ; lacrymogènes aux Abymes, Baie-Mahault, Le Moule."],
      ["2026-10-07", "600 signatures sur greve-petition.pages.dev ; soutien SNES-FSU et SNEP-FSU."],
      ["2026-10-12", "Mobilisation festive et gwoka au lycée Sonny-Rupaire, Sainte-Rose."],
      ["2026-10-25", "Cet article est mis en ligne. Les revendications tiennent toujours."]
    ],
    press: [
      ["Libération, 06/10/2026 — « C'est impossible d'étudier dans ces conditions »", "https://www.liberation.fr/"],
      ["Guadeloupe 1ère (la1ere.franceinfo.fr) — suivi quotidien", "https://la1ere.franceinfo.fr/"],
      ["greve-petition.pages.dev — le site de pétition", "https://greve-petition.pages.dev/"]
    ],
    sourceLabel: "site de pétition", bteLabel: "mes builds", rightsLabel: "droits des images",
    illustrationNote: "illustration pixel-art créée pour cet article — pas une capture des vraies cours (les vraies étaient trop occupées à faire l'histoire)."
  },
  es: {
    byline: "por MaxLananas, publicado el {date} — escrito entre dos clases, como todo lo demás",
    intro: "En octubre de 2026, los liceos de Guadalupe se movilizaron. Yo fui de los que la organizaron en mi liceo —950 estudiantes— y el que programó greve-petition.pages.dev, el sitio que llevó nuestras reivindicaciones y reunió 600 firmas. Aquí está toda la historia, con fechas, nombres y enlaces, porque una entrada de diario no bastaba.",
    sections: [
      { title: "Lunes 5 de octubre: el patio se vuelve parlamento", paragraphs: [
        "Todo empezó el lunes 5 de octubre de 2026, casi a la vez en Petit-Bourg, Basse-Terre, Les Abymes y Sainte-Anne. Los motivos no tenían nada de abstractos: calor insoportable en las aulas, edificios que gotean, cantina agotada, profesores ausentes, horarios que terminan de noche.",
        "En mi liceo, el patio se volvió parlamento en una mañana. 950 estudiantes movilizados en el punto más alto: asambleas entre dos timbres, pancartas manuscritas, delegaciones por clase. Llevé mi cuaderno: conteos, reivindicaciones, promesas. E hice lo que sé hacer: abrir mi editor."
      ] },
      { title: "Lo que reivindicábamos", paragraphs: [
        "El sitio de la petición publicó la lista acordada: soluciones reales contra el calor, edificios renovados, una cantina funcional, reemplazo de profesores ausentes, horarios humanamente vivibles.",
        "Nada revolucionario en el papel. Exactamente por eso funcionó: todo el mundo ya había vivido cada línea."
      ] },
      { title: "Un sitio web como herramienta de movilización", paragraphs: [
        "greve-petition.pages.dev estuvo en línea en los primeros días: reivindicaciones, contador de firmas, muro de apoyo público, archivo de prensa. 600 firmas en pocos días.",
        "Técnicamente, un pequeño sitio estático: Cloudflare Pages, sin base de datos, sin cookies. Políticamente, era todo: un lugar hacia el cual señalar, una cifra que nadie podía inventar por nosotros."
      ] },
      { title: "Frente a las instituciones", paragraphs: [
        "El martes 6 de octubre, unos treinta representantes de los establecimientos movilizados fueron recibidos en el rectorado por el rector Gabriele Fioni, con Ary Chalus, presidente del consejo regional. Las delegaciones llegaron con listas, conteos y fotos.",
        "El mismo día: 35 establecimientos afectados en el archipiélago (21 liceos, 5 colegios, 9 escuelas), y gases lacrimógenos cerca de los liceos de Les Abymes, Baie-Mahault y Le Moule. Los sindicatos apoyaron el movimiento y se depositó un preaviso de huelga nacional. Ese 6 octubre contó 266 000 a 450 000 manifestantes y 891 liceos afectados en toda Francia."
      ] },
      { title: "El archivo de prensa", paragraphs: [
        "Guadeloupe 1ère siguió el movimiento día a día; Canal 10 dio pantalla a los patios; Libération publicó el 6 de octubre un artículo titulado « C'est impossible d'étudier dans ces conditions », citando el liceo Yves-Leborgne de Sainte-Anne.",
        "El lunes 12 de octubre, el liceo Sonny-Rupaire de Sainte-Rose cerró la secuencia con una movilización festiva alrededor del gwoka: tambores, baile, pancartas."
      ] },
      { title: "Lo que me enseñó (y por qué está en un portafolio de Minecraft)", paragraphs: [
        "Construyo puentes en Minecraft y publico mods para gente que nunca conoceré. La movilización fue el mismo músculo a otra escala: organizar, documentar, hablar con la alcaldía, la Región, el rectorado, los periodistas — y sobre todo escuchar a 950 personas que no quieren todas lo mismo.",
        "El sitio sigue en línea. Las reivindicaciones siguen legibles. Se firmen o no, existen: esa es mi definición favorita de trabajo terminado."
      ] }
    ],
    timeline: [
      ["2026-10-05", "Inicio de la movilización: Petit-Bourg, Basse-Terre, Les Abymes, Sainte-Anne. 950 estudiantes en mi liceo."],
      ["2026-10-06", "35 establecimientos afectados; delegaciones recibidas por el rector Gabriele Fioni y Ary Chalus; artículo de Libération."],
      ["2026-10-07", "600 firmas en greve-petition.pages.dev; apoyo sindical."],
      ["2026-10-12", "Movilización festiva y gwoka en el liceo Sonny-Rupaire, Sainte-Rose."],
      ["2026-10-25", "Este artículo se publica. Las reivindicaciones siguen en pie."]
    ],
    press: [
      ["Libération, 06/10/2026 — « C'est impossible d'étudier dans ces conditions »", "https://www.liberation.fr/"],
      ["Guadeloupe 1ère (la1ere.franceinfo.fr) — cobertura diaria", "https://la1ere.franceinfo.fr/"],
      ["greve-petition.pages.dev — el sitio de la petición", "https://greve-petition.pages.dev/"]
    ],
    sourceLabel: "sitio de la petición", bteLabel: "mis builds", rightsLabel: "derechos de imagen",
    illustrationNote: "ilustración pixel-art creada para este artículo — no una captura de los patios reales."
  }
};
