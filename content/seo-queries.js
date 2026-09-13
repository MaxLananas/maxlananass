export const QUERY_MAP = [
  { path: "/", cluster: "brand", intent: "brand", queries: {
    en: ["maxlananas minecraft builder", "maxlananas minecraft developer projects"],
    fr: ["maxlananas builder minecraft", "maxlananas développeur projets minecraft"],
    es: ["maxlananas builder de minecraft", "maxlananas desarrollador proyectos minecraft"] } },
  { path: "/about/", cluster: "brand", intent: "brand", queries: {
    en: ["about maxlananas minecraft builder developer"],
    fr: ["à propos de maxlananas builder minecraft"],
    es: ["sobre maxlananas builder de minecraft"] } },
  { path: "/projects/", cluster: "projects", intent: "hub", queries: {
    en: ["minecraft software projects maxlananas"],
    fr: ["projets minecraft et logiciels maxlananas"],
    es: ["proyectos de minecraft y software maxlananas"] } },
  { path: "/buildtheearth/", cluster: "buildtheearth", intent: "hub", queries: {
    en: ["buildtheearth contributions tools documentation"],
    fr: ["contributions et outils buildtheearth"],
    es: ["contribuciones y herramientas buildtheearth"] } },
  { path: "/development/", cluster: "development", intent: "hub", queries: {
    en: ["development projects minecraft mods software"],
    fr: ["projets de développement mods minecraft logiciels"],
    es: ["proyectos de desarrollo mods de minecraft software"] } },
  { path: "/guides/minecraft-mods-plugins-addons/", cluster: "development", intent: "informational", queries: {
    en: ["minecraft mods plugins and axiom addons explained"],
    fr: ["mods plugins et addons axiom minecraft expliqués"],
    es: ["mods plugins y addons de axiom para minecraft"] } },
  { path: "/projects/iprof-redesign/", cluster: "projects", intent: "project", queries: {
    en: ["iprof 2026 ui ux redesign case study"],
    fr: ["refonte iprof 2026 étude de cas ui ux"],
    es: ["rediseño de iprof 2026 caso de estudio ui ux"] } },
  { path: "/projects/colorflow/", cluster: "projects", intent: "project", queries: {
    en: ["colorflow minecraft color gradient mod"],
    fr: ["colorflow mod couleurs et dégradés minecraft"],
    es: ["colorflow mod de colores y degradados minecraft"] } },
  { path: "/projects/nostalgia-ultra/", cluster: "projects", intent: "project", queries: {
    en: ["nostalgia ultra shader retro minecraft"],
    fr: ["nostalgia ultra shader rétro minecraft"],
    es: ["nostalgia ultra shader retro de minecraft"] } },
  { path: "/projects/sculk-vision/", cluster: "projects", intent: "project", queries: {
    en: ["sculk vision chunk activity overlay mod"],
    fr: ["sculk vision overlay d’activité de chunks"],
    es: ["sculk vision overlay de actividad de chunks"] } },
  { path: "/projects/jukeboxplus/", cluster: "projects", intent: "project", queries: {
    en: ["jukeboxplus minecraft music player mod"],
    fr: ["jukeboxplus lecteur de musique minecraft"],
    es: ["jukeboxplus reproductor de música de minecraft"] } },
  { path: "/projects/now-playing-irl/", cluster: "projects", intent: "project", queries: {
    en: ["now playing irl external music overlay"],
    fr: ["now playing irl overlay musique externe"],
    es: ["now playing irl overlay de música externa"] } },
  { path: "/projects/homegui/", cluster: "projects", intent: "project", queries: {
    en: ["homegui minecraft home management mod"],
    fr: ["homegui mod de gestion des homes minecraft"],
    es: ["homegui mod de gestión de homes de minecraft"] } },
  { path: "/projects/railway-tools-axiom/", cluster: "buildtheearth", intent: "project", queries: {
    en: ["railway tools for axiom bte rail paths"],
    fr: ["railway tools for axiom voies ferroviaires bte"],
    es: ["railway tools for axiom vías ferroviarias bte"] } },
  { path: "/projects/bidvault/", cluster: "projects", intent: "project", queries: {
    en: ["bidvault minecraft auction house plugin"],
    fr: ["bidvault plugin hôtel des ventes minecraft"],
    es: ["bidvault plugin de casa de subastas minecraft"] } },
  { path: "/projects/bedrock-height-guard/", cluster: "projects", intent: "project", queries: {
    en: ["bedrockheightguard cross-play height limits"],
    fr: ["bedrockheightguard hauteurs en cross-play"],
    es: ["bedrockheightguard alturas en cross-play"] } },
  { path: "/projects/deathpoint/", cluster: "projects", intent: "project", queries: {
    en: ["deathpoint death location navigation plugin"],
    fr: ["deathpoint navigation vers le lieu de mort"],
    es: ["deathpoint navegación al lugar de muerte"] } },
  { path: "/projects/sentinel/", cluster: "projects", intent: "project", queries: {
    en: ["sentinel windows security monitoring in go"],
    fr: ["sentinel supervision sécurité windows en go"],
    es: ["sentinel monitorización de seguridad en go"] } },
  { path: "/projects/maxos/", cluster: "projects", intent: "project", queries: {
    en: ["maxos bare-metal x86 experiment"],
    fr: ["maxos expérimentation x86 bare-metal"],
    es: ["maxos experimento x86 bare-metal"] } },
  { path: "/projects/pineappleui/", cluster: "projects", intent: "project", queries: {
    en: ["pineappleui html css layouts to swing"],
    fr: ["pineappleui layouts html css vers swing"],
    es: ["pineappleui layouts html css a swing"] } },
  { path: "/projects/riptide/", cluster: "projects", intent: "tool", queries: {
    en: ["minecraft schematic converter free", "convert minecraft schematics across versions"],
    fr: ["convertisseur de schematics minecraft gratuit", "convertir des builds minecraft entre versions"],
    es: ["conversor de schematics de minecraft gratis", "convertir builds de minecraft entre versiones"] } },
  { path: "/projects/tracebte/", cluster: "buildtheearth", intent: "project", queries: {
    en: ["tracebte buildtheearth tracing tutorial plugin"],
    fr: ["tracebte plugin tutoriel de tracé buildtheearth"],
    es: ["tracebte plugin tutorial de trazado bte"] } },
  { path: "/projects/bte-distortion-calculator/", cluster: "buildtheearth", intent: "tool", queries: {
    en: ["bte distorsion calculator projection scale"],
    fr: ["bte distorsion calculator échelle de projection"],
    es: ["bte distorsion calculator escala de proyección"] } },
  { path: "/projects/bte-france-guidelines/", cluster: "buildtheearth", intent: "documentation", queries: {
    en: ["bte france building guidelines unofficial wiki"],
    fr: ["directives de construction bte france wiki non officiel"],
    es: ["directrices de construcción bte france wiki no oficial"] } },
  { path: "/projects/builders-utilities-bt-corsica/", cluster: "buildtheearth", intent: "project", queries: {
    en: ["buildersutilities bt corsica paper tools"],
    fr: ["buildersutilities bt corsica outils paper"],
    es: ["buildersutilities bt corsica herramientas paper"] } },
  { path: "/projects/le-mans/", cluster: "buildtheearth", intent: "collection", queries: {
    en: ["le mans minecraft builds bte france portfolio"],
    fr: ["builds minecraft du mans portfolio bte france"],
    es: ["builds de minecraft de le mans portfolio bte"] } },
  { path: "/builds/", cluster: "builds", intent: "gallery", paginated: true, queries: {
    en: ["minecraft build screenshots"],
    fr: ["captures de builds minecraft"],
    es: ["capturas de builds de minecraft"] } }
];
