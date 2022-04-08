import { build } from "esbuild";

build({
  logLevel: "info",
  entryPoints: ["src/index.ts"],
  outdir: "dist",
  bundle: true,
  sourcemap: true,
  minify: true,
  watch: true,
  loader: {
    ".ttf": "file",
  },
});
