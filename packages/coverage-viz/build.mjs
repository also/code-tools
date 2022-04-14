import { serve, build } from "esbuild";

import { createRequire } from "module";

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
