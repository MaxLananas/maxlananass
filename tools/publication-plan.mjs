import { appendFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

export function publicationPlan({ mode = "auto", publication, ref, event }) {
  if (!["auto", "validate", "deploy"].includes(mode)) throw new Error("Unknown publication mode");
  if (mode === "validate") return { build: true, deploy: false, legacy: false };
  const main = ref === "refs/heads/main";
  const publishingEvent = event === "push" || event === "workflow_dispatch";
  if (main && publishingEvent && publication === "workflow") return { build: true, deploy: true, legacy: false };
  if (mode === "deploy") throw new Error("Deployment requires main and Pages source GitHub Actions");
  return { build: false, deploy: false, legacy: main && event === "push" && publication === "legacy" };
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const result = publicationPlan({ mode: process.env.REQUESTED_MODE || "auto", publication: process.env.PAGE_PUBLICATION_MODE, ref: process.env.GITHUB_REF, event: process.env.GITHUB_EVENT_NAME });
  console.log(JSON.stringify(result));
  if (process.env.GITHUB_OUTPUT) await appendFile(process.env.GITHUB_OUTPUT, Object.entries(result).map(([key, value]) => `${key}=${value}\n`).join(""));
}
