import { defineConfig } from 'eslint/config';
import config from '@flumens/eslint-config';

export default defineConfig([
  {
    files: ['**/*'],
    extends: [config],
    rules: {
      '@typescript-eslint/no-explicit-any': ['error', { fixToUnknown: true }],
      'import/extensions': 'off',
      // '@typescript-eslint/naming-convention': [
      //   'error',
      //   {
      //     selector: 'objectLiteralProperty',
      //     format: ['camelCase', 'PascalCase'],
      //     filter: {
      //       // exclude special properties and any with non-identifier characters
      //       regex: '^(Authorization|Content-Type|__html|@.+|\\d+|.*\\W.*)$',
      //       match: false,
      //     },
      //   },
      //   {
      //     selector: 'typeProperty',
      //     format: ['camelCase', 'PascalCase'],
      //     filter: {
      //       // exclude special properties and any with non-identifier characters
      //       regex: '^(Authorization|Content-Type|__html|@.+|\\d+|.*\\W.*)$',
      //       match: false,
      //     },
      //   },
      // ],
    },
  },
  {
    files: ['**/__tests__/**', '**/*.spec.*', '**/*.test.*'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly',
      },
    },
  },
]);
