// Editorial selection, not a scraper-generated page for every repository.
// Descriptions are grounded in the linked documentation. Review compatibility
// when updating a project; never turn roadmap items into released features.
export const PROJECTS = [
  {
    slug: "homegui", name: "HomeGUI", kind: "software", category: "Client-side Minecraft mod", bte: false,
    title: "HomeGUI — Minecraft home management mod | MaxLananas",
    description: "HomeGUI by MaxLananas: a client-side Fabric interface for Minecraft homes, with search, favorites and teleport history. Requirements, usage and source links.",
    summary: "A Fabric mod that turns a server’s home commands into a searchable client-side interface.",
    repo: "https://github.com/MaxLananas/HomeGui", revision: "8c76984bcd0d1b401b1c1b1d39aa03b9022c8813", evidenceFile: "README.md",
    launch: { label: "HomeGUI on Modrinth", url: "https://modrinth.com/mod/homegui" }, language: "Java", application: "GameApplication",
    requirements: "The reviewed README targets Minecraft 1.21.1, Fabric Loader and Fabric API. The server must already provide compatible /homes and /home commands.",
    intro: [
      "HomeGUI is my client-side home management mod for Minecraft. Instead of repeatedly typing a home name in chat, you can open an interface, search the available destinations and select where to teleport.",
      "The mod reads the server’s response to /homes and presents that information on the client. It does not install a new teleportation system on the server. This makes the difference between a convenient interface and a server plugin important when deciding whether it fits your setup."
    ],
    features: ["Open the interface with the default H key; change the binding in Minecraft controls.", "Search home names and mark favorites with a right-click.", "Review recent teleport history and local usage statistics.", "Use the English or French interface; preferences are stored in config/homegui.json."],
    usage: "Install a matching Fabric Loader and Fabric API, then place the HomeGUI JAR from the linked project page in your mods directory. Join a server with compatible home commands before opening the interface. The local JSON settings file is generated on first launch.",
    limits: "Server permissions and teleport rules still apply. A server with heavily customized or obfuscated chat formatting may not be parsed correctly. Check the current download page for supported Minecraft versions rather than assuming that every Fabric release is compatible.",
    related: ["tracebte", "railway-tools-axiom", "pineappleui"]
  },
  {
    slug: "tracebte", name: "TraceBTE", kind: "software", category: "Paper tutorial plugin", bte: true,
    title: "TraceBTE — BuildTheEarth tracing tutorial plugin | MaxLananas",
    description: "TraceBTE is MaxLananas’s Paper plugin for learning BuildTheEarth tracing with GPS, /tpll and WorldEdit. Explore the tutorial, requirements and source code.",
    summary: "An interactive server-side tutorial connecting geographic coordinates, building footprints and WorldEdit.",
    repo: "https://github.com/MaxLananas/tracebte-plugin", revision: "dd35c16ea514223f2b77f5851c3dcf811992bc1b", evidenceFile: "README.md",
    language: "Java", application: "GameApplication",
    requirements: "The reviewed documentation lists Paper 1.21.1+, Java 21+ and FastAsyncWorldEdit 2.14.x. The tutorial also relies on the BTE server’s geographic teleport workflow.",
    intro: [
      "TraceBTE is an interactive tracing tutorial plugin developed for BuildTheEarth France. It helps introduce the sequence between finding a real location and placing its building footprint in Minecraft.",
      "The tutorial lives on the server, rather than in a Fabric client. Its focus is the builder’s workflow: retrieve geographic coordinates, reach the corresponding place in the projected world, place corner markers and use WorldEdit to connect and extend the construction."
    ],
    features: ["Start the guided sequence with /tuto and interrupt it with /tuto stop.", "Retrieve GPS coordinates and use the server’s /tpll command.", "Place building corners and draw footprint edges with WorldEdit //line.", "Introduce selections and //stack for extending the footprint upward."],
    usage: "The documented installation places the plugin JAR in the Paper server’s plugins directory, followed by a restart. Check the required Java and FAWE versions first. The README does not require a separate configuration file for the tutorial.",
    limits: "This is a tutorial, not an automatic importer of buildings or an alternative to configuring a BTE server. Its commands and examples assume the expected server tools are available. This portfolio is not an official BuildTheEarth support site.",
    related: ["bte-distortion-calculator", "bte-france-guidelines", "builders-utilities-bt-corsica"]
  },
  {
    slug: "railway-tools-axiom", name: "Railway Tools for Axiom", kind: "software", category: "Axiom addon", bte: true,
    title: "Railway Tools for Axiom — BTE rail paths | MaxLananas",
    description: "MaxLananas’s Axiom addon creates railway paths from control points, with curve previews and terrain following for BuildTheEarth workflows. Read the requirements.",
    summary: "A client-side Axiom addon for laying out railway corridors using control points and smooth curves.",
    repo: "https://github.com/MaxLananas/railwaytoolV2", revision: "6220e980f351b58a0a5d8fdb38247d290435f75e", evidenceFile: "README.md",
    language: "Java", application: "GameApplication",
    requirements: "The reviewed README targets Minecraft 1.21.10, Fabric Loader 0.16.0 or newer, Fabric API and Axiom. Axiom is required and is not bundled.",
    intro: [
      "Railway Tools for Axiom is my addon for planning railway paths in BuildTheEarth workflows. Builders place control points, inspect the proposed route and confirm the resulting block placement from within Axiom’s tool interface.",
      "The path uses Catmull–Rom spline interpolation to connect control points with curves. The implementation then samples the curve into block positions and classifies straight, diagonal and turning segments to choose appropriate block states. It is a construction aid for a projected Minecraft world, not a railway engineering simulator."
    ],
    features: ["Place control points with a right-click and confirm the route with Enter.", "Remove the latest point with Delete or clear the route with Escape.", "Adjust sampling density from 2 to 32 points per block.", "Preview the placement before committing it, and optionally snap the route to the terrain."],
    usage: "Install the matching Fabric environment and Axiom, then use the BTE Rail Path tool in Axiom’s palette. Begin with a short section to check the palette, curve density and ground-snapping behavior before extending a longer corridor. The README lists Axiom TOOL and BUILD_SECTION permissions.",
    limits: "This addon cannot run without Axiom. Block palettes and Minecraft APIs are version-sensitive, so use the requirements of the version you download. The project is not an official Axiom or BuildTheEarth release.",
    related: ["tracebte", "bte-distortion-calculator", "le-mans"]
  },
  {
    slug: "bte-distortion-calculator", name: "BTE Distorsion Calculator", kind: "software", category: "Browser-based projection tool", bte: true,
    title: "BTE Distorsion Calculator — projection scale | MaxLananas",
    description: "Explore MaxLananas’s browser-based BTE Distorsion Calculator: geographic inputs, local scale comparisons, theoretical and empirical modes, and model limitations.",
    summary: "A web interface for exploring the relationship between geographic distances and local scale in a BTE projection.",
    repo: "https://github.com/MaxLananas/BTE-Distorsion-Calculator", revision: "794ae8572d15e7da528fd809019ec1526d7e6d32", evidenceFile: "index.html",
    launch: { label: "Open the calculator (French interface)", url: "https://maxlananas.github.io/BTE-Distorsion-Calculator/" }, language: "JavaScript", application: "DeveloperApplication", web: true,
    requirements: "A JavaScript-enabled browser. The interface can load a conformal.lzma grid; its displayed projection mode should be checked before interpreting a calculation.",
    intro: [
      "The BTE Distorsion Calculator is my browser-based tool for examining local scale in the projection used by a BuildTheEarth workflow. It brings geographic inputs and projection explanations together in a French-language interface.",
      "A global relationship such as one block to one meter does not, by itself, explain every local measurement in a map projection. The calculator provides theoretical and empirical modes so a builder can compare the model with measurements taken in-game instead of silently treating them as interchangeable."
    ],
    features: ["Enter latitude and longitude points in the theoretical mode.", "Compare with an empirical mode based on in-game measurements.", "Load the Schwarz–Christoffel conformal.lzma grid when using that model.", "Inspect the projection pipeline explanation and the supplied Chambord example."],
    usage: "Open the calculator, choose a mode and inspect the grid status before entering coordinates. Use the provided example to understand the input format, then work with points relevant to your build. Keep a record of the input points and projection mode when comparing results with a Minecraft measurement.",
    limits: "Without a loaded grid the interface indicates a gnomonic fallback. Results depend on the model and inputs; this page does not claim certified surveying accuracy or independent numerical validation. The tool explores scale, rather than importing buildings into Minecraft.",
    related: ["tracebte", "railway-tools-axiom", "bte-france-guidelines"]
  },
  {
    slug: "bte-france-guidelines", name: "BTE France building guidelines", kind: "documentation", category: "Unofficial community documentation", bte: true,
    title: "BTE France building guidelines — unofficial wiki | MaxLananas",
    description: "MaxLananas’s unofficial BTE France documentation organizes building guidelines for roads, railways, buildings and street furniture. Read its scope and sources.",
    summary: "An unofficial French-language reference for discussing and organizing recurring building conventions.",
    repo: "https://github.com/MaxLananas/bte-fr-normalisation", revision: "6b214c1e1261125fd608cec0aa9cd53d1395cbc5", evidenceFile: "index.html",
    launch: { label: "Read the guidelines (French)", url: "https://maxlananas.github.io/bte-fr-normalisation/" }, language: "HTML / JavaScript",
    requirements: "A browser; the published documentation is in French. The repository describes the wiki as unofficial.",
    intro: [
      "I maintain an unofficial documentation site for building conventions around BuildTheEarth France. Its purpose is to make recurring decisions easier to find and discuss, rather than leave every reference scattered across conversations.",
      "The site organizes guidelines into subjects such as road infrastructure, public transport and railways, buildings, street furniture, flags, logos and signs. An index leads to the individual reference documents, with links for learning about the normalization project and proposing a guideline."
    ],
    features: ["Find road, sidewalk, parking and signage topics in a dedicated infrastructure category.", "Browse railway, tramway and overhead-line references together.", "Separate building details from street furniture and vegetation.", "Follow links to individual guideline documents and the contribution process."],
    usage: "Start with the category index, then read the relevant guideline and the documentation’s own explanation of its scope. Use it as a common reference when discussing a detail with other builders, and confirm current team decisions with the team rather than treating this portfolio as the rules authority.",
    limits: "Unofficial documentation is not an official mandate from BuildTheEarth. The portfolio summarizes the project and links to the maintained reference instead of duplicating the whole wiki or claiming ownership of every community convention.",
    related: ["tracebte", "railway-tools-axiom", "builders-utilities-bt-corsica"]
  },
  {
    slug: "pineappleui", name: "PineappleUI", kind: "software", category: "UI transpiler experiment", bte: false,
    title: "PineappleUI — HTML/CSS-like layouts to Java Swing | MaxLananas",
    description: "PineappleUI by MaxLananas explores generating Java Swing interfaces from HTML/CSS-like layouts. Discover the Python tool, current target and roadmap limitations.",
    summary: "A Python UI transpiler connecting web-style interface descriptions with generated Java Swing code.",
    repo: "https://github.com/MaxLananas/PineappleUI", revision: "c0d055b66fad86cc7b2f4c7a07d7e6fab525ea8a", evidenceFile: "README.md",
    language: "Python", application: "DeveloperApplication",
    requirements: "Python for the transpiler and a suitable Java environment for compiling or running generated Swing code. Check the repository for its current setup requirements.",
    intro: [
      "PineappleUI is my experiment in describing desktop interfaces with HTML/CSS-like layouts and generating native Java Swing code. It connects an interface vocabulary familiar from web development with a desktop UI target.",
      "The current documented target is Swing. The source describes support for common components, containers, layout, styling and event integration. The useful question is not whether a web page can simply become any application, but which parts of an interface description can be mapped clearly to the supported target."
    ],
    features: ["Describe an interface in a .pineui file.", "Generate Java Swing code from the supported interface description.", "Use the documented compile/run command to explore the generated result.", "Keep target-specific behavior visible rather than assuming every HTML or CSS feature is portable."],
    usage: "The README’s starting command is python main.py myui.pineui --compile --run. Begin with a small layout and inspect the generated Java before expanding it. This is a development workflow, not a Minecraft mod installation: the input file belongs to the transpiler, not a mods or plugins directory.",
    limits: "JavaFX, Android XML and other UI frameworks are listed as future targets, not working features claimed here. Treat this as an experimental tool, verify the supported syntax in the repository and test generated code before relying on it in an application.",
    related: ["homegui", "bte-distortion-calculator", "tracebte"]
  },
  {
    slug: "builders-utilities-bt-corsica", name: "BuildersUtilities — BT Corsica", kind: "software", category: "Adapted Paper plugin / fork", bte: true,
    title: "BuildersUtilities BT Corsica — adapted Paper tools | MaxLananas",
    description: "MaxLananas’s BT Corsica adaptation of BuildersUtilities: waypoints, building helpers and Paper requirements, with explicit credits to the upstream authors.",
    summary: "An adaptation of an existing builder plugin, with BT Corsica-specific commands and compatibility work.",
    repo: "https://github.com/MaxLananas/BuildersUtilities-BTCorsica", revision: "e100c989d2fe527c48527c99dab28f304556a621", evidenceFile: "README.md",
    upstream: "https://github.com/TehBrian/BuildersUtilities", language: "Java", application: "GameApplication",
    requirements: "The reviewed README targets Paper 1.21.10 and Java 21. Server permissions govern access to the individual commands and abilities.",
    intro: [
      "This repository is my BT Corsica adaptation of BuildersUtilities, not an original plugin written entirely by me. The upstream chain matters: it is based on TehBrian’s BuildersUtilities, which in turn builds on Arcaniax’s Builder’s Utilities.",
      "The adaptation combines compatibility work for the documented Paper and Java versions with building helpers suited to the team’s workflow. The repository describes migration away from removed APIs alongside additions such as waypoints and time/weather commands."
    ],
    features: ["Open the ability menu with /bu and inspect commands with /bu help.", "Manage waypoints using /wp add, /wp tp, /wp list and /wp remove.", "Use building time and weather commands where permissions allow them.", "Access special-item, armor-color and banner tools exposed by the plugin."],
    usage: "Review the plugin.yml permission list and current build requirements before installing the adaptation on a Paper server. The README documents a Gradle build with Java 21 and generated JARs under build/libs. Test configuration and permissions on a non-production server before making the tools available to a team.",
    limits: "Upstream authors retain their respective credits. This page does not relabel the project as an official BuildTheEarth plugin or assert a license from the README alone: consult the repository’s LICENSE and upstream requirements before redistribution.",
    related: ["tracebte", "railway-tools-axiom", "bte-france-guidelines"]
  },
  {
    slug: "le-mans", name: "Le Mans Minecraft builds", kind: "build", category: "BuildTheEarth France / portfolio collection", bte: true,
    title: "Le Mans Minecraft builds — BTE France portfolio | MaxLananas",
    description: "Selected Le Mans Minecraft screenshots from MaxLananas’s portfolio, including circuit and wider views, with BuildTheEarth France credits and original image links.",
    summary: "A selected group of circuit and wider Le Mans views from the BuildTheEarth France work in this portfolio.",
    images: ["circuit24hdumans.jpg", "Lemans_-_france5.jpg", "Lemans_-_large.png"],
    intro: [
      "This collection brings together the Le Mans images already identified in my Minecraft portfolio. The selection includes a circuit view and wider views, rather than treating every camera angle as a different completed project.",
      "The gallery credits these builds to work made within BuildTheEarth France. That collaborative context is part of the presentation: a personal portfolio can show a contribution without claiming sole authorship of a shared world."
    ],
    features: ["Compare the circuit image with the wider views in the same collection.", "Read the attribution alongside each screenshot, without opening a JavaScript-only overlay.", "Open the original image when the full-resolution file is needed."],
    usage: "Use the images below to explore the collection, or browse the full screenshot catalogue for other builds. If you want to discuss a similar commission, describe the location, purpose, expected scope and delivery format when contacting me; these screenshots are references rather than a fixed-price package.",
    limits: "This page provides screenshots, not a downloadable world or schematic. It does not claim that the whole city is finished, give an unverified block count, or imply ownership of every contributor’s work in the wider BuildTheEarth project.",
    related: ["railway-tools-axiom", "tracebte", "bte-france-guidelines"]
  }
];
