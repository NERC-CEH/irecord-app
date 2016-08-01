/**
 * Google analytics to track the page navigation.
 */
import Backbone from 'backbone';
import Device from './device';
import appModel from '../components/common/models/app_model';
import CONFIG from 'config'; // Replaced with alias

// todo: do not track connection is not WIFI or 3G/4G

const API = {
  initialized: false,

  init() {
    // initialize only once
    if (this.initialized) return;

    if (window.cordova && CONFIG.ga.status) {
      document.addEventListener('deviceready', () => {
        window.analytics.startTrackerWithId(CONFIG.ga.ID);
        window.analytics.enableUncaughtExceptionReporting(true);

        // listen for page change
        Backbone.history.on('route', () => { API.trackView(); });

        this.initialized = true;
      });
    }
  },

  /**
   * Record page view.
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
    if (!this.initialized) return;

    window.analytics.trackEvent(category, event);
  },

  trackException(err = {}, fatal = false) {
    if (!this.initialized || !CONFIG.log.ga_error) return;

    // todo: remove this excheption when fixed
    if (err.message.indexOf('ViewDestroyedError') >= 0) return;

    // build exception descriptor
    let description = `${err.message} ${err.url}
      ${err.line} ${err.column}`;

    if (err.obj && err.obj.stack) {
      description += ` ${err.obj.stack}`;
    }

    if (Device.isOnline()) {
      // send error
      window.analytics.trackException(description, fatal);
      this.sendAllExceptions();
    } else {
      // store for offline
      this.saveException(description);
    }
  },

  sendAllExceptions() {
    const offlineExceptions = appModel.get('exceptions');
    if (offlineExceptions.length && Device.isOnline()) {
      offlineExceptions.forEach((exceptionDescription) => {
        window.analytics.trackException(exceptionDescription, false);
      });
      appModel.set('exceptions', []);
      appModel.save();
    }
  },

  saveException(description) {
    const offlineExceptions = appModel.get('exceptions');
    offlineExceptions.push(description);
    appModel.set('exceptions', offlineExceptions);
    appModel.save();
  },
};

export { API as default };

