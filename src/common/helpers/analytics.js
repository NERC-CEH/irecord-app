/**
 * Google analytics to track the page navigation.
 */
import Backbone from 'backbone';
import Raven from 'raven-js';
import CONFIG from 'config';

const API = {
  initialized: false,

  init() {
    // initialize only once
    if (this.initialized) return;

    // Turn on the error logging
    Raven
      .config(`https://${CONFIG.sentry.key}@sentry.io/${CONFIG.sentry.project}`, {
        environment: process.env.ENV,
        release: CONFIG.version,
        ignoreErrors: [
          'setSelectionRange', // there is some fastclick issue (does not affect ux)
          'Incorrect password or email', // no need to log that
        ],
      })
      .install();

    // capture unhandled promises
    window.onunhandledrejection = (e) => {
      Raven.captureException(e.reason, {
        extra: { unhandledPromise: true },
      });
    };

    if (window.cordova && CONFIG.ga.status) {
      document.addEventListener('deviceready', () => {
        window.analytics.startTrackerWithId(CONFIG.ga.ID);
        window.analytics.enableUncaughtExceptionReporting(true);

        // listen for page change
        Backbone.history.on('route', () => {
          API.trackView();
        });

        this.initialized = true;
      });
    }
  },

  /**
   * Sample page view.
   * @param view
   */
  trackView(view) {
    if (!this.initialized) return;

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
    if (!this.initialized) return;

    window.analytics.trackEvent(category, event);
  },

  _getURL() {
    let url = Backbone.history.getFragment();

    // Add a slash if neccesary
    if (!/^\//.test(url)) url = `/${url}`;

    url = this._removeUUID(url);
    return url;
  },

  _removeUUID(string) {
    // remove specific UUIDs
    return string.replace(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g,
      'UUID'
    );
  },
};

export { API as default };

