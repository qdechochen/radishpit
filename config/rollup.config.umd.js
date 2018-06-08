import babel from 'rollup-plugin-babel'

import config from './rollup.config';

config.plugins.push(
  babel({
    exclude: 'node_modules/**',
    sourceMap: true,
    babelrc: false,"presets": [
      ["latest", {
        "es2015": {
          "modules": false
        }
      }]
    ],
    plugins: [
      'external-helpers',
      'transform-async-to-generator',
      'transform-object-rest-spread',
    ],
  }),
);
config.output = {
  file: 'dist/index.umd.js',
  format: 'umd',
  name: 'RadishPit',
};

export default config;