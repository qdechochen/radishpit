import config from './rollup.config.js';

config.output = {
  file: 'dist/index.js',
  format: 'cjs',
  name: 'RadishPit',
};

export default config;