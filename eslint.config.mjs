import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tseslint from 'typescript-eslint';

const rootDirectory = path.dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({ baseDirectory: rootDirectory });

export default defineConfig([
  {
    ...js.configs.recommended,
    files: ['**/*.{js,cjs,mjs}'],
  },
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: ['apps/api/src/**/*.ts', 'packages/**/*.ts'],
  })),
  ...compat.extends('next/core-web-vitals', 'next/typescript').map((config) => ({
    ...config,
    files: ['apps/web/**/*.{js,jsx,ts,tsx,mjs}'],
  })),
  {
    files: ['apps/web/**/*.{js,jsx,ts,tsx,mjs}'],
    rules: {
      '@next/next/no-html-link-for-pages': 'off',
    },
  },
  {
    files: ['apps/api/src/**/*.ts', 'packages/**/*.ts'],
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      'no-undef': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    files: ['**/*.cjs', 'apps/api/prisma/**/*.js'],
    languageOptions: {
      globals: globals.node,
    },
  },
  globalIgnores([
    '**/.next/**',
    '**/dist/**',
    '**/node_modules/**',
    '**/coverage/**',
    'design_review/**',
    'apps/web/next-env.d.ts',
  ]),
]);
