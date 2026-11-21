import eslint from '@eslint/js';
import angular from 'angular-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores([
    '**/node_modules/**',
    '**/dist/**',
    '**/lib/**',
    '**/.angular/**',
    '**/coverage/**',
    'docs/**',
  ]),

  // Config and script files
  {
    files: ['**/*.{js,mjs,cjs}'],
    extends: [eslint.configs.recommended],
    languageOptions: { globals: globals.node },
  },

  // All TypeScript: web app, functions and shared types
  {
    files: ['**/*.ts'],
    extends: [eslint.configs.recommended, tseslint.configs.recommended],
  },

  // Keeps `@klosers/shared` imports erased at build time
  {
    files: ['functions/**/*.ts', 'shared/**/*.ts'],
    rules: { '@typescript-eslint/consistent-type-imports': 'error' },
  },

  // Angular app
  {
    files: ['apps/web/**/*.ts'],
    extends: [angular.configs.tsRecommended],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'app', style: 'camelCase' },
      ],
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: 'app', style: 'kebab-case' },
      ],
    },
  },
  {
    files: ['apps/web/**/*.html'],
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
  },

  // Cloud Functions run on Node
  {
    files: ['functions/**/*.ts'],
    languageOptions: { globals: globals.node },
  },

  // Must stay last: turns off rules that conflict with Prettier
  prettier,
]);
