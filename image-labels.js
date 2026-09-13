import { LABELS, GENERIC_LABEL } from "./media-i18n.js";
import { documentLang, fill } from "./ui-core.js";

export const IMAGE_LABELS = LABELS.en;

export function everyLabel(item) {
  return Object.values(LABELS).map((labels) => labels[item.name]).filter(Boolean);
}

export function imageLabel(item, index, language = documentLang()) {
  const labels = LABELS[language] || LABELS.en;
  if (labels[item.name]) return labels[item.name];
  return fill(GENERIC_LABEL[language] || GENERIC_LABEL.en, { index: String(index + 1).padStart(3, "0") });
}
