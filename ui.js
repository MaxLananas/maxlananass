import { UI_CORE, fill, lookup } from "./ui-core.js";
import { UI_DOCS } from "./ui-docs.js";

export const UI = Object.fromEntries(Object.keys(UI_CORE).map((lang) => [lang, { ...UI_CORE[lang], ...UI_DOCS[lang] }]));
export { fill };
export const ui = (lang, key, values) => lookup(UI, lang, key, values);
