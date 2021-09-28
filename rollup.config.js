import cleaner from 'rollup-plugin-cleaner';
import resolve from 'rollup-plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
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
        input: 'src/OpeningHours.ts',
        output: [
            {
                file: 'lib/es6/cjs/OpeningHours.js',
                format: 'cjs',
                exports: 'named',
            },
            {
                file: 'lib/es6/esm/OpeningHours.js',
                format: 'es',
                exports: 'named',
            },
            {
                file: 'lib/es6/iife/OpeningHours.js',
                format: 'iife',
                name: 'p34',
                exports: 'named',
            },
        ],
        plugins: [
            cleaner(['lib/es6', 'lib/es6/cjs/', 'lib/es6/esm/', 'lib/es6/iife/']),
            resolve({
                extensions,
                preferBuiltins: true
            }),
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
        input: 'src/OpeningHours.ts',
        output: [
            {
                file: 'lib/esnext/cjs/OpeningHours.js',
                format: 'cjs',
                exports: 'named',
            },
            {
                file: 'lib/esnext/esm/OpeningHours.js',
                format: 'es',
                exports: 'named',
            },
            {
                file: 'lib/esnext/iife/OpeningHours.js',
                format: 'iife',
                name: 'p34',
                exports: 'named',
            },
        ],
        plugins: [
            cleaner(['lib/esnext/', 'lib/esnext/cjs/', 'lib/esnext/esm/', 'lib/esnext/iife/']),
            resolve({
                extensions,
                preferBuiltins: true
            }),
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
];
