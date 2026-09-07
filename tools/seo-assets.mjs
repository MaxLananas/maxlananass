import { mkdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import sharp from "sharp";

// A real local brand card, not an invented project screenshot. No external font
// service, generated portrait, or third-party image request is involved.
export async function prepareSeoAssets(root) {
  await mkdir(resolve(root, "assets/icons"), { recursive: true });
  await mkdir(resolve(root, "assets/social"), { recursive: true });
  const icon = await readFile(resolve(root, "apple-touch-icon.png"));
  for (const size of [96, 192, 512]) {
    await sharp(icon).resize(size, size, { kernel: size > 180 ? "nearest" : "lanczos3" }).png({ compressionLevel: 9 })
      .toFile(resolve(root, `assets/icons/${size === 96 ? "favicon-96" : "icon-" + size}.png`));
  }
  const avatar = await sharp(icon).resize(252, 252, { kernel: "nearest" }).png().toBuffer();
  const fontfile = resolve(root, "FFFlauta-200.otf");
  const title = await sharp({ text: { text: '<span foreground="#f5f5f4">MaxLananas</span>', font: "FFFlauta 76", fontfile, rgba: true } }).png().toBuffer();
  const subtitle = await sharp({ text: { text: '<span foreground="#bdbdbd">Minecraft builds\nDeveloper projects &amp; tools</span>', font: "FFFlauta 30", fontfile, rgba: true, spacing: 14 } }).png().toBuffer();
  const url = await sharp({ text: { text: '<span foreground="#a6b38f">maxlananas.is-a.dev</span>', font: "FFFlauta 23", fontfile, rgba: true } }).png().toBuffer();
  await sharp({ create: { width: 1200, height: 630, channels: 3, background: "#0a0a0b" } }).composite([
    { input: avatar, left: 64, top: 158 }, { input: title, left: 362, top: 174 },
    { input: subtitle, left: 368, top: 288 }, { input: url, left: 368, top: 443 }
  ]).png({ compressionLevel: 9 }).toFile(resolve(root, "assets/social/portfolio.png"));
}
