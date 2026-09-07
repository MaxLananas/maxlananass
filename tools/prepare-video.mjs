import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { createHash } from "node:crypto";
import { pathToFileURL } from "node:url";
import sharp from "sharp";

const exec = promisify(execFile);
const root = resolve(import.meta.dirname, "..");
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");

export async function prepareVideo({ source, output = ".cache/native-video" } = {}) {
  output = resolve(root, output);
  if (!output.startsWith(resolve(root, ".cache") + "/")) throw new Error("Video preparation writes only to .cache for review");
  await mkdir(output, { recursive: true });
  await mkdir(resolve(output, "review"), { recursive: true });
  const config = JSON.parse(await readFile(resolve(root, "content/project-media-sources.json"), "utf8"));
  const sourceFile = source ? resolve(source) : resolve(root, ".cache/iprof-video-source.mp4");
  if (!source) {
    // gdown handles Drive's confirmation forms. No Google account or cookie file
    // is required for the creator-supplied public file. Originals are not published.
    await exec("python", ["-m", "gdown", "--fuzzy", `https://drive.google.com/file/d/${config.video.id}/view`, "-O", sourceFile], { maxBuffer: 2 * 1024 * 1024, timeout: 180000 });
  }
  const sourceBytes = await readFile(sourceFile);
  if (sourceBytes.length > 64 * 1024 * 1024) throw new Error("Video exceeds the reviewed 64 MiB source limit");
  const { stdout } = await exec("ffprobe", ["-v", "error", "-show_format", "-show_streams", "-of", "json", sourceFile]);
  const probe = JSON.parse(stdout);
  const stream = probe.streams.find((item) => item.codec_type === "video");
  const audio = probe.streams.filter((item) => item.codec_type === "audio");
  const duration = Number(probe.format.duration);
  if (!stream || !Number.isFinite(duration) || duration <= 0 || duration > 1800) throw new Error("Invalid or unexpectedly long video");
  const key = hash(sourceBytes).slice(0, 16);
  const stem = `assets/video/iprof-${key}`;
  await mkdir(resolve(output, "assets/video"), { recursive: true });
  const mp4 = resolve(output, stem + ".mp4");
  const canRemux = stream.codec_name === "h264" && stream.pix_fmt === "yuv420p" && audio.every((s) => s.codec_name === "aac");
  const encoding = canRemux ? ["-c", "copy"] : ["-c:v", "libx264", "-preset", "slow", "-crf", "18", "-pix_fmt", "yuv420p", "-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2", "-c:a", "aac", "-b:a", "160k"];
  await exec("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-i", sourceFile, "-map", "0:v:0", "-map", "0:a:0?", ...encoding, "-movflags", "+faststart", mp4], { timeout: 600000 });
  const posterSource = resolve(output, "review/poster.png");
  await exec("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-ss", String(Math.min(2, duration / 10)), "-i", mp4, "-frames:v", "1", posterSource]);
  const poster = stem + "-poster.jpg";
  await sharp(posterSource).resize(1200, 630, { fit: "contain", background: "#0a0a0b" }).flatten({ background: "#0a0a0b" }).jpeg({ quality: 94, chromaSubsampling: "4:4:4" }).toFile(resolve(output, poster));
  await exec("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-i", mp4, "-vf", `fps=6/${duration},scale=640:-2,tile=2x3`, "-frames:v", "1", resolve(output, "review/sequence.jpg")]);
  const nativeBytes = await readFile(mp4);
  const { stdout: verified } = await exec("ffprobe", ["-v", "error", "-show_format", "-show_streams", "-of", "json", mp4]);
  const result = JSON.parse(verified), video = result.streams.find((s) => s.codec_type === "video");
  const info = { source: `https://drive.google.com/file/d/${config.video.id}/view`, sourceSha256: hash(sourceBytes), sourceBytes: sourceBytes.length,
    file: stem + ".mp4", bytes: nativeBytes.length, sha256: hash(nativeBytes), mime: "video/mp4", codec: video.codec_name,
    width: video.width, height: video.height, duration: Number(result.format.duration), hasAudio: audio.length > 0,
    poster, remuxedWithoutReencoding: canRemux };
  await mkdir(resolve(output, "content"), { recursive: true });
  await writeFile(resolve(output, "content/iprof-video.json"), JSON.stringify(info, null, 2) + "\n");
  console.log(JSON.stringify(info, null, 2));
  return info;
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const index = process.argv.indexOf("--source");
  await prepareVideo({ source: index >= 0 ? process.argv[index + 1] : undefined });
}
