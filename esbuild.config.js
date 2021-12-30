require("esbuild").build({
  entryPoints: {
    index: "lib/index.ts",
  },
  bundle: true,
  platform: "node",
  sourcemap: true,
  target: "ES2019",
  treeShaking: true,
  outdir: "./build",
  minify: true,
  charset: "utf8",
});
