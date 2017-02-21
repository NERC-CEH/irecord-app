/** ****************************************************************************
 * App start.
 *****************************************************************************/

import App from 'app';
import Raven from 'raven-js';
import 'photoswipe/dist/photoswipe.css';
import 'photoswipe/dist/default-skin/default-skin.css';
import 'photoswipe/dist/default-skin/default-skin.png';
import 'photoswipe/dist/default-skin/default-skin.svg';

import './samples/router';
import './info/router';
import './settings/router';
import './user/router';

import '../node_modules/ratchet/dist/css/ratchet.css';
import '../node_modules/ratchet/dist/fonts/ratchicons.ttf';
import '../node_modules/ratchet/dist/fonts/ratchicons.woff';
import '../dist/_build/styles/icons.css';
import './common/styles/app.scss';

Raven
  .config('https://fdde66f95b1c4f50a8186e828b595351@sentry.io/128357', {
    environment: 'development',
    release: '1.2.1',
  })
  .install();

window.Raven = Raven;
// Load the mighty app :)
App.start();
