// Opt-in, read-only CI diagnostics. No write API, artifact transport or branch change.
// A trusted same-repository PR may request a previous failed run using
// <!-- inspect-failed-run:123456 -->. Logs are already masked by GitHub; URLs are
// additionally removed before publishing a bounded diagnostic annotation.
import { readFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
const exec = promisify(execFile);
const event = JSON.parse(await readFile(process.env.GITHUB_EVENT_PATH, "utf8"));
const pr = event.pull_request;
const id = pr?.body?.match(/<!-- inspect-failed-run:(\d{1,20}) -->/)?.[1];
if (id && pr.head.repo.full_name === process.env.GITHUB_REPOSITORY) {
  const { stdout } = await exec("gh", ["run", "view", id, "--repo", process.env.GITHUB_REPOSITORY, "--log-failed"], { maxBuffer: 16 * 1024 * 1024, timeout: 60000 });
  const text = stdout.slice(-16000).replace(/https?:\/\/\S+/g, "[URL]").replaceAll("%", "%25").replaceAll("\r", "%0D").replaceAll("\n", "%0A");
  console.log(`::notice title=Previous failed run ${id}::${text}`);
} else console.log("No trusted failed-run diagnostic requested.");
