// polyfills
require('core-js/es6/map');
require('core-js/es6/set');
require('core-js/fn/object/assign');
require('core-js/fn/array/fill');
require('core-js/fn/array/includes');

// Replace ./src/js with the directory of your application code and
// make sure the file name regexp matches your test files.
const context = require.context('../src/', true, /-test\.js$/);
context.keys().forEach(context);
