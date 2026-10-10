import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __dirname = dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({ baseDirectory: __dirname });

const config = [
  { ignores: ['.next/**', 'node_modules/**', 'public/**', 'docs/**', 'next-env.d.ts'] },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    // Start as warnings so the existing codebase can be cleaned up gradually
    // without blocking CI; flip a rule to 'error' once its warnings reach zero.
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-require-imports': 'warn',
      '@typescript-eslint/no-unused-expressions': 'warn',
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      'react/no-unescaped-entities': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/rules-of-hooks': 'error',
      '@next/next/no-img-element': 'off',
      'prefer-const': 'warn',
    },
  },
  {
    // The Pi SDK must load synchronously before the app boots (window.Pi).
    files: ['app/layout.tsx'],
    rules: { '@next/next/no-sync-scripts': 'off' },
  },
  {
    // `declare global { namespace L }` is the supported way to augment Leaflet's types.
    files: ['lib/leaflet-heat-types.ts'],
    rules: { '@typescript-eslint/no-namespace': 'off' },
  },
];

export default config;
