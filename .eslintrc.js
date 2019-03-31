const ERROR = 2;
const WARN = 1;
const OFF = 0;

module.exports = {
  "env": {
    "browser": true,
    "mocha": true
  },
  "parser": "babel-eslint",
  "parserOptions": {
    "ecmaVersion": 2016,
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  "extends": ["airbnb", "prettier"],
  rules: {
    // rules to fix - delete the line
    'no-unused-vars': WARN,
    'prefer-destructuring': WARN,
    'no-use-before-define': WARN,
    'no-param-reassign': WARN,
    'import/extensions': WARN,
    'react/no-array-index-key': WARN,
    'react/no-access-state-in-setstate': WARN,
    'import/no-unresolved': WARN,
    'no-plusplus': WARN,
    'react/forbid-prop-types': WARN,
    'jsx-a11y/anchor-is-valid': WARN,
    'jsx-a11y/click-events-have-key-events': WARN,
    'jsx-a11y/no-static-element-interactions': WARN,
    'jsx-a11y/no-noninteractive-element-interactions': WARN,
    'jsx-a11y/no-autofocus': WARN,
    'jsx-a11y/alt-text': WARN,
    'import/no-mutable-exports': WARN,
    'no-case-declarations': WARN,
    'jsx-a11y/anchor-has-content': WARN,
    'react/no-this-in-sfc': WARN,

    // our specific rules
    'react/jsx-filename-extension': OFF,
    'react/require-default-props': OFF,
    'react/sort-comp': OFF,
    'react/destructuring-assignment': OFF,
    'react/button-has-type': OFF,
    'no-unused-expressions': [ERROR, { allowShortCircuit: true, allowTernary: true }],
    complexity: [WARN, 20],
    eqeqeq: [WARN, 'smart'],
    'guard-for-in': WARN,
    'no-constant-condition': ERROR,
    'no-console': WARN,
    'no-redeclare': [ERROR, { builtinGlobals: true }],
    'object-curly-spacing': [ERROR, 'always'],
    indent: ['error', ERROR, { SwitchCase: WARN }],
    'comma-dangle': [ERROR, 'always-multiline'],
    'key-spacing': [ERROR, { afterColon: true, mode: 'minimum' }],
    'no-multiple-empty-lines': [ERROR, { max: ERROR }],
    'no-mixed-spaces-and-tabs': [ERROR, 'smart-tabs'],
    'max-nested-callbacks': [WARN, 10],
    'consistent-this': [WARN, 'self'],
    'no-unexpected-multiline': WARN,
    'no-extra-semi': WARN,
    'no-negated-in-lhs': WARN,
    'linebreak-style': OFF,
    'no-underscore-dangle': OFF,
    "react/jsx-one-expression-per-line": [WARN, { "allow": "single-child" }],
  },
  "overrides": [
    {
      "files": ["**/__tests__/*.js"],
      "rules": {
        "no-unused-expressions": OFF
      }
    }
  ],
  "globals": {
    "t": true,
    "browser": true,
    "sinon": true,
    "expect": true,
    "cordova": true
  },
  "settings": {
    "import/resolver": {
      "webpack": {
        "config": "other/webpack.common.js"
      }
    },
     "react": {
        "version": "16.8"
      }
  }
};
