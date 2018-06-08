// http://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    browser: true,
  },
  extends: 'airbnb-base',
  // required to lint *.vue files
  plugins: [
    'html'
  ],
  // check if imports actually resolve
  'settings': {
    'import/resolver': {
      'webpack': {
        'config': 'build/webpack.base.conf.js'
      }
    }
  },
  // add your custom rules here
  'rules': {
    // don't require .vue extension when importing
    'import/extensions': ['error', 'always', {
      'js': 'never',
      'vue': 'never'
    }],
    // allow optionalDependencies
    'import/no-extraneous-dependencies': ['error', {
      'optionalDependencies': ['test/unit/index.js']
    }],
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    'no-param-reassign': 0,
    'no-console': 0,
    'no-underscore-dangle': 0,
    'no-plusplus': 0,
    'no-await-in-loop': 0,
    'import/no-mutable-exports': 0,
    'guard-for-in': 0,
    'no-restricted-syntax': 0,
    'no-unused-vars': 1,
    'max-len': 0,
    "function-paren-newline": ["error", "consistent"],
    "arrow-parens": ["error", "always"],
  }
}
