// ES5 shims for Function.prototype.bind, Object.prototype.keys, etc.
require('core-js/es5');
require('core-js/es6/map');
require('core-js/es6/set');

// other shims
require('indexeddbshim');
require('es6-promise/auto');
require('helpers/object-assign');
require('helpers/array-fill');

// Replace ./src/js with the directory of your application code and
// make sure the file name regexp matches your test files.
const context = require.context('../src/', true, /-test\.js$/);
context.keys().forEach(context);
