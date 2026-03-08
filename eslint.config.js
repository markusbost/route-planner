import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import { reactRefresh } from 'eslint-plugin-react-refresh'

export default [
  { ignores: ['dist', 'coverage'] },
  js.configs.recommended,
  // Allow _-prefixed vars/args to be intentionally unused
  {
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
  // Config files and tests: Node environment
  {
    files: ['vite.config.js', 'eslint.config.js', 'tests/**/*.js'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
  // Source files: browser + JSX
  {
    files: ['src/**/*.{js,jsx}'],
    languageOptions: {
      globals: { ...globals.browser },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  reactRefresh.configs.vite(),
]

