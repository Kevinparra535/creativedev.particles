import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    plugins: [{ js }, 'prettier', 'simple-import-sort'],
    extends: ['js/recommended', 'eslint:recommended'],
    ignorePatterns: ['node_modules/', 'dist/', 'build/', 'coverage/', 'The-Spirit-master/'],
    languageOptions: { globals: globals.browser },
    rules: {
      'react/jsx-indent': ['error', 2],
      'arrow-body-style': ['error', 'as-needed'],
      'react/function-component-definition': [0],
      'react/button-has-type': [0],
      'react/jsx-filename-extension': [1, { extensions: ['.tsx', '.ts'] }],
      'react/prop-types': [0],
      'react/react-in-jsx-scope': 'off',
      // Disable no-undef for TS projects to avoid false positives on types/JSX
      'no-undef': 'off',
      'no-console': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      'import/extensions': [0, 'ignorePackages', { ts: 'never', tsx: 'never' }],
      'import/prefer-default-export': 'off',
      'import/no-unresolved': 'off',
      'react/require-default-props': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'no-unused-expressions': 'off',
      'react/jsx-no-useless-fragment': 'off',
      'no-nested-ternary': 'off',
      'no-restricted-globals': 'off',
      'import/order': 'off',
      'tsdoc/syntax': 'off',
      'no-param-reassign': 'off',
      'react/no-unescaped-entities': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            ['^react', '^@?\\w'],
            ['^contexts/', '^@/contexts/'],
            ['^hooks/', '^@/hooks/'],
            ['^\\./Routes'],
            ['^components/', '^@/components/'],
            ['^viewModels/', '^@/viewModels/'],
            [
              '^images/',
              '^@/images/',
              '^\\.(png|jpe?g|gif|svg)$',
              '^@/images/.*\\.(png|jpe?g|gif|svg)$'
            ],
            ['^styles/', '^@/styles/'],
            ['^stores/', '^@/stores/', '^\\./stores/', '^\\.\\./stores/'],
            [
              '^config/',
              '^@/config',
              '^@/ui/config',
              '^types/',
              '^@/types/',
              '^@/ui/types/',
              '^constants/',
              '^@/constants/',
              '^@/ui/constants/'
            ]
          ]
        }
      ]
    },
    overrides: [
      {
        files: ['*.tsx'],
        rules: {
          'simple-import-sort/imports': [
            'error',
            {
              groups: [
                ['^react', '^@?\\w', 'virtual:pwa-register/react'],
                ['^contexts/', '^@/contexts/'],
                ['^hooks/', '^@/hooks/'],
                ['^\\.'],
                ['^\\.\\.'],
                ['^components/', '^@/components/', '^../pages', '^../layouts'],
                ['^../i18n', '^@/i18n', '^@/ui/i18n'],
                ['^viewModels/', '^@/viewModels/'],
                ['^../helpers', '^@/helpers'],
                [
                  '^\\.(png|jpe?g|gif|svg)$',
                  '^@/images/.*\\.(png|jpe?g|gif|svg)$',
                  '^../assets/images/',
                  '^../assets/animations/',
                  '^../../assets/animations/'
                ],
                ['^styles/', '^@/styles/'],
                ['^stores/', '^@/stores/', '^\\./stores/', '^\\.\\./stores/'],
                ['^constants/', '^@/constants/', '^config/', '^@/config/']
              ]
            }
          ]
        }
      }, // .tsx
      {
        files: ['di.ts'],
        rules: {
          'simple-import-sort/imports': [
            'error',
            {
              groups: [
                ['^react', '^@?\\w'],
                ['^inversify', '^\\.types'],
                ['^\\.types'],
                ['^@/data/network/'],
                ['^@/ui/store/'],
                ['^@/domain/repositories/', '^@/data/repositories/'],
                ['^@/domain/services/', '^@/data/services/'],
                ['^@/domain/useCases/'],
                ['^@/ui/pages/', '^@/ui/viewModels/'],
                ['^@/ui/viewModels/QrScannerManager'],
                ['^@/domain/strategies/', '^@/domain/interfaces/']
              ]
            }
          ]
        }
      }, // di.ts
      {
        files: ['*.view.tsx'],
        rules: {
          'simple-import-sort/imports': [
            'error',
            {
              groups: [
                ['^react', '^mobx', '^@?\\w', '^react-router-dom'],
                ['^hooks/', '^@/hooks/'],
                [
                  '^@/ui/i18n',
                  '^components/',
                  '^@/components/',
                  '^@/ui/components/',
                  '^\\./components'
                ],
                [
                  '^\\.(png|jpe?g|gif|svg)$',
                  '^@/images/.*\\.(png|jpe?g|gif|svg)$',
                  '^../assets/images/',
                  '^../assets/animations/',
                  '^../../assets/animations/'
                ],
                ['^@/ui/constants'],
                [
                  '^config/',
                  '^@/config',
                  '^@/ui/config',
                  '^types/',
                  '^@/types/',
                  '^@/ui/types/',
                  '^constants/',
                  '^@/constants/',
                  '^@/ui/constants/'
                ],
                ['^stores/', '^@/stores/', '^@/ui/stores/'],
                ['^styles/', '^@/styles/', '^@/ui/styles/'],
                ['^\\./*.*viewModel'],
                ['^vite-env/', '^@/vite-env/']
              ]
            }
          ]
        }
      }, // view.tsx
      {
        files: ['*.viewModel.tsx'],
        rules: {
          'simple-import-sort/imports': [
            'error',
            {
              groups: [
                ['^react', '^mobx', '^@?\\w', '^react-router-dom'],
                ['^domain/entities/', '^@/domain/entities/'],
                ['^useCases/', '^@/useCases/', '^@/domain/useCases/'],
                ['^@/ui/i18n'],
                ['^@/ui/constants'],
                [
                  '^config/',
                  '^@/config',
                  '^@/ui/config',
                  '^types/',
                  '^@/types/',
                  '^@/ui/types/',
                  '^constants/',
                  '^@/constants/',
                  '^@/ui/constants/'
                ],
                ['^utils/', '^@/utils/', '^@/ui/utils/'],
                ['^stores/', '^@/stores/', '^@/ui/stores/'],
                ['^styles/', '^@/styles/', '^@/ui/styles/'],
                ['^\\./*.*viewModel'],
                ['@/vite-env']
              ]
            }
          ]
        }
      } // viewModel.tsx
    ]
  },
  tseslint.configs.recommended,
  pluginReact.configs.flat.recommended
]);
