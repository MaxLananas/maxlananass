import { LABELS, CREDITS_COPY, genericLabel } from "../media-i18n.js";

export const LANGS = ["en", "fr", "es"];
export const LOCALES = { en: "en_US", fr: "fr_FR", es: "es_ES" };
export const LANG_LABEL = { en: "English", fr: "Français", es: "Español" };
export const PATH_ALIAS = {
  "/about/": { fr: "/fr/a-propos/", es: "/es/sobre/" },
  "/projects/iprof-redesign/": { fr: "/fr/projets/refonte-iprof/", es: "/es/proyectos/rediseno-iprof/" }
};
export const enPath = (path) => path.replace(/^\/(fr|es)(?=\/)/, "");
export const pathFor = (lang, path) => lang === "en" ? path : (PATH_ALIAS[path]?.[lang] || `/${lang}${path === "/" ? "/" : path}`);

const en = {
  "/": {
    identity: "Minecraft builder & developer",
    intro: "I design interfaces, create Minecraft builds and develop software tools. See my {iprof}, {bte}, {dev} and {about}.",
    galleryHeading: "Minecraft build gallery",
    catalogBrowse: "Browse all {total} screenshots with captions and credits",
    catalogSearch: "Search the gallery",
    empty: "No builds match this search. Try another keyword or filter.",
    noscript: "Browse every screenshot in the {builds}. No JavaScript is needed for the catalogue, project pages or contact links. {archive}.",
    noscriptArchive: "Original image archive",
    introIprof: "iProf redesign",
    introBte: "BuildTheEarth-related work",
    introDev: "development projects",
    introAbout: "creator profile",
    noscriptBuilds: "the HTML build gallery",
    projectsEyebrow: "Interfaces, tools & experiments",
    projectsHeading: "Beyond the blocks",
    projectsIntro: "From the iProf redesign to published Minecraft releases and systems experiments: a closer look at the development side of my work.",
    sectionLinks: "{dev} · {modrinth}",
    sectionLinksDev: "Explore development projects",
    sectionLinksModrinth: "Find my releases on Modrinth",
    processEyebrow: "Process",
    processHeading: "From brief to block",
    process: [
      { title: "Brief", text: "You describe the vision — a real place, a spawn concept, a full server world." },
      { title: "Quote", text: "Transparent scope, timeline and pricing sent within 2 to 24 hours." },
      { title: "Build", text: "Progress shots, WorldEdit precision, constant back-and-forth with you." },
      { title: "Delivery", text: "Final render pass, schematic handoff or direct server integration." }
    ],
    contactEyebrow: "Get in touch",
    contactHeading: "Let's build something together",
    contactIntro: "Custom builds, 1:1 recreations, event spawns and dev tools — commissioned directly, delivered fast.",
    contactCta: "Open a Discord ticket",
    contactNote: "Replies typically within 2 to 24 hours.",
    services: [
      { title: "1:1 Scale", text: "Faithful real-world recreation" },
      { title: "Spawn / Event", text: "Lobbies, maps, event zones" },
      { title: "Organic", text: "Terraforming, nature, biomes" },
      { title: "Dev / Tools", text: "Sites, plugins, pipelines" }
    ],
    faqTitle: "Frequently asked questions",
    faq: [
      { q: "How much does a Minecraft build commission cost?", a: "Pricing depends on scale, complexity and timeline. Send a brief on Discord and you'll receive a transparent, free quote within 2 to 24 hours." },
      { q: "How long does a build take to complete?", a: "Turnaround varies from a few days for small structures to several weeks for monumental or 1:1 scale projects. A realistic timeline is confirmed during the quote stage." },
      { q: "What is a 1:1 scale Minecraft build?", a: "A 1:1 scale build is a faithful recreation of a real-world location, translated block by block at true scale using tools like WorldEdit and real-world elevation data." },
      { q: "Can I commission a build for my server or event?", a: "Yes. Spawn areas, event lobbies, competition maps and full server worlds are all part of the regular commission work." },
      { q: "How do I get started with a commission?", a: "Open a ticket on Discord, describe your project, and you'll receive a reply within 2 to 24 hours." }
    ]
  },
  "/about/": {
    eyebrow: "Minecraft building · Software development",
    p1: "I’m MaxLananas, a Minecraft builder and developer. This portfolio connects my build screenshots, BuildTheEarth-related contributions and the tools I develop for building, navigation and interface creation.",
    p2: "{strong} is the identity used by this portfolio and my GitHub profile. The accounts below link the projects, published work and contact route together.",
    s1Title: "Building and BuildTheEarth",
    s1: "The {builds} preserves each collaboration’s attribution. Work made within BuildTheEarth France is not presented as exclusively my creation. The {bte} connects these images with my tools and unofficial community documentation.",
    s1Builds: "Minecraft screenshot gallery",
    s1Bte: "BuildTheEarth section",
    s2Title: "Interfaces, mods and developer tools",
    s2a: "My {iprof} brings interface work into the portfolio through screenshots and a video. My {modrinth} include Colorflow, Nostalgia Ultra Shader and Sculk Vision.",
    s2aIprof: "iProf redesign",
    s2aModrinth: "Modrinth releases",
    s2b: "{homegui} is a client interface for home commands; {tracebte} is a server-side tutorial; {railway} extends Axiom for path building. {pineapple} explores converting HTML/CSS-like interface descriptions into Java Swing code.",
    s2c: "The {projects} distinguish documented features from limitations and roadmap items. Forks retain the original authors’ credits.",
    s2cProjects: "project pages",
    s3Title: "Profiles and contact",
    s3Items: [
      { label: "MaxLananas on GitHub", text: "code and public repositories." },
      { label: "maxlananass on Modrinth", text: "my published mods, plugins and shaders." },
      { label: "maxlananas.builds on Instagram", text: "published creations." },
      { label: "Contact MaxLananas on Discord", text: "community and project inquiries." }
    ],
    s3Note: "For a commission, describe the location or theme, scale, intended use and delivery format. Read the {process} and {contact} on the homepage.",
    s3NoteProcess: "building process",
    s3NoteContact: "contact information",
    s4Title: "Attribution and independence",
    s4: "This is my personal portfolio, not an official Minecraft, Mojang, Microsoft, BuildTheEarth or Axiom website. Contributing to a collective project does not mean representing its whole team. The creations shown remain the property of their respective owners."
  },
  "/projects/": {
    intro: "A selection of my interface work, published Minecraft projects and software experiments. Releases point to Modrinth; GitHub is used for the public source and lab work.",
    modrinthTitle: "Published on Modrinth",
    modrinthCta: "Visit my complete Modrinth profile →",
    labTitle: "Software lab",
    labIntro: "Systems, tooling and interface experiments. The project pages distinguish prototypes from published products.",
    refsTitle: "Builds and supporting references",
    refsIntro: "The earlier BTE tools, documentation and build collections remain available here, with their attribution preserved."
  },
  "/buildtheearth/": {
    p1: "BuildTheEarth is a collaborative effort to recreate real places in Minecraft. My portfolio includes work credited to BuildTheEarth France alongside tools and documentation for related building workflows.",
    p2: "This page presents {strong}, not an official BuildTheEarth service or a claim to represent the project. For the wider initiative and teams, visit {bte}.",
    p2Strong: "my contributions and projects",
    p2Bte: "the BuildTheEarth website",
    s1Title: "From geographic references to Minecraft builds",
    s1: "Working from a real location involves more than its appearance. Builders need to identify the place, understand the projected world, lay out a footprint and make recurring decisions about details and infrastructure. My tools address different parts of that workflow rather than one automatic solution.",
    s1Items: [
      { slug: "tracebte", label: "TraceBTE teaches a tracing workflow", after: "using GPS and WorldEdit." },
      { slug: "bte-distortion-calculator", label: "The BTE Distorsion Calculator explores local scale", after: "and its model assumptions." },
      { slug: "railway-tools-axiom", label: "Railway Tools for Axiom lays out paths", after: "using control points." },
      { slug: "bte-france-guidelines", label: "The unofficial French guidelines organize building references", after: "without claiming to replace team decisions." }
    ],
    s2Title: "Projects and credited work",
    s3Title: "Shared work needs clear credits",
    s3: "A screenshot is not proof of sole authorship of the entire world around it. The {builds} keeps credits beside the images, and the {bu} names its upstream authors. Refer to each project’s source for its current scope and requirements.",
    s3Builds: "photo catalogue",
    s3Bu: "BuildersUtilities adaptation",
    s3Links: "{about} · {guide}",
    s3LinksAbout: "About MaxLananas",
    s3LinksGuide: "Choose between a mod, plugin and addon"
  },
  "/development/": {
    intro: "Interfaces, Minecraft releases and software experiments by {about}. Explore the iProf redesign, then the published projects and the lab.",
    introAbout: "MaxLananas",
    navAria: "Development categories",
    navInterface: "Interface design",
    navReleases: "Modrinth releases",
    navLab: "Software lab",
    interfaceLabel: "Interface work",
    releasesEyebrow: "Published projects",
    releasesTitle: "Minecraft, through my tools",
    releases: "Color palettes, music interfaces, chunk visualization, shader design and server tools. Modrinth is the main place to find the right release for your version.",
    releasesLinks: "{modrinth} · {guide}",
    releasesLinksModrinth: "All my releases on Modrinth ↗",
    releasesLinksGuide: "Mods, plugins and addons: which environment?",
    labEyebrow: "Beyond Minecraft",
    labTitle: "The software lab",
    lab: "SENTINEL explores defensive monitoring in Go, MaxOS explores a small x86 boot and kernel environment with AI-assisted development, and PineappleUI connects interface descriptions to generated Swing code, and Riptide converts Minecraft builds between versions directly in the browser.",
    labLinks: "{github}",
    labLinksGithub: "Explore the rest of my GitHub repositories ↗",
    refsTitle: "Building-related references",
    refs: "My BTE-specific tutorials, community documentation and adapted tools have their own context in the {bte}. They remain accessible without taking over the main development selection.",
    refsBte: "BuildTheEarth section"
  },
  "/guides/minecraft-mods-plugins-addons/": {
    intro: "A Minecraft tool can have a familiar-looking interface while running in a completely different place from another tool. Before downloading a JAR, work out whether it belongs on your client, on the server, or inside the environment of another mod. This guide uses projects from my portfolio to make those boundaries concrete.",
    compareTitle: "A quick comparison",
    tableAria: "Tool environment comparison",
    tableCaption: "Documented environments of the featured tools",
    thProject: "Project",
    thRuns: "Runs in",
    thBoundary: "Important boundary",
    rows: [
      { slug: "homegui", label: "HomeGUI", runs: "Fabric client", boundary: "The server still owns the home commands and permissions." },
      { slug: "tracebte", label: "TraceBTE", runs: "Paper server", boundary: "The tutorial needs the documented server tools." },
      { slug: "railway-tools-axiom", label: "Railway Tools", runs: "Fabric client with Axiom", boundary: "Axiom is a separate required dependency." },
      { slug: "bte-distortion-calculator", label: "BTE calculator", runs: "Browser", boundary: "Projection inputs and model state affect interpretation." },
      { slug: "riptide", label: "Riptide", runs: "Browser (server-side conversion)", boundary: "Conversion remaps blocks; read the equivalence report before using the result." }
    ],
    sections: [
      { title: "A client mod can organize information without owning the server feature", body: ["HomeGUI is a useful example. It reads a server’s response to {code} and makes the destinations searchable in a client interface. Its installation belongs in a matching Fabric setup, but the underlying teleportation behavior belongs to the server.", "The practical question before installing: does your server already provide the command this interface organizes? If it does not, a client mod cannot add it, and a server-side plugin or a different server configuration is the right layer."] },
      { title: "A server plugin changes the shared server environment", body: ["TraceBTE runs inside a Paper server and guides builders through a tracing sequence with server commands. Everyone connected to that server experiences the tutorial, and the server owner controls installation, permissions and versions.", "Server-side also means server-side responsibilities: Java and FastAsyncWorldEdit versions, restarts after installation and compatibility with the rest of the plugin list are part of the documented setup."] },
      { title: "An addon depends on the host tool it extends", body: ["Railway Tools for Axiom is neither a standalone mod nor a server plugin: it extends Axiom’s builder environment with a rail-path tool. Axiom remains a separate required dependency with its own installation and permissions.", "When comparing tools, name the host environment explicitly. An addon’s requirements include the host mod’s version, which is why the project page lists Fabric, Fabric API and Axiom together."] },
      { title: "Some building tools do not run inside Minecraft at all", body: ["The BTE Distorsion Calculator runs in a browser and explores projection scale with geographic inputs. BuildersUtilities-style server plugins, PineappleUI’s transpiler and other repository tools each live in their own runtime.", "Keeping those boundaries visible prevents the most common installation mistake: placing a file in a mods or plugins directory when the project documents a different environment entirely."] },
      { title: "Before installing or reporting a problem", steps: ["Identify where the project runs: client, server, host addon or browser.","Check its current Minecraft, Java, loader and dependency requirements.","Distinguish the tool’s interface from permissions and services controlled elsewhere.","Test a small, reproducible case and include version information in an issue.","Read the project’s source and license, including upstream credits for a fork."], closing: "These are distinctions supported by the linked project documentation, not compatibility guarantees for future releases. Start from the {dev} and follow the current repository links for installation details.", closingDev: "development catalogue" }
    ]
  },
  "/builds/": {
    intro1: "Screenshots {first}–{last} of {total}. This catalogue keeps every original image and its existing collaboration credit. Multiple views can belong to the same build; the image count is not a count of independent projects.",
    intro2: "Every page and image link works without JavaScript. For filters and the lightbox, use {gallery}; for context, read {lemans} or {bte}.",
    intro2Gallery: "the interactive gallery",
    intro2Lemans: "the Le Mans collection",
    intro2Bte: "the BuildTheEarth overview",
    creditsTitle: "Image credits and original files",
    credits1: "Named images use descriptions supported by the portfolio catalogue. Unnamed captures are left as numbered screenshots rather than assigning an unverified location or project. The original-file links may download a large image; screenshots are not world or schematic downloads.",
    credits2: "The creations shown remain the property of their respective owners. {about}",
    credits2About: "Read about MaxLananas and attribution.",
    imageMeta: "Image {index} · {file}",
    captionDefault: "From MaxLananas’s personal build portfolio."
  },
  "/search/": {
    intro: "Search screenshots by subject, filename or collaboration. For software, see {projects}; without JavaScript, use {builds}.",
    introProjects: "the project catalogue",
    introBuilds: "the paginated build gallery"
  },
  shared: {
    spotlightEyebrow: "Featured interface project",
    spotlightKind: "PHP · CSS · JavaScript",
    spotlightVisuals: "11 presentation visuals · video walkthrough",
    spotlightCta: "Explore the redesign →",
    spotlightDisclaimer: "Independent redesign · fictitious demonstration data",
    spotlightAria: "Explore the iProf interface redesign",
    spotlightAlt: "iProf 2026 — MaxLananas’s interface redesign presentation",
    spotlightCopy: "A teacher portal rethought as a coherent service: dashboard, career, mobility, documents and messaging.",
    publishedEyebrow: "Published on Modrinth",
    githubLabEyebrow: "GitHub lab",
    modrinthLink: "Modrinth releases ↗"
  },
  notFound: {
    description: "This page was not found. Return to MaxLananas’s portfolio, project catalogue or Minecraft screenshot gallery.",
    title: "404 — Page not found | MaxLananas",
    heading: "404",
    body: "This build was never placed. The page you're looking for doesn't exist.",
    home: "Back to portfolio",
    projects: "Project catalogue",
    gallery: "Minecraft gallery",
    contact: "Contact"
  }
};

const fr = {
  "/": {
    identity: "Builder Minecraft & développeur",
    intro: "Je conçois des interfaces, je crée des constructions Minecraft et je développe des outils logiciels. Découvrez ma {iprof}, mon {bte}, mes {dev} et mon {about}.",
    galleryHeading: "Galerie de constructions Minecraft",
    catalogBrowse: "Parcourir les {total} captures avec légendes et crédits",
    catalogSearch: "Rechercher dans la galerie",
    empty: "Aucun build ne correspond à cette recherche. Essayez un autre mot-clé ou un autre filtre.",
    noscript: "Parcourez toutes les captures dans {builds}. Le catalogue, les fiches projets et les liens de contact fonctionnent sans JavaScript. {archive}.",
    noscriptArchive: "Archive des images originales",
    introIprof: "refonte iProf",
    introBte: "travail lié à BuildTheEarth",
    introDev: "projets de développement",
    introAbout: "profil du créateur",
    noscriptBuilds: "la galerie de builds HTML",
    projectsEyebrow: "Interfaces, outils & expérimentations",
    projectsHeading: "Au-delà des blocs",
    projectsIntro: "De la refonte iProf aux publications Minecraft et aux expérimentations système : un regard rapproché sur la partie développement de mon travail.",
    sectionLinks: "{dev} · {modrinth}",
    sectionLinksDev: "Explorer les projets de développement",
    sectionLinksModrinth: "Retrouver mes versions sur Modrinth",
    processEyebrow: "Méthode",
    processHeading: "Du brief au bloc",
    process: [
      { title: "Brief", text: "Vous décrivez la vision — un lieu réel, un concept de spawn, un monde serveur complet." },
      { title: "Devis", text: "Périmètre, délai et tarif transparents envoyés sous 2 à 24 heures." },
      { title: "Construction", text: "Captures d’avancement, précision WorldEdit, échanges constants avec vous." },
      { title: "Livraison", text: "Rendu final, remise du schematic ou intégration directe sur le serveur." }
    ],
    contactEyebrow: "Contact",
    contactHeading: "Construisons quelque chose ensemble",
    contactIntro: "Builds sur mesure, reproductions 1:1, spawns d’événement et outils de développement — en direct, livrés rapidement.",
    contactCta: "Ouvrir un ticket Discord",
    contactNote: "Réponse généralement sous 2 à 24 heures.",
    services: [
      { title: "Échelle 1:1", text: "Reproduction fidèle de lieux réels" },
      { title: "Spawn / Événement", text: "Lobbies, maps, zones d’événement" },
      { title: "Organique", text: "Terraforming, nature, biomes" },
      { title: "Dev / Outils", text: "Sites, plugins, pipelines" }
    ],
    faqTitle: "Questions fréquentes",
    faq: [
      { q: "Combien coûte une commande de build Minecraft ?", a: "Le tarif dépend de l’échelle, de la complexité et du délai. Envoyez un brief sur Discord : vous recevez un devis gratuit et transparent sous 2 à 24 heures." },
      { q: "Combien de temps faut-il pour terminer un build ?", a: "Le délai varie de quelques jours pour de petites structures à plusieurs semaines pour des projets monumentaux ou à l’échelle 1:1. Un délai réaliste est confirmé lors du devis." },
      { q: "Qu’est-ce qu’un build Minecraft à l’échelle 1:1 ?", a: "Un build 1:1 est la reproduction fidèle d’un lieu réel, traduite bloc par bloc à taille réelle avec des outils comme WorldEdit et des données d’altitude réelles." },
      { q: "Puis-je commander un build pour mon serveur ou mon événement ?", a: "Oui. Zones de spawn, lobbies d’événement, maps de compétition et mondes serveurs complets font partie des commandes habituelles." },
      { q: "Comment démarrer une commande ?", a: "Ouvrez un ticket sur Discord, décrivez votre projet : vous recevez une réponse sous 2 à 24 heures." }
    ]
  },
  "/about/": {
    eyebrow: "Créations Minecraft · Développement",
    p1: "Je suis MaxLananas, créateur de constructions Minecraft et développeur. Ce portfolio relie mes captures de builds, mes contributions autour de BuildTheEarth et les outils que je développe pour construire, naviguer ou créer des interfaces.",
    p2: "Le même nom, {strong}, identifie ce portfolio et mon profil GitHub. Les liens ci-dessous permettent de retrouver mes dépôts, mes publications et le point de contact du portfolio.",
    s1Title: "Construction et BuildTheEarth",
    s1: "La {builds} conserve les crédits des projets collaboratifs. Les images réalisées dans le cadre de BuildTheEarth France ne sont pas présentées comme des créations exclusivement personnelles. La rubrique {bte} relie ces images à mes outils et à ma documentation communautaire non officielle.",
    s1Builds: "galerie de constructions",
    s1Bte: "BuildTheEarth",
    s2Title: "Interfaces, mods et développement",
    s2a: "Ma {iprof} présente une interface pour les parcours des personnels, avec captures et vidéo. Mes créations publiées sur {modrinth} incluent Colorflow, Nostalgia Ultra Shader et Sculk Vision.",
    s2aIprof: "refonte d’iProf",
    s2aModrinth: "Modrinth",
    s2b: "{homegui} est une interface client pour les commandes de homes ; {tracebte} est un tutoriel côté serveur ; {railway} complète Axiom pour tracer des voies. {pineapple} explore le passage d’une description d’interface de type HTML/CSS à du code Java Swing.",
    s2c: "Les {projects} distinguent les fonctionnalités documentées des limites et des éléments de roadmap. Les forks restent crédités à leurs auteurs d’origine.",
    s2cProjects: "fiches de projets, rédigées en anglais",
    s3Title: "Profils et contact",
    s3Items: [
      { label: "MaxLananas sur GitHub", text: "code et dépôts publics." },
      { label: "maxlananass sur Modrinth", text: "mes mods, plugins et shaders publiés." },
      { label: "maxlananas.builds sur Instagram", text: "publications de créations." },
      { label: "Contacter MaxLananas sur Discord", text: "communauté et demandes de projets." }
    ],
    s3Note: "Pour discuter d’une commande, précise le lieu ou le thème, l’échelle, l’usage attendu et le format de livraison. {process} et {contact} sont disponibles sur l’accueil.",
    s3NoteProcess: "La méthode de travail",
    s3NoteContact: "les informations de contact",
    s4Title: "Attribution et indépendance",
    s4: "Ce site est mon portfolio personnel, pas un site officiel de Minecraft, Mojang, Microsoft, BuildTheEarth ou Axiom. La participation à un projet collectif ne signifie pas que je représente toute l’équipe. Les droits sur les créations présentées restent ceux de leurs auteurs respectifs."
  },
  "/projects/": {
    intro: "Une sélection de mon travail d’interface, de mes projets Minecraft publiés et de mes expérimentations logicielles. Les versions pointent vers Modrinth ; GitHub accueille les sources publiques et le lab.",
    modrinthTitle: "Publiés sur Modrinth",
    modrinthCta: "Voir mon profil Modrinth complet →",
    labTitle: "Lab logiciel",
    labIntro: "Systèmes, outillage et expérimentations d’interface. Les fiches distinguent prototypes et produits publiés.",
    refsTitle: "Builds et références associées",
    refsIntro: "Les outils BTE, la documentation et les collections de builds restent disponibles ici, avec leur attribution préservée."
  },
  "/buildtheearth/": {
    p1: "BuildTheEarth est un projet collaboratif qui recrée des lieux réels dans Minecraft. Mon portfolio comprend des travaux crédités BuildTheEarth France ainsi que des outils et une documentation pour les méthodes de construction associées.",
    p2: "Cette page présente {strong}, pas un service officiel BuildTheEarth ni une prétention à représenter le projet. Pour le projet global et ses équipes, visitez {bte}.",
    p2Strong: "mes contributions et mes projets",
    p2Bte: "le site BuildTheEarth",
    s1Title: "Des références géographiques aux builds Minecraft",
    s1: "Travailler depuis un lieu réel demande plus que son apparence. Il faut identifier l’endroit, comprendre le monde projeté, tracer une emprise et trancher des détails récurrents d’infrastructure. Mes outils couvrent différentes étapes de cette méthode plutôt qu’une solution automatique unique.",
    s1Items: [
      { slug: "tracebte", label: "TraceBTE apprend la méthode de tracé", after: "avec GPS et WorldEdit." },
      { slug: "bte-distortion-calculator", label: "Le BTE Distorsion Calculator explore l’échelle locale", after: "et ses hypothèses de modèle." },
      { slug: "railway-tools-axiom", label: "Railway Tools for Axiom trace des voies", after: "à partir de points de contrôle." },
      { slug: "bte-france-guidelines", label: "Les directives françaises non officielles organisent les références", after: "sans remplacer les décisions d’équipe." }
    ],
    s2Title: "Projets et travaux crédités",
    s3Title: "Le travail partagé exige des crédits clairs",
    s3: "Une capture ne prouve pas la paternité exclusive du monde qui l’entoure. Le {builds} conserve les crédits à côté des images, et l’{bu} nomme ses auteurs amont. Consultez la source de chaque projet pour son périmètre et ses prérequis actuels.",
    s3Builds: "catalogue photo",
    s3Bu: "adaptation BuildersUtilities",
    s3Links: "{about} · {guide}",
    s3LinksAbout: "À propos de MaxLananas",
    s3LinksGuide: "Choisir entre mod, plugin et addon"
  },
  "/development/": {
    intro: "Interfaces, publications Minecraft et expérimentations logicielles par {about}. Explorez la refonte iProf, puis les projets publiés et le lab.",
    introAbout: "MaxLananas",
    navAria: "Catégories de développement",
    navInterface: "Design d’interface",
    navReleases: "Versions Modrinth",
    navLab: "Lab logiciel",
    interfaceLabel: "Travail d’interface",
    releasesEyebrow: "Projets publiés",
    releasesTitle: "Minecraft, à travers mes outils",
    releases: "Palettes de couleurs, interfaces musicales, visualisation de chunks, design de shader et outils serveur. Modrinth est le meilleur endroit pour trouver la version adaptée à la vôtre.",
    releasesLinks: "{modrinth} · {guide}",
    releasesLinksModrinth: "Toutes mes versions sur Modrinth ↗",
    releasesLinksGuide: "Mods, plugins et addons : quel environnement ?",
    labEyebrow: "Au-delà de Minecraft",
    labTitle: "Le lab logiciel",
    lab: "SENTINEL explore la surveillance défensive en Go, MaxOS explore un petit environnement de boot et de noyau x86 développé avec assistance IA, et PineappleUI relie des descriptions d’interface à du code Swing généré, et Riptide convertit des builds Minecraft entre versions directement dans le navigateur.",
    labLinks: "{github}",
    labLinksGithub: "Explorer mes autres dépôts GitHub ↗",
    refsTitle: "Références liées à la construction",
    refs: "Mes tutoriels BTE, ma documentation communautaire et mes outils adaptés ont leur propre contexte dans la {bte}. Ils restent accessibles sans envahir la sélection principale.",
    refsBte: "rubrique BuildTheEarth"
  },
  "/guides/minecraft-mods-plugins-addons/": {
    intro: "Un outil Minecraft peut avoir une interface familière tout en s’exécutant dans un endroit complètement différent d’un autre outil. Avant de télécharger un JAR, déterminez s’il appartient à votre client, au serveur, ou à l’environnement d’un autre mod. Ce guide s’appuie sur mes projets pour rendre ces frontières concrètes.",
    compareTitle: "Comparaison rapide",
    tableAria: "Comparaison des environnements d’outils",
    tableCaption: "Environnements documentés des outils présentés",
    thProject: "Projet",
    thRuns: "S’exécute dans",
    thBoundary: "Frontière importante",
    rows: [
      { slug: "homegui", label: "HomeGUI", runs: "Client Fabric", boundary: "Le serveur garde les commandes et permissions de homes." },
      { slug: "tracebte", label: "TraceBTE", runs: "Serveur Paper", boundary: "Le tutoriel nécessite les outils serveur documentés." },
      { slug: "railway-tools-axiom", label: "Railway Tools", runs: "Client Fabric avec Axiom", boundary: "Axiom est une dépendance requise séparée." },
      { slug: "bte-distortion-calculator", label: "BTE calculator", runs: "Navigateur", boundary: "Les entrées de projection et l’état du modèle influencent l’interprétation." },
      { slug: "riptide", label: "Riptide", runs: "Navigateur (conversion serveur)", boundary: "La conversion remappe les blocs ; lisez le rapport d’équivalence avant d’exploiter le résultat." }
    ],
    sections: [
      { title: "Un mod client organise l’information sans posséder la fonction serveur", body: ["HomeGUI en est un bon exemple. Il lit la réponse du serveur à {code} et rend les destinations recherchables dans une interface client. Son installation relève d’un setup Fabric adapté, mais le comportement de téléportation appartient au serveur.", "La question pratique avant d’installer : votre serveur fournit-il déjà la commande que cette interface organise ? Sinon, aucun mod client ne peut l’ajouter : c’est un plugin serveur ou une configuration serveur différente qui constitue la bonne couche."] },
      { title: "Un plugin serveur modifie l’environnement partagé", body: ["TraceBTE s’exécute dans un serveur Paper et guide les builders dans une séquence de tracé avec des commandes serveur. Toutes les personnes connectées vivent le tutoriel, et le propriétaire du serveur contrôle installation, permissions et versions.", "Côté serveur signifie aussi responsabilités côté serveur : versions de Java et de FastAsyncWorldEdit, redémarrage après installation et compatibilité avec le reste de la liste de plugins font partie du setup documenté."] },
      { title: "Un addon dépend de l’outil hôte qu’il prolonge", body: ["Railway Tools for Axiom n’est ni un mod autonome ni un plugin serveur : il prolonge l’environnement de construction d’Axiom avec un outil de tracé ferroviaire. Axiom reste une dépendance requise séparée, avec sa propre installation et ses permissions.", "Pour comparer des outils, nommez explicitement l’environnement hôte. Les prérequis d’un addon incluent la version du mod hôte : c’est pourquoi la fiche liste Fabric, Fabric API et Axiom ensemble."] },
      { title: "Certains outils de construction ne tournent pas dans Minecraft", body: ["Le BTE Distorsion Calculator s’exécute dans un navigateur et explore l’échelle de projection avec des entrées géographiques. Les plugins serveur de type BuildersUtilities, le transpileur PineappleUI et d’autres outils de dépôt vivent chacun dans leur propre runtime.", "Garder ces frontières visibles évite l’erreur d’installation la plus courante : placer un fichier dans un dossier mods ou plugins alors que le projet documente un environnement totalement différent."] },
      { title: "Avant d’installer ou de signaler un problème", steps: ["Identifiez où tourne le projet : client, serveur, addon d’un outil hôte ou navigateur.","Vérifiez ses prérequis actuels : Minecraft, Java, loader et dépendances.","Distinguez l’interface de l’outil des permissions et services contrôlés ailleurs.","Testez un cas petit et reproductible, et joignez les informations de version à un signalement.","Lisez la source et la licence du projet, y compris les crédits amont pour un fork."], closing: "Ce sont des distinctions soutenues par la documentation liée des projets, pas des garanties de compatibilité pour les futures versions. Partez du {dev} et suivez les liens de dépôt actuels pour les détails d’installation.", closingDev: "catalogue de développement" }
    ]
  },
  "/builds/": {
    intro1: "Captures {first}–{last} sur {total}. Ce catalogue conserve chaque image originale et son crédit de collaboration existant. Plusieurs vues peuvent appartenir au même build : le nombre d’images n’est pas un nombre de projets indépendants.",
    intro2: "Chaque lien de page et d’image fonctionne sans JavaScript. Pour les filtres et la visionneuse, utilisez {gallery} ; pour le contexte, lisez {lemans} ou {bte}.",
    intro2Gallery: "la galerie interactive",
    intro2Lemans: "la collection Le Mans",
    intro2Bte: "l’aperçu BuildTheEarth",
    creditsTitle: "Crédits des images et fichiers originaux",
    credits1: "Les images nommées utilisent les descriptions soutenues par le catalogue du portfolio. Les captures anonymes restent des captures numérotées plutôt que de recevoir un lieu ou un projet non vérifié. Les liens vers les fichiers originaux peuvent télécharger une image lourde ; ces captures ne sont pas des mondes ni des schematics.",
    credits2: "Les créations présentées restent la propriété de leurs auteurs respectifs. {about}",
    credits2About: "Lire à propos de MaxLananas et de l’attribution.",
    imageMeta: "Image {index} · {file}",
    captionDefault: "Issue du portfolio personnel de MaxLananas."
  },
  "/search/": {
    intro: "Recherchez les captures par sujet, nom de fichier ou collaboration. Pour les logiciels, voir {projects} ; sans JavaScript, utilisez {builds}.",
    introProjects: "le catalogue de projets",
    introBuilds: "la galerie paginée"
  },
  shared: {
    spotlightEyebrow: "Projet d’interface à la une",
    spotlightKind: "PHP · CSS · JavaScript",
    spotlightVisuals: "11 visuels de présentation · vidéo de démonstration",
    spotlightCta: "Explorer la refonte →",
    spotlightDisclaimer: "Refonte indépendante · données de démonstration fictives",
    spotlightAria: "Explorer la refonte d’interface iProf",
    spotlightAlt: "iProf 2026 — présentation de la refonte d’interface par MaxLananas",
    spotlightCopy: "Un portail enseignant repensé comme un service cohérent : tableau de bord, carrière, mobilité, documents et messagerie.",
    publishedEyebrow: "Publié sur Modrinth",
    githubLabEyebrow: "Lab GitHub",
    modrinthLink: "Versions sur Modrinth ↗"
  },
  notFound: {
    description: "Cette page est introuvable. Revenez au portfolio de MaxLananas, au catalogue de projets ou à la galerie de captures Minecraft.",
    title: "404 — Page introuvable | MaxLananas",
    heading: "404",
    body: "Ce build n’a jamais été placé. La page demandée n’existe pas.",
    home: "Retour au portfolio",
    projects: "Catalogue de projets",
    gallery: "Galerie Minecraft",
    contact: "Contact"
  }
};

const es = {
  "/": {
    identity: "Builder de Minecraft y desarrollador",
    intro: "Diseño interfaces, creo construcciones de Minecraft y desarrollo herramientas de software. Descubre mi {iprof}, mi {bte}, mis {dev} y mi {about}.",
    galleryHeading: "Galería de construcciones de Minecraft",
    catalogBrowse: "Ver las {total} capturas con leyendas y créditos",
    catalogSearch: "Buscar en la galería",
    empty: "Ningún build coincide con esta búsqueda. Prueba otra palabra clave u otro filtro.",
    noscript: "Recorre todas las capturas en {builds}. El catálogo, las fichas de proyecto y los enlaces de contacto funcionan sin JavaScript. {archive}.",
    noscriptArchive: "Archivo de imágenes originales",
    introIprof: "rediseño de iProf",
    introBte: "trabajo relacionado con BuildTheEarth",
    introDev: "proyectos de desarrollo",
    introAbout: "perfil del creador",
    noscriptBuilds: "la galería de builds en HTML",
    projectsEyebrow: "Interfaces, herramientas y experimentos",
    projectsHeading: "Más allá de los bloques",
    projectsIntro: "Del rediseño de iProf a las publicaciones en Minecraft y los experimentos de sistemas: una mirada cercana al lado de desarrollo de mi trabajo.",
    sectionLinks: "{dev} · {modrinth}",
    sectionLinksDev: "Explorar los proyectos de desarrollo",
    sectionLinksModrinth: "Ver mis versiones en Modrinth",
    processEyebrow: "Método",
    processHeading: "Del brief al bloque",
    process: [
      { title: "Brief", text: "Describes la visión: un lugar real, un concepto de spawn o un mundo de servidor completo." },
      { title: "Presupuesto", text: "Alcance, plazo y precio transparentes enviados en 2 a 24 horas." },
      { title: "Construcción", text: "Capturas de avance, precisión con WorldEdit y diálogo constante contigo." },
      { title: "Entrega", text: "Render final, entrega del schematic o integración directa en el servidor." }
    ],
    contactEyebrow: "Contacto",
    contactHeading: "Construyamos algo juntos",
    contactIntro: "Builds a medida, recreaciones 1:1, spawns de evento y herramientas de desarrollo: encargos directos, entrega rápida.",
    contactCta: "Abrir un ticket en Discord",
    contactNote: "Respuesta habitual en 2 a 24 horas.",
    services: [
      { title: "Escala 1:1", text: "Recreación fiel de lugares reales" },
      { title: "Spawn / Evento", text: "Lobbies, mapas, zonas de evento" },
      { title: "Orgánico", text: "Terraforming, naturaleza, biomas" },
      { title: "Dev / Herramientas", text: "Sitios, plugins, pipelines" }
    ],
    faqTitle: "Preguntas frecuentes",
    faq: [
      { q: "¿Cuánto cuesta un encargo de build en Minecraft?", a: "El precio depende de la escala, la complejidad y el plazo. Envía un brief por Discord y recibirás un presupuesto gratuito y transparente en 2 a 24 horas." },
      { q: "¿Cuánto tarda en completarse un build?", a: "El plazo varía de unos días para estructuras pequeñas a varias semanas para proyectos monumentales o a escala 1:1. El plazo realista se confirma en la fase de presupuesto." },
      { q: "¿Qué es un build de Minecraft a escala 1:1?", a: "Un build 1:1 es la recreación fiel de un lugar real, traducida bloque a bloque a tamaño real con herramientas como WorldEdit y datos de elevación reales." },
      { q: "¿Puedo encargar un build para mi servidor o evento?", a: "Sí. Zonas de spawn, lobbies de evento, mapas de competición y mundos de servidor completos forman parte de los encargos habituales." },
      { q: "¿Cómo empiezo un encargo?", a: "Abre un ticket en Discord, describe tu proyecto y recibirás respuesta en 2 a 24 horas." }
    ]
  },
  "/about/": {
    eyebrow: "Construcciones Minecraft · Desarrollo",
    p1: "Soy MaxLananas, creador de construcciones de Minecraft y desarrollador. Este portfolio reúne mis capturas de builds, mis contribuciones alrededor de BuildTheEarth y las herramientas que desarrollo para construir, navegar o crear interfaces.",
    p2: "El mismo nombre, {strong}, identifica este portfolio y mi perfil de GitHub. Los enlaces siguientes permiten encontrar mis repositorios, mis publicaciones y el punto de contacto del portfolio.",
    s1Title: "Construcción y BuildTheEarth",
    s1: "La {builds} conserva los créditos de los proyectos colaborativos. El trabajo realizado dentro de BuildTheEarth France no se presenta como creación exclusivamente personal. La sección {bte} conecta estas imágenes con mis herramientas y mi documentación comunitaria no oficial.",
    s1Builds: "galería de construcciones",
    s1Bte: "BuildTheEarth",
    s2Title: "Interfaces, mods y desarrollo",
    s2a: "Mi {iprof} aporta el trabajo de interfaz al portfolio con capturas y vídeo. Mis creaciones publicadas en {modrinth} incluyen Colorflow, Nostalgia Ultra Shader y Sculk Vision.",
    s2aIprof: "rediseño de iProf",
    s2aModrinth: "Modrinth",
    s2b: "{homegui} es una interfaz cliente para los comandos de homes; {tracebte} es un tutorial del lado del servidor; {railway} amplía Axiom para trazar vías. {pineapple} explora la conversión de descripciones de interfaz tipo HTML/CSS a código Java Swing.",
    s2c: "Las {projects} distinguen las funciones documentadas de los límites y de los elementos de roadmap. Los forks conservan el crédito de sus autores originales.",
    s2cProjects: "fichas de proyecto, redactadas en inglés",
    s3Title: "Perfiles y contacto",
    s3Items: [
      { label: "MaxLananas en GitHub", text: "código y repositorios públicos." },
      { label: "maxlananass en Modrinth", text: "mis mods, plugins y shaders publicados." },
      { label: "maxlananas.builds en Instagram", text: "publicaciones de creaciones." },
      { label: "Contactar con MaxLananas en Discord", text: "comunidad y solicitudes de proyectos." }
    ],
    s3Note: "Para un encargo, describe el lugar o el tema, la escala, el uso previsto y el formato de entrega. {process} y {contact} están disponibles en la portada.",
    s3NoteProcess: "El método de trabajo",
    s3NoteContact: "la información de contacto",
    s4Title: "Atribución e independencia",
    s4: "Este es mi portfolio personal, no un sitio oficial de Minecraft, Mojang, Microsoft, BuildTheEarth o Axiom. Participar en un proyecto colectivo no significa representar a todo el equipo. Las creaciones mostradas siguen siendo propiedad de sus respectivos autores."
  },
  "/projects/": {
    intro: "Una selección de mi trabajo de interfaz, mis proyectos publicados en Minecraft y mis experimentos de software. Las versiones apuntan a Modrinth; GitHub acoge el código público y el laboratorio.",
    modrinthTitle: "Publicados en Modrinth",
    modrinthCta: "Ver mi perfil completo de Modrinth →",
    labTitle: "Laboratorio de software",
    labIntro: "Sistemas, herramientas y experimentos de interfaz. Las fichas distinguen prototipos de productos publicados.",
    refsTitle: "Builds y referencias asociadas",
    refsIntro: "Las herramientas BTE, la documentación y las colecciones de builds siguen disponibles aquí, con su atribución preservada."
  },
  "/buildtheearth/": {
    p1: "BuildTheEarth es un esfuerzo colaborativo para recrear lugares reales en Minecraft. Mi portfolio incluye trabajo acreditado a BuildTheEarth France junto con herramientas y documentación para los flujos de construcción asociados.",
    p2: "Esta página presenta {strong}, no un servicio oficial de BuildTheEarth ni una pretensión de representar al proyecto. Para la iniciativa global y sus equipos, visita {bte}.",
    p2Strong: "mis contribuciones y proyectos",
    p2Bte: "el sitio de BuildTheEarth",
    s1Title: "De las referencias geográficas a los builds de Minecraft",
    s1: "Trabajar desde un lugar real implica más que su apariencia. Hay que identificar el sitio, comprender el mundo proyectado, trazar una planta y tomar decisiones recurrentes sobre detalles e infraestructura. Mis herramientas cubren distintas partes de ese flujo en lugar de una solución automática única.",
    s1Items: [
      { slug: "tracebte", label: "TraceBTE enseña el método de trazado", after: "con GPS y WorldEdit." },
      { slug: "bte-distortion-calculator", label: "El BTE Distorsion Calculator explora la escala local", after: "y sus supuestos de modelo." },
      { slug: "railway-tools-axiom", label: "Railway Tools for Axiom traza vías", after: "con puntos de control." },
      { slug: "bte-france-guidelines", label: "Las directrices francesas no oficiales organizan las referencias", after: "sin sustituir las decisiones del equipo." }
    ],
    s2Title: "Proyectos y trabajo acreditado",
    s3Title: "El trabajo compartido necesita créditos claros",
    s3: "Una captura no prueba la autoría exclusiva del mundo que la rodea. El {builds} mantiene los créditos junto a las imágenes, y la {bu} nombra a sus autores originales. Consulta la fuente de cada proyecto para conocer su alcance y requisitos actuales.",
    s3Builds: "catálogo fotográfico",
    s3Bu: "adaptación de BuildersUtilities",
    s3Links: "{about} · {guide}",
    s3LinksAbout: "Sobre MaxLananas",
    s3LinksGuide: "Elegir entre mod, plugin y addon"
  },
  "/development/": {
    intro: "Interfaces, publicaciones en Minecraft y experimentos de software de {about}. Explora el rediseño de iProf y después los proyectos publicados y el laboratorio.",
    introAbout: "MaxLananas",
    navAria: "Categorías de desarrollo",
    navInterface: "Diseño de interfaz",
    navReleases: "Versiones en Modrinth",
    navLab: "Laboratorio de software",
    interfaceLabel: "Trabajo de interfaz",
    releasesEyebrow: "Proyectos publicados",
    releasesTitle: "Minecraft, a través de mis herramientas",
    releases: "Paletas de color, interfaces musicales, visualización de chunks, diseño de shaders y herramientas de servidor. Modrinth es el mejor lugar para encontrar la versión adecuada a la tuya.",
    releasesLinks: "{modrinth} · {guide}",
    releasesLinksModrinth: "Todas mis versiones en Modrinth ↗",
    releasesLinksGuide: "Mods, plugins y addons: ¿qué entorno?",
    labEyebrow: "Más allá de Minecraft",
    labTitle: "El laboratorio de software",
    lab: "SENTINEL explora la monitorización defensiva en Go, MaxOS explora un pequeño entorno de arranque y kernel x86 con desarrollo asistido por IA, y PineappleUI conecta descripciones de interfaz con código Swing generado, y Riptide convierte builds de Minecraft entre versiones directamente en el navegador.",
    labLinks: "{github}",
    labLinksGithub: "Explorar el resto de mis repositorios en GitHub ↗",
    refsTitle: "Referencias ligadas a la construcción",
    refs: "Mis tutoriales BTE, mi documentación comunitaria y mis herramientas adaptadas tienen su propio contexto en la {bte}. Siguen accesibles sin invadir la selección principal de desarrollo.",
    refsBte: "sección BuildTheEarth"
  },
  "/guides/minecraft-mods-plugins-addons/": {
    intro: "Una herramienta de Minecraft puede tener una interfaz familiar y ejecutarse en un lugar completamente distinto al de otra herramienta. Antes de descargar un JAR, determina si pertenece a tu cliente, al servidor o al entorno de otro mod. Esta guía usa mis proyectos para hacer esas fronteras concretas.",
    compareTitle: "Comparación rápida",
    tableAria: "Comparación de entornos de herramientas",
    tableCaption: "Entornos documentados de las herramientas destacadas",
    thProject: "Proyecto",
    thRuns: "Se ejecuta en",
    thBoundary: "Frontera importante",
    rows: [
      { slug: "homegui", label: "HomeGUI", runs: "Cliente Fabric", boundary: "El servidor sigue poseyendo los comandos y permisos de homes." },
      { slug: "tracebte", label: "TraceBTE", runs: "Servidor Paper", boundary: "El tutorial necesita las herramientas de servidor documentadas." },
      { slug: "railway-tools-axiom", label: "Railway Tools", runs: "Cliente Fabric con Axiom", boundary: "Axiom es una dependencia requerida aparte." },
      { slug: "bte-distortion-calculator", label: "BTE calculator", runs: "Navegador", boundary: "Las entradas de proyección y el estado del modelo afectan a la interpretación." },
      { slug: "riptide", label: "Riptide", runs: "Navegador (conversión en servidor)", boundary: "La conversión remapea bloques; lea el informe de equivalencias antes de usar el resultado." }
    ],
    sections: [
      { title: "Un mod cliente organiza información sin poseer la función del servidor", body: ["HomeGUI es un buen ejemplo. Lee la respuesta del servidor a {code} y hace que los destinos se puedan buscar en una interfaz cliente. Su instalación pertenece a un entorno Fabric compatible, pero el comportamiento de teletransporte pertenece al servidor.", "La pregunta práctica antes de instalar: ¿tu servidor ya proporciona el comando que esta interfaz organiza? Si no lo hace, ningún mod cliente puede añadirlo: la capa correcta es un plugin de servidor o una configuración distinta del servidor."] },
      { title: "Un plugin de servidor cambia el entorno compartido", body: ["TraceBTE se ejecuta dentro de un servidor Paper y guía a los builders por una secuencia de trazado con comandos de servidor. Todas las personas conectadas experimentan el tutorial, y el propietario del servidor controla instalación, permisos y versiones.", "Del lado del servidor también hay responsabilidades del lado del servidor: las versiones de Java y FastAsyncWorldEdit, los reinicios tras la instalación y la compatibilidad con el resto de la lista de plugins forman parte de la configuración documentada."] },
      { title: "Un addon depende de la herramienta anfitriona que extiende", body: ["Railway Tools for Axiom no es ni un mod independiente ni un plugin de servidor: extiende el entorno de construcción de Axiom con una herramienta de trazado ferroviario. Axiom sigue siendo una dependencia requerida aparte, con su propia instalación y permisos.", "Al comparar herramientas, nombra explícitamente el entorno anfitrión. Los requisitos de un addon incluyen la versión del mod anfitrión: por eso la ficha enumera Fabric, Fabric API y Axiom juntos."] },
      { title: "Algunas herramientas de construcción no se ejecutan dentro de Minecraft", body: ["El BTE Distorsion Calculator se ejecuta en un navegador y explora la escala de proyección con entradas geográficas. Los plugins de servidor tipo BuildersUtilities, el transpilador PineappleUI y otras herramientas del repositorio viven cada uno en su propio runtime.", "Mantener visibles esas fronteras evita el error de instalación más común: colocar un archivo en una carpeta mods o plugins cuando el proyecto documenta un entorno totalmente distinto."] },
      { title: "Antes de instalar o informar de un problema", steps: ["Identifica dónde se ejecuta el proyecto: cliente, servidor, addon de una herramienta anfitriona o navegador.","Comprueba sus requisitos actuales: Minecraft, Java, cargador y dependencias.","Distingue la interfaz de la herramienta de los permisos y servicios controlados en otro lugar.","Prueba un caso pequeño y reproducible e incluye la información de versión en una incidencia.","Lee la fuente y la licencia del proyecto, incluidos los créditos originales en un fork."], closing: "Son distinciones respaldadas por la documentación enlazada de los proyectos, no garantías de compatibilidad para futuras versiones. Empieza por el {dev} y sigue los enlaces actuales del repositorio para los detalles de instalación.", closingDev: "catálogo de desarrollo" }
    ]
  },
  "/builds/": {
    intro1: "Capturas {first}–{last} de {total}. Este catálogo conserva cada imagen original y su crédito de colaboración existente. Varias vistas pueden pertenecer al mismo build: el número de imágenes no es un número de proyectos independientes.",
    intro2: "Cada enlace de página y de imagen funciona sin JavaScript. Para filtros y visor, usa {gallery}; para contexto, lee {lemans} o {bte}.",
    intro2Gallery: "la galería interactiva",
    intro2Lemans: "la colección de Le Mans",
    intro2Bte: "el resumen de BuildTheEarth",
    creditsTitle: "Créditos de las imágenes y archivos originales",
    credits1: "Las imágenes con nombre usan descripciones sostenidas por el catálogo del portfolio. Las capturas anónimas siguen siendo capturas numeradas en lugar de recibir un lugar o proyecto no verificado. Los enlaces a archivos originales pueden descargar una imagen pesada; las capturas no son mundos ni schematics.",
    credits2: "Las creaciones mostradas siguen siendo propiedad de sus respectivos autores. {about}",
    credits2About: "Lee sobre MaxLananas y la atribución.",
    imageMeta: "Imagen {index} · {file}",
    captionDefault: "Del portfolio personal de MaxLananas."
  },
  "/search/": {
    intro: "Busca capturas por tema, nombre de archivo o colaboración. Para software, ver {projects}; sin JavaScript, usa {builds}.",
    introProjects: "el catálogo de proyectos",
    introBuilds: "la galería paginada"
  },
  shared: {
    spotlightEyebrow: "Proyecto de interfaz destacado",
    spotlightKind: "PHP · CSS · JavaScript",
    spotlightVisuals: "11 visuales de presentación · vídeo de demostración",
    spotlightCta: "Explorar el rediseño →",
    spotlightDisclaimer: "Rediseño independiente · datos de demostración ficticios",
    spotlightAria: "Explorar el rediseño de interfaz de iProf",
    spotlightAlt: "iProf 2026 — presentación del rediseño de interfaz de MaxLananas",
    spotlightCopy: "Un portal docente repensado como un servicio coherente: panel, carrera, movilidad, documentos y mensajería.",
    publishedEyebrow: "Publicado en Modrinth",
    githubLabEyebrow: "Laboratorio en GitHub",
    modrinthLink: "Versiones en Modrinth ↗"
  },
  notFound: {
    description: "No se encontró esta página. Vuelve al portfolio de MaxLananas, al catálogo de proyectos o a la galería de capturas de Minecraft.",
    title: "404 — Página no encontrada | MaxLananas",
    heading: "404",
    body: "Este build nunca fue colocado. La página que buscas no existe.",
    home: "Volver al portfolio",
    projects: "Catálogo de proyectos",
    gallery: "Galería de Minecraft",
    contact: "Contacto"
  }
};

export const COPY = { en, fr, es };
for (const language of LANGS) {
  COPY[language].labels = LABELS[language];
  COPY[language].credits = CREDITS_COPY[language];
}
export function copy(lang, key, field) {
  const bag = COPY[lang]?.[key];
  if (!bag || !(field in bag)) throw new Error(`Missing ${lang} copy: ${key}.${field}`);
  return bag[field];
}
export function label(lang, item, index) {
  const named = COPY[lang]?.labels?.[item.name];
  if (named) return named;
  return genericLabel(lang, item, index);
}
