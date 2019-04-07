// polyfills for Android 5.0
require('core-js/features/map');
require('core-js/features/set');

// Replace ./src/js with the directory of your application code and
// make sure the file name regexp matches your test files.
const context = require.context('../src/', true, /-test\.js$/);
context.keys().forEach(context);
