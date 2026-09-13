import { LABELS, genericLabel } from "./media-i18n.js";
import { documentLang } from "./ui-core.js";

export const IMAGE_LABELS = LABELS.en;

export function everyLabel(item) {
  return Object.values(LABELS).map((labels) => labels[item.name]).filter(Boolean);
}

export function imageLabel(item, index, language = documentLang()) {
  const labels = LABELS[language] || LABELS.en;
  if (labels[item.name]) return labels[item.name];
  return genericLabel(language, item, index);
}
