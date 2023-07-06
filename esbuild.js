import { build } from "esbuild";

// build for node
build({
  entryPoints: ["src/index.ts"],
  outfile: "dest/opentimes.js",
  bundle: true,
  sourcemap: true,
  minify: true,
  format: "esm",
  platform: "node",
  external: [],
}).catch(() => process.exit(1));
