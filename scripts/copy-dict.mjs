// Copies kuromoji's dictionary files and prebuilt browser bundle into
// public/ so the app is fully self-contained (no CDN dependency at
// runtime). Runs automatically before dev/build, or manually via
// `npm run copy-dict`.
import { cp, mkdir, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const kuromoji = resolve(root, "node_modules/kuromoji");

if (!existsSync(kuromoji)) {
  console.error("kuromoji not found — run `npm install` first.");
  process.exit(1);
}

const dictDest = resolve(root, "public/dict");
await mkdir(dictDest, { recursive: true });
await cp(resolve(kuromoji, "dict"), dictDest, { recursive: true });
console.log(`Copied ${(await readdir(dictDest)).length} dictionary files to public/dict`);

const vendorDest = resolve(root, "public/vendor");
await mkdir(vendorDest, { recursive: true });
await cp(resolve(kuromoji, "build/kuromoji.js"), resolve(vendorDest, "kuromoji.js"));
console.log("Copied prebuilt kuromoji.js to public/vendor");
