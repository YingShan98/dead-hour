module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:prettier/recommended',
  ],
  ignorePatterns: ['dist', 'build', 'coverage'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
    '@typescript-eslint/naming-convention': [
      'error',
      // Interfaces: PascalCase, no "I" prefix (TypeScript team standard)
      {
        selector: 'interface',
        format: ['PascalCase'],
        custom: { regex: '^I[A-Z]', match: false },
      },
      // Type aliases: PascalCase
      {
        selector: 'typeAlias',
        format: ['PascalCase'],
      },
      // Classes: PascalCase
      {
        selector: 'class',
        format: ['PascalCase'],
      },
      // Enums: PascalCase
      {
        selector: 'enum',
        format: ['PascalCase'],
      },
      // Enum members: PascalCase (e.g. Direction.North, not Direction.NORTH)
      {
        selector: 'enumMember',
        format: ['PascalCase'],
      },
      // Generic type parameters: PascalCase (T, TKey, TValue, etc.)
      {
        selector: 'typeParameter',
        format: ['PascalCase'],
      },
    ],
  },
}
