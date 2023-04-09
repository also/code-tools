import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

import { context, build } from "esbuild";

const require = createRequire(import.meta.url);

const codemirrorShimModule = require.resolve(
  "@also/chrome-devtools-formatter/lib/codemirror.js"
);

let fixCodemirrorResolve = {
  name: "fix-codemirror-resolve",
  setup(build) {
    build.onResolve({ filter: /^\.\.\/\.\.\/lib\/codemirror$/ }, () => {
      return { path: codemirrorShimModule };
    });
  },
};

const opts = {
  absWorkingDir: path.dirname(fileURLToPath(import.meta.url)),
  logLevel: "info",
  plugins: [fixCodemirrorResolve],
  entryPoints: [
    "src/app.ts",
    "src/examples/coverage-with-map.ts",
    "src/examples/map.ts",
    "src/examples/format.ts",
    "src/examples/html-coverage.ts",
  ],
  outbase: "src",
  outdir: "dist",
  format: "esm",
  bundle: true,
  sourcemap: true,
  minify: true,
  splitting: true,
  loader: {
    ".ttf": "file",
  },
};

async function run(mode) {
  if (mode === "build") {
    build(opts);
  } else if (mode === "watch") {
    build({ ...opts, watch: true });
  } else if (mode === "serve") {
    (await context(opts)).serve({ servedir: "." });
  }
}

run(process.argv[2] || "build").catch((e) => {
  console.error(e);
  process.exit(1);
});
