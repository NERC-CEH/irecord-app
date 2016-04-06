/**
 * Google analytics to track the page navigation.
 */
import Backbone from 'backbone';
import $script from 'script';
import CONFIG from 'config'; // Replaced with alias

export default {
  init() {
    // http://veithen.github.io/2015/02/14/requirejs-google-analytics.html
    if (CONFIG.ga.status) {
      $script(['https://www.google-analytics.com/analytics.js'], () => {
        ga('create', CONFIG.ga.ID, 'auto');
        ga('set', 'appName', CONFIG.name);
        ga('set', 'appVersion', CONFIG.version);
      });
    }

    // listen for page change
    Backbone.history.on('route', () => {
      const gaTrackPageview = () => {
        // Google Analytics
        if (CONFIG.ga.status) {
          if (window.ga) {
            var url = Backbone.history.getFragment();

            // Add a slash if neccesary
            if (!/^\//.test(url)) url = '/' + url;

            // Record page view
            ga('send', {
              'hitType': 'pageview',
              'page': url
            });
          }
        }
      };

      gaTrackPageview();
    });
  },
};
