// eslint.config.js
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import importPlugin from 'eslint-plugin-import';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import reactRefresh from 'eslint-plugin-react-refresh';
import eslintConfigPrettier from 'eslint-config-prettier';

export default tseslint.config(
  // 1) Ignores
  { ignores: ['dist', 'node_modules', 'coverage'] },

  // 2) Main ruleset for JS/TS/JSX/TSX
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser,
      // Use the TS parser for both TS and JS files (works fine without "project")
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: { jsx: true }
        // For type-aware rules later, add: project: ['./tsconfig.json']
      }
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
      import: importPlugin,
      'simple-import-sort': simpleImportSort,
      'react-refresh': reactRefresh
    },
    settings: {
      react: { version: 'detect' },
      // Make ESLint understand your TS path aliases (e.g. @/*)
      'import/resolver': {
        typescript: { project: './tsconfig.json' }
      }
    },
    rules: {
      // Base recommended
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,

      // React modern defaults
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',

      // Import hygiene
      'import/no-unresolved': 'error',
      'simple-import-sort/imports': ['warn', {
        groups: [
          ['^node:', '^react', '^[a-z]'], // node/external
          ['^@app/', '^@shared/', '^@entities/', '^@features/', '^@widgets/', '^@pages/', '^@/'], // aliases
          ['^\\.\\.(?!/?$)', '^\\./(?=.*/)(?!/?$)', '^\\./?$'], // parent/relative
          ['^\\u0000'] // side effects
        ]
      }],
      'simple-import-sort/exports': 'warn',

      // React Fast Refresh
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // TS niceties
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': ['warn', { prefer: 'type-imports' }]
    }
  },

  // 3) TSX-specific tweaks (optional)
  {
    files: ['**/*.tsx'],
    rules: {
      'react/display-name': 'off'
    }
  },

  // 4) Turn off rules that conflict with Prettier formatting
  eslintConfigPrettier
);
