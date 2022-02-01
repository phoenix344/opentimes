import cleaner from "rollup-plugin-cleaner";
import resolve from "rollup-plugin-node-resolve";
import { terser } from "rollup-plugin-terser";
import typescript from "rollup-plugin-typescript2";
import analyzer from "rollup-plugin-analyzer";
import babel from "@rollup/plugin-babel";
import dotenv from "dotenv";

dotenv.config();

const isProduction = process.env.BUILD === "production";
const plugins = isProduction
  ? [
    terser(),
    analyzer({ summaryOnly: true })
  ]
  : [];
const extensions = [".js", ".jsx", ".ts", ".tsx"];

export default [
  {
    input: "src/index.ts",
    output: [
      {
        file: "lib/opening-hours.umd.js",
        format: "umd",
        exports: "named",
        name: 'p34',
        sourcemap: !isProduction,
      },
      {
        file: "lib/opening-hours.esm.js",
        format: "es",
        exports: "named",
        sourcemap: !isProduction,
      },
    ],
    plugins: [
      cleaner(["lib"]),
      resolve({
        extensions,
        preferBuiltins: true,
      }),
      typescript({
        abortOnError: true,
        tsConfigPath: "tsconfig.json",
        tsconfigOverride: {
          declaration: true,
          declarationDir: "lib/types",
        },
      }),
      babel({
        extensions,
        babelHelpers: "bundled",
        presets: ["@babel/preset-env", "@babel/typescript"],
      }),
      ...plugins,
    ],
  },

];
