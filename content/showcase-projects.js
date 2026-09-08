// Curated from the creator-supplied iProf presentation and public GitHub projects.
// Released Minecraft projects are catalogued separately from prototypes and forks.
export const SHOWCASE_PROJECTS = [
  {
    slug: "iprof-redesign", name: "iProf 2026", kind: "design", collection: "interface", category: "Interface redesign", bte: false,
    title: "iProf 2026 — UI/UX redesign case study | MaxLananas",
    description: "Discover MaxLananas’s independent iProf redesign: dashboard, career, mobility, documents and messaging, with eleven presentation images and a video walkthrough.",
    summary: "A new interface for everyday teacher workflows, presented through eleven visuals and a video walkthrough.",
    language: "PHP · CSS · JavaScript", cover: "iprof-overview", leadMedia: "iprof-dashboard", social: "iprof-cover",
    source: { label: "Creator-supplied presentation on Google Drive", url: "https://drive.google.com/drive/folders/15kwqtMb1Kkie324cIn-g3a04owKM88xy" },
    intro: [
      "A teacher portal rethought as one coherent service. My iProf redesign connects the dashboard, career, mobility, documents and messaging through a shared visual system.",
      "Explore the eleven annotated visuals and the video walkthrough to see how the screens fit together."
    ],
    features: ["A dashboard that prioritizes upcoming deadlines, career steps and unread messages.", "A career timeline, drag-and-drop mobility preferences and a document vault.", "A shared visual language, dark-theme presentation and responsive layouts.", "Eleven annotated presentation visuals and an accompanying video."],
    usage: "Browse the presentation images below. Select a screenshot to inspect the interface without leaving the portfolio. The native video loads only when playback is requested; the original file remains in the supplied presentation folder.",
    limits: "This is a personal redesign, not an official Ministry of Education deployment, an authentication portal or a claim of institutional endorsement. The presentation explicitly uses fictitious data. Its screenshots document the design, not production integration or an independently certified accessibility audit.",
    media: [
      { key: "iprof-overview", title: "Project presentation", alt: "iProf 2026 redesign presentation by MaxLananas" },
      { key: "iprof-cover", title: "Cover", alt: "Cover of the iProf 2026 interface redesign presentation" },
      { key: "iprof-showcase", title: "Interface showcase", alt: "Overview of the redesigned iProf interface" },
      { key: "iprof-login", title: "Sign-in screen", alt: "Sign-in screen shown in the iProf redesign, not a working login form" },
      { key: "iprof-dashboard", title: "Dashboard", alt: "Dashboard view in MaxLananas’s iProf redesign" },
      { key: "iprof-career", title: "Career", alt: "Career information screen in the iProf redesign" },
      { key: "iprof-mobility", title: "Mobility", alt: "Mobility screen in the iProf redesign" },
      { key: "iprof-documents", title: "Documents", alt: "Document screen in the iProf redesign" },
      { key: "iprof-messaging", title: "Messaging", alt: "Messaging screen in the iProf redesign" },
      { key: "iprof-accessibility", title: "Accessibility presentation", alt: "Accessibility presentation supplied with the iProf redesign" },
      { key: "iprof-responsive", title: "Responsive layouts", alt: "Responsive layout presentation for iProf 2026" }
    ],
    video: { driveId: "1ZHfabuvXI7Y1_HHELVGH7kaGofM8QwWj", name: "iProf 2026 — video walkthrough", description: "Creator-supplied walkthrough of the iProf 2026 interface redesign.", poster: "iprof-cover" },
    related: ["colorflow", "homegui", "pineappleui"]
  },
  {
    slug: "sentinel", name: "SENTINEL", kind: "software", collection: "lab", category: "Windows security monitor", bte: false,
    title: "SENTINEL — Windows security monitoring in Go | MaxLananas",
    description: "SENTINEL is MaxLananas’s Windows security-monitoring project in Go, combining an interactive terminal, local scans and background checks. Explore its scope and source.",
    summary: "A Go-based Windows monitor combining local file scans, process checks and an interactive terminal.",
    repo: "https://github.com/MaxLananas/sentinel", revision: "6c74a10627efc94d1f72a24d79638a5c39b3ce48", evidenceFile: "README.md",
    language: "Go", application: "SecurityApplication",
    requirements: "A compatible Windows environment. The repository uses native Windows APIs and system utilities; this is not a browser application or a cross-platform Minecraft mod.",
    intro: [
      "SENTINEL is my Windows security-monitoring project written in Go. It brings on-demand scans and recurring background checks into one interactive command-line interface.",
      "The repository documents checks around processes, startup entries, file changes, network connections and application integrity. The project is an exploration of local observability and defensive heuristics, not a claim that a single score can certify a machine as safe."
    ],
    features: ["Interactive command-line access to scanning and monitoring functions.", "Background checks for process, startup, file and network changes.", "A grouped system audit that brings multiple local checks together.", "Source code showing the implementation and its Windows-specific boundaries."],
    usage: "Start with the README and inspect the source and commands before running the tool. Use an isolated test environment for experimentation, understand the permissions involved, and review a finding before taking action on a file or process.",
    limits: "Detection is heuristic and may produce false positives or miss threats. This portfolio does not claim independent security certification, guaranteed detection or replacement of a maintained security product. No scans are performed by this website.",
    related: ["maxos", "pineappleui", "iprof-redesign"]
  },
  {
    slug: "maxos", name: "MaxOS", kind: "software", collection: "lab", category: "AI-assisted operating-system experiment", bte: false,
    title: "MaxOS — bare-metal x86 experiment | MaxLananas",
    description: "Explore MaxLananas’s MaxOS experiment: a small x86 boot path, Assembly and C kernel work, VGA text output and AI-assisted development. Source and prototype scope.",
    summary: "An AI-assisted bare-metal x86 experiment exploring the boot path, kernel code and VGA text output.",
    repo: "https://github.com/MaxLananas/MaxOS", revision: "e046d0d7e6bae2902e5dddc758708d67db8b24ce", evidenceFile: "README.md",
    language: "Assembly / C / Python", application: "DeveloperApplication",
    requirements: "The repository documents a Make-based build and QEMU’s i386 emulator for experimenting with the image. Review its build tooling before attempting to run it.",
    intro: [
      "MaxOS is an experimental bare-metal x86 project. It explores a small boot path and kernel environment rather than presenting a general-purpose replacement for an existing operating system.",
      "The repository explicitly describes AI-assisted development. The reviewed README reports x86 boot and 80×25 VGA text output, with interrupts, timing and memory work still listed as development areas. That boundary is part of the project, not something hidden behind a polished demo."
    ],
    features: ["Assembly boot code and C/Assembly kernel components.", "An image and documented QEMU workflow for an emulated environment.", "VGA text output as a small, observable milestone.", "Python-based development tooling alongside the low-level sources."],
    usage: "Read the Makefile and README, then use an emulator for any experiments. Inspect the boot and kernel sources alongside the observed output. Keep this work separate from a production machine’s boot configuration or disks.",
    limits: "This is a prototype, not a production operating system. The repository’s self-generated scores are not independent quality measurements and are not used as claims here. The portfolio has not certified the image or completed the roadmap on its behalf.",
    related: ["sentinel", "pineappleui", "iprof-redesign"]
  }
];
