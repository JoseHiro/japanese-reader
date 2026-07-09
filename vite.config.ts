import { defineConfig, type Plugin, type Connect } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Both the dev server and `vite preview` (sirv) serve *.gz files with
// `Content-Encoding: gzip`, which makes the browser auto-decompress them.
// kuromoji then tries to gunzip already-raw bytes and hangs. Serve the
// dictionary as plain application/octet-stream so kuromoji receives the
// gzip it expects. NOTE: GitHub Pages serves .gz files without adding
// Content-Encoding, so production works without this shim.
function dictMiddleware(rootDir: string): Connect.NextHandleFunction {
  return (req, res, next) => {
    const url = req.url?.split("?")[0];
    if (url && url.startsWith("/dict/") && url.endsWith(".gz")) {
      try {
        const file = resolve(rootDir, url.replace(/^\//, ""));
        const buf = readFileSync(file);
        res.setHeader("Content-Type", "application/octet-stream");
        res.setHeader("Content-Length", String(buf.length));
        res.end(buf);
        return;
      } catch {
        // fall through to default handling
      }
    }
    next();
  };
}

function serveDictRaw(): Plugin {
  return {
    name: "serve-dict-raw",
    configureServer(server) {
      server.middlewares.use(dictMiddleware(resolve(process.cwd(), "public")));
    },
    configurePreviewServer(server) {
      server.middlewares.use(dictMiddleware(resolve(process.cwd(), "dist")));
    },
  };
}

export default defineConfig({
  base: "./",
  plugins: [react(), serveDictRaw()],
});
