import catalog from "./modrinth-catalog.json" with { type: "json" };

// Release descriptions are editorial summaries of the supplied Modrinth profile.
// Do not copy changing download counts, broad FPS promises or stale version lists.
const details = {
  "colorflow": {
    category: "Color matching & building palettes", language: "Fabric · Client", bte: false,
    summary: "Pick a color, find matching Minecraft blocks and compose a usable gradient without leaving the game.",
    intro: ["Colorflow is my in-game color and gradient tool for Minecraft builders. It connects a color picker with actual block choices, so a visual idea can become a palette you can build with.", "The current Modrinth description documents CIEDE2000 color matching, a nine-block result list and a separate gradient workspace. The interface combines a visual picker, RGB and HEX inputs, block filters and tools for copying or using a palette."],
    features: ["Find the nine closest block matches to a selected color.", "Build adjustable gradients with real block previews.", "Copy block IDs or fill the hotbar in creative mode.", "Filter results and sample a block with the eyedropper."],
    usage: "Choose the matching Fabric release on Modrinth, install its required dependencies, then use the Colorflow key binding to open the picker. Start with a target color, compare the suggested blocks and move into the gradient tab when you need a transition.",
    limits: "Color differences are a selection aid, not a guarantee of an identical appearance under every shader, biome tint or resource pack. Screenshots on the release page can show an earlier interface; use the current release notes for exact options.",
    related: ["iprof-redesign", "nostalgia-ultra", "railway-tools-axiom"]
  },
  "nostalgia-ultra": {
    category: "Retro Minecraft shader pack", language: "Shader pack · Iris", bte: false,
    summary: "A retro visual direction: warm torchlight, turquoise water and an optional CRT treatment inspired by early Minecraft.",
    intro: ["Nostalgia Ultra Shader is my take on the atmosphere of early Minecraft, interpreted through a modern shader pack. The focus is a recognizable visual mood rather than a collection of unrelated effects.", "Its published presentation combines warm lighting, turquoise water, stylized skies and optional CRT effects. The shader settings allow the look to be adjusted instead of forcing the same treatment on every player and world."],
    features: ["Warm lighting and a retro-inspired color palette.", "Configurable water, sky and shadow effects.", "Optional scanlines, screen curvature and other CRT-style effects.", "Settings for adjusting the visual treatment to the scene."],
    usage: "Use a compatible shader setup and select the matching release from Modrinth. Place the downloaded pack in the shaderpacks directory and select it in the shader menu. Start with the default look before changing its effects.",
    requirements: "The project presentation targets Iris. Modrinth also lists OptiFine, while the description qualifies its testing: check the individual release and your setup rather than assuming the loaders are interchangeable.",
    limits: "The portfolio does not repeat hardware-specific FPS promises from the release description. Appearance and performance depend on the chosen settings, hardware, game version and resource packs. This is an independently published shader, not a Mojang product.",
    related: ["colorflow", "jukeboxplus", "iprof-redesign"]
  },
  "sculk-vision": {
    category: "In-world chunk visualization", language: "Fabric · Client", bte: false,
    summary: "Make chunk activity visible with terrain-following overlays, entity counts and configurable indicators.",
    intro: ["Sculk Vision turns information about the surrounding chunks into an in-world visualization. Rather than opening a detached table, the player sees the overlay in the place they are investigating.", "The published project uses a Sculk-inspired visual language, floating labels and configurable thresholds. It brings entity and block-entity counts into the view while keeping the interface client-side."],
    features: ["Toggle the overlay with the documented F6 binding.", "View entity and block-entity counts by chunk.", "Use terrain-following overlays and floating labels.", "Adjust thresholds, particles and other visual options through configuration."],
    usage: "Install a matching Fabric release and the dependencies listed on Modrinth. Enable the overlay in a world, compare nearby chunks and adjust the display so it remains readable for the scene you are inspecting.",
    limits: "The displayed MSPT figure is an estimate described by the project, not a measurement of the remote server’s actual tick time. A client-side overlay is useful for orientation, but does not replace server-side profiling. The source URL currently listed by Modrinth was not publicly accessible during this review, so it is not advertised here as a working repository.",
    related: ["colorflow", "sentinel", "railway-tools-axiom"]
  },
  "jukeboxplus": {
    category: "Minecraft music interface", language: "Fabric · Client", bte: false,
    repo: "https://github.com/MaxLananas/JukeBoxPlus",
    summary: "A music-player interface for Minecraft’s own tracks: what is playing, a searchable library and playback controls.",
    intro: ["JukeBoxPlus gives Minecraft’s music a visible interface. It exposes the track, artist or source and progress instead of leaving the player to guess which piece is playing.", "The current Modrinth release describes a HUD and a full player for in-game music: discs, ambient tracks and dimension-specific categories. This is distinct from Now Playing IRL, which is concerned with music playing in external applications."],
    features: ["See the current track and playback progress in a HUD.", "Browse and search the in-game music library.", "Use play, pause, skip, shuffle, repeat and volume controls.", "Open the player using its configurable key binding."],
    usage: "Select the Fabric release for your Minecraft version on Modrinth, then follow its dependency instructions. Open the player to browse categories and adjust the HUD placement to suit your existing interface.",
    limits: "Descriptions in an older GitHub summary refer to external music, but the current Modrinth presentation describes Minecraft’s own music. This portfolio follows that release description and presents Now Playing IRL separately. It does not imply that Spotify music is included in the mod.",
    related: ["now-playing-irl", "nostalgia-ultra", "homegui"]
  },
  "now-playing-irl": {
    category: "External music overlay", language: "Fabric · Client", bte: false,
    repo: "https://github.com/MaxLananas/Now-Playing-IRL",
    summary: "Bring the track playing on your computer into Minecraft with album art and a configurable music widget.",
    intro: ["Now Playing IRL connects an external listening session with the Minecraft interface. The widget displays information about the music playing on the computer, rather than replacing Minecraft’s own music library.", "The release presentation describes track detection, album artwork, a rotating-record treatment and selectable themes. Position, scale and opacity can be adjusted so the widget fits the player’s layout."],
    features: ["Display the external track being played on the computer.", "Show album artwork when available.", "Choose themes and adjust the widget’s size, position and opacity.", "Keep the integration client-side."],
    usage: "Use a matching release from Modrinth and check its platform-specific player support. Start your music application, enable the widget and adjust the display. The release documentation distinguishes Windows, macOS and Linux integrations.",
    limits: "Player detection and artwork depend on the platform, media application and external artwork services. It is not a universal integration guarantee or a music streaming subscription. For Minecraft’s own tracks, see JukeBoxPlus.",
    related: ["jukeboxplus", "homegui", "iprof-redesign"]
  },
  "bidvault": {
    category: "Server auction house", language: "Paper / Purpur / Folia", bte: false,
    summary: "A player marketplace with an inventory GUI, search, listing categories and a built-in economy.",
    intro: ["BidVault is my auction-house plugin for Minecraft servers. It groups listings, purchase confirmation, search and item collection into a player-facing inventory interface.", "The published project includes an economy so the initial setup does not require a separate Vault-based stack. Listing and balance data are kept in JSON files, while the configuration controls prices, duration and sales tax."],
    features: ["List an item and browse the auction house through commands and a chest GUI.", "Search and filter listings by category or ordering.", "Confirm purchases and collect expired or cancelled listings.", "Configure the included economy and sale rules."],
    usage: "Choose a release matching your server platform, back up the server, then follow the project’s installation instructions. Review permissions, balances, price bounds and taxes in a test environment before opening a live player economy.",
    limits: "Economic settings and backups remain the server administrator’s responsibility. This portfolio does not guarantee loss-free trading, throughput or compatibility with every plugin combination; check current release notes for the exact server target.",
    related: ["deathpoint", "bedrock-height-guard", "homegui"]
  },
  "bedrock-height-guard": {
    category: "Cross-play server height limits", language: "Paper / Purpur · Geyser", bte: true,
    summary: "Per-world height rules for Bedrock players on a Geyser/Floodgate server, with movement and building checks.",
    intro: ["BedrockHeightGuard addresses a cross-play administration problem: players connecting through Bedrock do not necessarily share the same usable height range as a Java client in an extended-height world.", "The project detects Bedrock players through Floodgate and applies configured limits to movement and building events. The rules can vary by world, with staff feedback and exemptions controlled by configuration and permissions."],
    features: ["Configure minimum and maximum heights per world.", "Apply movement and block-action checks to Bedrock players.", "Provide warnings and staff notifications.", "Use bypass permissions and game-mode filters where appropriate."],
    requirements: "A compatible Paper/Purpur server in a Geyser/Floodgate environment. Modrinth’s tags include Folia but the description qualifies that support; verify your selected release before using regionized threading.",
    usage: "Read the release instructions, configure the intended world ranges and test with both Java and Bedrock clients. Check staff permissions and interactions with teleport or movement plugins before enabling enforcement on a live server.",
    limits: "The plugin enforces a range; it does not expand the Bedrock client’s rendering capabilities. Version-specific limits and cross-play behavior should be verified for the actual server and clients instead of treated as a universal fixed height.",
    related: ["bidvault", "deathpoint", "railway-tools-axiom"]
  },
  "deathpoint": {
    category: "Death-location navigation", language: "Minecraft server plugin", bte: false,
    summary: "Save death locations and give players a history, compass direction and permission-controlled return options.",
    intro: ["DeathPoint is a server-side tool for finding a previous death location. It records the world, coordinates and time, then exposes that history through a small set of player commands.", "The project separates navigation from teleportation: a compass can guide the player back, while teleport access and cooldowns remain under the server’s permission and configuration system."],
    features: ["Save a configurable history of death locations.", "Show the latest location or a list of previous entries.", "Point a compass toward a selected location.", "Provide permission-controlled teleportation and persistent history."],
    usage: "Choose the appropriate server release on Modrinth, then review the history size, cooldown and permissions. Players can inspect their saved locations with the documented /dp commands; administrators decide whether teleportation is available.",
    limits: "A recorded location does not prevent item despawning, protect dropped items or guarantee their recovery. Teleportation must respect the server’s rules and permissions, and a location in another world or dimension may require additional navigation.",
    related: ["bidvault", "homegui", "bedrock-height-guard"]
  }
};

export const MODRINTH_ADDITIONS = Object.entries(details).map(([slug, data]) => {
  const release = catalog.projects.find((project) => project.slug === slug);
  if (!release) throw new Error(`Missing verified Modrinth release: ${slug}`);
  return { slug, name: release.name, kind: "software", collection: "release", platform: "modrinth", application: "GameApplication",
    title: `${release.name} — ${data.category.toLowerCase()} | MaxLananas`,
    description: `${release.name} by MaxLananas. ${data.summary} Features, limits and Modrinth releases.`,
    requirements: "Download the release matching your Minecraft version and loader. Follow its listed dependencies and the rules of the server you use.",
    ...data, modrinth: release.url, icon: release.icon, cover: release.cover, artwork: release.artwork,
    source: { label: "Project description and releases on Modrinth", url: release.url },
    launch: { label: "View on Modrinth", url: release.url },
    ...(release.cover ? { media: [{ key: release.cover, title: `${release.name} — project image`, alt: `${release.name} project screenshot published on Modrinth`, caption: "Image from the project’s Modrinth gallery; the interface may differ between releases." }] } : {})
  };
});

export function withRelease(project) {
  const release = catalog.projects.find((item) => item.slug === project.slug);
  if (!release) return { collection: project.kind === "build" ? "build" : project.slug === "pineappleui" ? "lab" : "reference", ...project };
  return { ...project, collection: "release", platform: "modrinth", modrinth: release.url, icon: release.icon, cover: release.cover,
    source: { label: "Project description and releases on Modrinth", url: release.url }, artwork: release.artwork,
    launch: { label: "View on Modrinth", url: release.url },
    ...(project.slug === "homegui" ? { requirements: "A Fabric client with the dependencies listed for your chosen release, and a server with compatible home commands. Use the current Modrinth version list rather than the older README’s single-version example." } : {}),
    ...(release.cover ? { media: [{ key: release.cover, title: `${project.name} — interface`, alt: `${project.name} interface screenshot from its Modrinth gallery`, caption: "Published project screenshot; check the release page for the current interface." }] } : {}) };
}
