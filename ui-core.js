export const UI_CORE = {
  en: {
    sortAria: "Sort order: {label}",
    sortFeatured: "Featured",
    sortNewest: "Newest",
    sortOldest: "Oldest",
    resultsCount: "Showing {shown} of {total} images",
    viewAria: "View {label}",
    previewUnavailable: "Preview unavailable · open original",
    openOriginal: "Open original: {label}",
    closeAria: "Close viewer",
    lbOffline: "This photo is not available offline yet.",
    lbLoadError: "The full-size photo could not load. Try again or open the original.",
    pvViewer: "Project screenshot viewer",
    pvClose: "Close screenshot viewer",
    pvPrev: "Previous screenshot",
    pvNext: "Next screenshot",
    pvFull: "Full-size image ↗",
    pvPreviewNote: " — showing the available preview"
  },
  fr: {
    sortAria: "Ordre de tri : {label}",
    sortFeatured: "Sélection",
    sortNewest: "Plus récentes",
    sortOldest: "Plus anciennes",
    resultsCount: "{shown} images affichées sur {total}",
    viewAria: "Voir {label}",
    previewUnavailable: "Aperçu indisponible · ouvrir l’original",
    openOriginal: "Ouvrir l’original : {label}",
    closeAria: "Fermer la visionneuse",
    lbOffline: "Cette photo n’est pas encore disponible hors ligne.",
    lbLoadError: "La photo en pleine taille n’a pas pu se charger. Réessayez ou ouvrez l’original.",
    pvViewer: "Visionneuse des captures du projet",
    pvClose: "Fermer la visionneuse",
    pvPrev: "Capture précédente",
    pvNext: "Capture suivante",
    pvFull: "Image pleine taille ↗",
    pvPreviewNote: " — aperçu disponible"
  },
  es: {
    sortAria: "Orden: {label}",
    sortFeatured: "Destacadas",
    sortNewest: "Más recientes",
    sortOldest: "Más antiguas",
    resultsCount: "Mostrando {shown} de {total} imágenes",
    viewAria: "Ver {label}",
    previewUnavailable: "Vista no disponible · abrir original",
    openOriginal: "Abrir original: {label}",
    closeAria: "Cerrar el visor",
    lbOffline: "Esta foto aún no está disponible sin conexión.",
    lbLoadError: "La foto a tamaño completo no se pudo cargar. Inténtalo de nuevo o abre el original.",
    pvViewer: "Visor de capturas del proyecto",
    pvClose: "Cerrar el visor",
    pvPrev: "Captura anterior",
    pvNext: "Captura siguiente",
    pvFull: "Imagen a tamaño completo ↗",
    pvPreviewNote: " — mostrando la vista previa disponible"
  }
};

export const fill = (template, values) => String(template).replace(/\{(\w+)\}/g, (match, key) => key in values ? values[key] : match);

export function lookup(dictionary, lang, key, values) {
  const raw = dictionary[lang]?.[key];
  if (typeof raw !== "string") throw new Error(`Missing interface string: ${lang}.${key}`);
  return values ? fill(raw, values) : raw;
}

export const documentLang = () => {
  const code = typeof document === "undefined" ? "en" : String(document.documentElement.lang || "en").slice(0, 2);
  return UI_CORE[code] ? code : "en";
};

export const t = (key, values) => lookup(UI_CORE, documentLang(), key, values);
