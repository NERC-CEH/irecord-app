/**
 * Google analytics to track the page navigation.
 */
import Backbone from 'backbone';
import CONFIG from 'config'; // Replaced with alias

let initialized = false;

// todo: do not track connection is not WIFI or 3G/4G

const API = {
  init() {
    // initialize only once
    if (initialized) return;

    if (window.cordova && CONFIG.ga.status) {
      document.addEventListener('deviceready', () => {
        window.analytics.startTrackerWithId(CONFIG.ga.ID);
        window.analytics.enableUncaughtExceptionReporting(true);

        // listen for page change
        Backbone.history.on('route', () => { API.trackView(); });

        initialized = true;
      });
    }
  },

  /**
   * Record page view.
   * @param view
   */
  trackView(view) {
    if (!initialized) return;

    // submit the passed view
    if (view) {
      window.analytics.trackView(view);
      return;
    }

    // get current view
    let url = Backbone.history.getFragment();

    // Add a slash if neccesary
    if (!/^\//.test(url)) url = `/${url}`;

    // remove specific UUIDs
    url = url.replace(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g,
      'UUID'
    );

    window.analytics.trackView(url);
  },

  trackEvent(category, event) {
    if (!initialized) return;

    window.analytics.trackEvent(category, event);
  },

  trackException(err, fatal = false) {
    if (!initialized || !CONFIG.log.ga_error) return;

    const description = `${err.message} ${err.url}
      ${err.line} ${err.column} ${err.obj}`;

    window.analytics.trackException(description, fatal);
  },
};

export { API as default };

