import path from "path";
import { build } from "esbuild";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

const workerEntryPoints = [
  "vs/language/json/json.worker.js",
  "vs/language/css/css.worker.js",
  "vs/language/html/html.worker.js",
  "vs/language/typescript/ts.worker.js",
  "vs/editor/editor.worker.js",
];

const monaco = path.dirname(require.resolve("monaco-editor/package.json"));

build({
  logLevel: "info",
  entryPoints: workerEntryPoints.map((entry) => `${monaco}/esm/${entry}`),
  bundle: true,
  format: "iife",
  outbase: `${monaco}/esm/`,
  outdir: "dist",
});
