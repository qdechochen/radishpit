import config from './rollup.config';

config.output = {
  file: 'dist/index.js',
  format: 'cjs',
  name: 'RadishPit',
};

export default config;