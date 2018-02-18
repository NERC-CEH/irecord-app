/**
 * Application analytics.
 *
 * Uses Google analytics to track the page navigation and Sentry to server log
 * client side errors.
 */
import _ from 'lodash';
import Backbone from 'backbone';
import Raven from 'raven-js';
import CONFIG from 'config';
import Log from './log';

function removeUUID(string) {
  // remove specific UUIDs
  return string.replace(
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
    'UUID'
  );
}

export function removeUserId(URL) {
  return URL.replace(/\/users\/.*/g, '/users/USERID');
}

export function breadcrumbCallback(crumb) {
  // clean UUIDs
  if (crumb.category === 'navigation') {
    const cleanCrumb = _.cloneDeep(crumb);
    cleanCrumb.data = {
      to: removeUUID(crumb.data.to),
      from: removeUUID(crumb.data.from),
    };
    return cleanCrumb;
  }
  if (crumb.category === 'xhr') {
    if (crumb.data.method === 'GET' && crumb.data.url.match(/jpeg$/i)) {
      // do not log image requests
      return false;
    }

    const cleanCrumb = _.cloneDeep(crumb);
    cleanCrumb.data = {
      url: removeUserId(crumb.data.url),
    };
    return cleanCrumb;
  }

  return crumb;
}

const API = {
  initialized: false,

  init() {
    Log('Analytics: initializing.');

    // initialize only once
    if (this.initialized) {
      return;
    }

    // Turn on the error logging
    if (CONFIG.sentry.key) {
      Log('Analytics: turning on server error logging.');
      Raven.config(
        `https://${CONFIG.sentry.key}@sentry.io/${CONFIG.sentry.project}`,
        {
          environment: CONFIG.environment,
          release: CONFIG.version,
          ignoreErrors: [
            'setSelectionRange', // there is some fastclick issue (does not affect ux)
            'Incorrect password or email', // no need to log that
            'Backbone.history', // on refresh fires this error, todo: fix it
          ],
          breadcrumbCallback,
        }
      ).install();
    } else {
      Log(
        'Analytics: server error logging is turned off. Please provide Sentry key.',
        'w'
      );
    }

    // capture unhandled promises
    window.onunhandledrejection = e => {
      Raven.captureException(e.reason, {
        extra: { unhandledPromise: true },
      });
    };

    if (window.cordova && CONFIG.ga.id) {
      document.addEventListener('deviceready', () => {
        Log('Analytics: turning on Google Analytics.');

        window.analytics.startTrackerWithId(CONFIG.ga.id);
        window.analytics.enableUncaughtExceptionReporting(true);

        // listen for page change
        Backbone.history.on('route', () => {
          API.trackView();
        });

        this.initialized = true;
      });
    } else {
      Log(
        `Analytics: Google Analytics is turned off. ${
          window.cordova ? 'Please provide the GA tracking ID.' : ''
        }`,
        'w'
      );
    }
  },

  /**
   * Sample page view.
   * @param view
   */
  trackView(view) {
    if (!this.initialized) {
      return;
    }

    // submit the passed view
    if (view) {
      window.analytics.trackView(view);
      return;
    }

    // get current view
    const url = this._getURL();
    window.analytics.trackView(url);
  },

  trackEvent(category, event) {
    if (!this.initialized) {
      return;
    }

    window.analytics.trackEvent(category, event);
  },

  _getURL() {
    let url = Backbone.history.getFragment();

    // Add a slash if neccesary
    if (!/^\//.test(url)) {
      url = `/${url}`;
    }

    url = this._removeUUID(url);
    return url;
  },
};

// init Analytics
API.init();

export { API as default };
