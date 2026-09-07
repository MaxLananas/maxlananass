// Editorial dates, not wall-clock build timestamps. Each URL owns its dates.
// Publishing an unrelated project must not make an older article appear new.
export function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return false;
  const parsed = new Date(value + "T00:00:00Z");
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}
export function pageDates(path, records) {
  const record = records[path];
  if (!record || !validDate(record.modified) || !validDate(record.reviewed) || (record.published && !validDate(record.published))) throw new Error(`Missing or invalid editorial dates for ${path}`);
  if (record.published && record.published > record.modified) throw new Error(`Publication is after modification: ${path}`);
  return { ...record };
}
export function dateLabel(value, language = "en") {
  if (!validDate(value)) throw new Error("Invalid display date");
  return new Intl.DateTimeFormat(language === "fr" ? "fr-FR" : "en-GB", { dateStyle: "long", timeZone: "UTC" }).format(new Date(value + "T00:00:00Z"));
}
