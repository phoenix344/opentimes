import cleaner from 'rollup-plugin-cleaner';
import resolve from 'rollup-plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import tspaths from 'rollup-plugin-ts-paths-resolve';
import typescript from 'rollup-plugin-typescript2';
import analyzer from 'rollup-plugin-analyzer';
import babel from '@rollup/plugin-babel';

import dotenv from 'dotenv';
dotenv.config();

const isProduction = process.env.BUILD === 'production';

const plugins = isProduction ? [ terser({ ecma: 2015 }), analyzer({ summaryOnly: true }) ] : [];

export default [
    {
        input: 'src/OpeningHours.ts',
        output: [
            {
                file: 'lib/cjs/OpeningHours.js',
                format: 'cjs',
                exports: 'named',
            },
            {
                file: 'lib/esm/OpeningHours.js',
                format: 'es',
                exports: 'named',
            },
            {
                file: 'lib/iife/OpeningHours.js',
                format: 'iife',
                name: 'p34',
                exports: 'named',
            },
        ],
        plugins: [
            cleaner(['lib', 'lib/cjs/', 'lib/esm/', 'lib/iife/']),
            resolve({
                extensions: ['.js', '.jsx', '.ts', '.tsx'],
                preferBuiltins: true
            }),
            typescript({
                abortOnError: true,
                tsConfigPath: 'tsconfig.json',
                tsconfigOverride: {
                    declaration: true,
                    declarationDir: 'lib/types'
                }
            }),
            tspaths({ logLevel: 'warn', tsConfigPath: 'tsconfig.json' }),
            babel({ babelrc: true, babelHelpers: 'bundled' }),
            ...plugins,
        ]
    }
]
