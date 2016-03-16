/**
 * Google analytics to track the page navigation.
 */
import Backbone from '../../vendor/backbone/js/backbone';
import CONFIG from 'config'; // Replaced with alias

export default {
  init() {
    //http://veithen.github.io/2015/02/14/requirejs-google-analytics.html
    if (CONFIG.ga.status) {
      window.GoogleAnalyticsObject = '__ga__';
      window.__ga__ = {
        q: [[
          'create',
          CONFIG.ga.ID,
          'auto',
        ]],
        l: Date.now(),
      };
      //require(['ga'], function(ga) {
      //  ga('set', 'appName', CONFIG.name);
      //  ga('set', 'appVersion', CONFIG.version);
      //});
    }

    //listen for page change
    Backbone.history.on('route', function () {
      const gaTrackPageview =  function () {
        // Google Analytics
        if (CONFIG.ga.status) {
          //require(['ga'], function(ga) {
          //  var url = Backbone.history.getFragment();
          //
          //  // Add a slash if neccesary
          //  if (!/^\//.test(url)) url = '/' + url;
          //
          //  // Record page view
          //  ga('send', {
          //    'hitType': 'pageview',
          //    'page': url
          //  });
          //});
        }
      };

      gaTrackPageview();
    });
  },
};
