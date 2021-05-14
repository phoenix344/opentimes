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

const plugins = isProduction ? [terser(), analyzer({ summaryOnly: true })] : [];
const extensions = ['.js', '.jsx', '.ts', '.tsx'];

export default [
    {
        input: 'src/index.ts',
        output: [
            {
                file: 'lib/es6/index.cjs.js',
                format: 'cjs',
                exports: 'named',
            },
            {
                file: 'lib/es6/index.esm.js',
                format: 'es',
                exports: 'named',
            },
            {
                file: 'lib/es6/index.iife.js',
                format: 'iife',
                name: 'p34',
                exports: 'named',
            },
        ],
        plugins: [
            cleaner(['lib/es6/']),
            resolve({
                extensions,
                preferBuiltins: true
            }),
            tspaths({ logLevel: 'warn', tsConfigPath: 'tsconfig.json' }),
            typescript({
                abortOnError: true,
                tsConfigPath: 'tsconfig.json',
                tsconfigOverride: {
                    declaration: true,
                    declarationDir: 'lib/es6/types'
                }
            }),
            babel({
                extensions,
                babelHelpers: 'bundled',
                presets: ['@babel/preset-env', '@babel/typescript']
            }),
            ...plugins,
        ]
    },
    {
        input: 'src/index.ts',
        output: [
            {
                file: 'lib/esnext/index.cjs.js',
                format: 'cjs',
                exports: 'named',
            },
            {
                file: 'lib/esnext/index.esm.js',
                format: 'es',
                exports: 'named',
            },
            {
                file: 'lib/esnext/index.iife.js',
                format: 'iife',
                name: 'p34',
                exports: 'named',
            },
        ],
        plugins: [
            cleaner(['lib/esnext/']),
            resolve({
                extensions,
                preferBuiltins: true
            }),
            tspaths({ logLevel: 'warn', tsConfigPath: 'tsconfig.json' }),
            typescript({
                abortOnError: true,
                tsConfigPath: 'tsconfig.json',
                tsconfigOverride: {
                    declaration: true,
                    declarationDir: 'lib/esnext/types'
                }
            }),
            ...plugins,
        ]
    }
]
