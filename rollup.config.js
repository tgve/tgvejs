import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import postcss from 'rollup-plugin-postcss';
import json from '@rollup/plugin-json';
import image from '@rollup/plugin-image';

import pkg from './package.json';
import deckpkg from './node_modules/deck.gl/package.json';

const extensions = ['.js', '.jsx', '.ts', '.tsx'];
const EXTERNALS = Object.keys(pkg.dependencies)
  .concat([
    'react', 'react-dom',
    'qs',
    '@luma.gl/engine',
    '@luma.gl/webgl',
    'baseui/a11y',
    'baseui/accordion',
    'baseui/aspect-ratio-box',
    'baseui/avatar',
    'baseui/block',
    'baseui/breadcrumbs',
    'baseui/button',
    'baseui/button-group',
    'baseui/card',
    'baseui/checkbox',
    'baseui/codemods',
    'baseui/datepicker',
    'baseui/dnd-list',
    'baseui/es',
    'baseui/esm',
    'baseui/file-uploader',
    'baseui/flex-grid',
    'baseui/form-control',
    'baseui/header-navigation',
    'baseui/heading',
    'baseui/helpers',
    'baseui/icon',
    'baseui/input',
    'baseui/layer',
    'baseui/link',
    'baseui/locale',
    'baseui/menu',
    'baseui/modal',
    'baseui/notification',
    'baseui/pagination',
    'baseui/payment-card',
    'baseui/phone-input',
    'baseui/popover',
    'baseui/progress-bar',
    'baseui/progress-steps',
    'baseui/radio',
    'baseui/rating',
    'baseui/select',
    'baseui/side-navigation',
    'baseui/slider',
    'baseui/spinner',
    'baseui/styles',
    'baseui/table',
    'baseui/tabs',
    'baseui/tag',
    'baseui/template-component',
    'baseui/test',
    'baseui/textarea',
    'baseui/themes',
    'baseui/toast',
    'baseui/tooltip',
    'baseui/typography',
    'baseui/utils'
  ])
  .concat(Object.keys((deckpkg && deckpkg.dependencies) || {}));

const config = [{
  input: 'src/index.js',
  output: {
    intro: 'const ENVIRONMENT = "production";',
    format: "cjs",
    file: "dist/tgve.js",
    name: 'tgve'
  },
  watch: {
    exclude: 'node_modules/**'
  },
  plugins: [
    resolve({
      skip: EXTERNALS,
      mainFields: ['module', 'main', 'jsnext:main', 'browser'],
      extensions
    }),
    babel({
      babelHelpers: 'bundled',
      exclude: './node_modules/**',
      presets: ['@babel/env', '@babel/preset-react'],
      extensions,
    }),
    commonjs(),
    postcss({
      plugins: []
    }),
    json(),
    image()
  ],
  external: EXTERNALS.concat(["lodash", "polished", "underscore"])
}];
export default config;
