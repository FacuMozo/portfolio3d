module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { react: { version: '18.2' } },
  plugins: ['react-refresh'],
  rules: {
    // No PropTypes in this project.
    'react/prop-types': 'off',
    // react-three-fiber elements take three.js props that aren't DOM attributes.
    'react/no-unknown-property': ['error', {
      ignore: ['object', 'geometry', 'material', 'position', 'rotation', 'scale', 'intensity'],
    }],
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
  },
  overrides: [
    {
      // Ocean scene files are almost entirely three.js JSX (args, castShadow,
      // position-y, flatShading...), none of which are DOM attributes.
      files: ['src/ocean/scene/**/*.jsx'],
      rules: { 'react/no-unknown-property': 'off' },
    },
  ],
}
