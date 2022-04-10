import { serve, build } from "esbuild";

const opts = {
  logLevel: "info",
  entryPoints: ["src/index.ts", "src/format-example.ts"],
  outdir: "dist",
  bundle: true,
  sourcemap: true,
  minify: true,
  loader: {
    ".ttf": "file",
  },
};

const mode = process.argv[2] || "build";

if (mode === "build") {
  build(opts);
} else if (mode === "watch") {
  build({ ...opts, watch: true });
} else if (mode === "serve") {
  serve({ servedir: "." }, opts);
}
