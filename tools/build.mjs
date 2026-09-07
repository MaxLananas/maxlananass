import { readFile, writeFile, mkdir, copyFile, cp, rm } from "node:fs/promises";
import { resolve, relative, join, sep } from "node:path";
import { pathToFileURL } from "node:url";
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { build, transform } from "esbuild";
import { prepareImages } from "./prepare-images.mjs";
import { prepareStatic } from "./prepare-static.mjs";
import { writeSeo, serviceWorkerRoutes } from "./seo-render.mjs";

const root = resolve(import.meta.dirname, "..");
const posix = (path) => path.split(sep).join("/");

export async function buildSite({ outDir = "dist", sourceDir, offline = false, imageOptions = {}, base = "/", quiet = false } = {}) {
  outDir = resolve(outDir);
  // This is the only directory the build deletes. Never allow it to target the
  // checkout, .git, an ancestor, or an arbitrary absolute directory.
  const outputPath = relative(root, outDir);
  if (!outputPath || outputPath.startsWith("..") || !/^(dist|\.cache[\/\\][\w-]+)$/.test(outputPath)) {
    throw new Error("Output must be dist or a direct .cache/<build-name> directory inside the repository");
  }
  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });
  const { manifest, report } = await prepareImages({
    ...imageOptions, outputDir: join(outDir, "assets/gallery"), sourceDir, offline,
    ...(quiet ? { onProgress: () => {} } : {})
  });
  await prepareStatic(root);
  const result = await build({
    absWorkingDir: root,
    entryPoints: { app: "script.js", pages: "page.js", styles: "style.css", "not-found": "404.css" },
    outdir: join(outDir, "assets"),
    entryNames: "[name]-[hash]", assetNames: "fonts/[name]-[hash]", chunkNames: "[name]-[hash]",
    bundle: true, splitting: true, format: "esm", target: ["es2020"],
    minify: true, metafile: true, legalComments: "none", loader: { ".woff2": "file" },
    plugins: [{
      name: "prepared-gallery",
      setup(builder) {
        builder.onResolve({ filter: /(^|\/)image-manifest\.js$/ }, () => ({ path: "image-manifest", namespace: "prepared-gallery" }));
        builder.onLoad({ filter: /.*/, namespace: "prepared-gallery" }, () => ({ contents: "export const IMAGE_MANIFEST=" + JSON.stringify(manifest), loader: "js" }));
      }
    }]
  });
  const outputEntries = Object.entries(result.metafile.outputs);
  const outputURL = (file) => posix(relative(outDir, resolve(root, file)));
  const entryFor = (source) => {
    const file = outputEntries.find(([, output]) => output.entryPoint === source)?.[0];
    if (!file) throw new Error(`Missing build entry: ${source}`);
    return outputURL(file);
  };
  const entry = entryFor("script.js");
  const styles = entryFor("style.css");
  const notFound = entryFor("404.css");
  const font = outputURL(outputEntries.find(([file]) => file.endsWith(".woff2"))[0]);
  const appInfo = outputEntries.find(([, output]) => output.entryPoint === "script.js")[1];
  const preloads = appInfo.imports.filter((item) => item.kind === "import-statement").map((item) => outputURL(item.path));
  const pageInfo = outputEntries.find(([, output]) => output.entryPoint === "page.js")[1];
  const seo = await writeSeo({ outDir, manifest, base, optimized: true, styles, font, app: entry, pageScript: entryFor("page.js"), preloads,
    pagePreloads: pageInfo.imports.filter((item) => item.kind === "import-statement").map((item) => outputURL(item.path)) });
  base = "/" + base.split("/").filter(Boolean).join("/");
  if (!base.endsWith("/")) base += "/";
  const errorPage = (await readFile(join(root, "404.html"), "utf8"))
    .replace('href="/404.css"', `href="${base}${notFound}"`)
    .replace('href="/assets/fonts/FFFlauta-200.woff2"', `href="${base}${font}"`)
    .replace('href="/assets/icons/favicon-96.png"', `href="${base}assets/icons/favicon-96.png"`)
    .replace('href="/projects/"', `href="${base}projects/"`)
    .replace('href="/builds/"', `href="${base}builds/"`)
    .replace('href="/#contact"', `href="${base}#contact"`)
    .replace('href="/"', `href="${base}"`);
  await writeFile(join(outDir, "404.html"), errorPage);
  const staticFiles = ["CNAME", "apple-touch-icon.png"];
  for (const file of staticFiles) await copyFile(join(root, file), join(outDir, file));
  await mkdir(join(outDir, "assets/credits"), { recursive: true });
  const creditFiles = ["bte", "endorah", "fight4glory", "mrbeast"].map((key) => `assets/credits/${key}.webp`);
  for (const file of creditFiles) await copyFile(join(root, file), join(outDir, file));
  await cp(join(root, "assets/projects"), join(outDir, "assets/projects"), { recursive: true });
  const identityFiles = ["assets/icons/favicon-96.png", "assets/icons/icon-192.png", "assets/icons/icon-512.png", "assets/social/portfolio.png"];
  for (const file of identityFiles) {
    await mkdir(resolve(outDir, file, ".."), { recursive: true });
    await copyFile(join(root, file), join(outDir, file));
  }
  await writeFile(join(outDir, ".nojekyll"), "");
  const assets = [...outputEntries.map(([file]) => outputURL(file)), ...creditFiles, "index.html", "404.html", "apple-touch-icon.png", "manifest.json", "assets/icons/favicon-96.png"].sort();
  const versionHash = createHash("sha256");
  for (const asset of [...new Set([...assets, ...seo.files.keys()])].sort()) { versionHash.update(asset); versionHash.update(await readFile(join(outDir, asset))); }
  const version = versionHash.digest("hex").slice(0, 16);
  const workerSource = serviceWorkerRoutes(await readFile(join(root, "sw.js"), "utf8"), seo.pages)
    .replace('const STATIC_VERSION = "source-v8";', `const STATIC_VERSION = "${version}";`)
    .replace(/\/\* precache:start \*\/[\s\S]*?\/\* precache:end \*\//, JSON.stringify(["./", ...assets.map((file) => "./" + file)]));
  const worker = await transform(workerSource, { minify: true, target: "es2020", legalComments: "none" });
  await writeFile(join(outDir, "sw.js"), worker.code);
  const code = [];
  for (const asset of assets.filter((file) => /\.(js|css|html)$/.test(file))) {
    const bytes = await readFile(join(outDir, asset));
    code.push({ file: asset, bytes: bytes.length, gzipBytes: gzipSync(bytes).length });
  }
  const summary = { ...report, build: version, code, pages: seo.pages.length, indexablePages: seo.pages.filter((page) => !page.noindex).length };
  await mkdir(join(root, ".cache"), { recursive: true });
  if (!quiet) {
    await writeFile(join(root, ".cache/build-report.json"), JSON.stringify(summary, null, 2));
    console.log(`\nBuilt ${report.images} photos, ${report.variants} variants (${(report.variantBytes / 1024 / 1024).toFixed(1)} MiB) into ${outDir}.`);
    console.log("Only visible variants are requested by visitors. No originals or generated album files are committed to Git.");
    console.log("Detailed sizes: .cache/build-report.json");
  }
  return { outDir, manifest, report: summary };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const args = process.argv.slice(2);
  const option = (name) => args.includes(name) ? args[args.indexOf(name) + 1] : undefined;
  try {
    await buildSite({ sourceDir: option("--source-dir"), offline: args.includes("--offline"), base: option("--base") || process.env.PAGES_BASE_PATH || "/" });
  } catch (error) {
    console.error(error.message);
    console.error("Build stopped: an incomplete album will not be deployed. Originals in the release are untouched.");
    process.exitCode = 1;
  }
}
