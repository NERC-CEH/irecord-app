/******************************************************************************
 * Functions to work with browser information.
 *
 * Checks if the page is in the home screen (app) mode.
 * Generic function to detect the browser vendor.
 *
 * Note: Chrome has to have and ID of both Chrome and Safari therefore
 * Safari has to have an ID of only Safari and not Chrome
 *****************************************************************************/
define([], function () {
  "use strict";
  var ua = navigator.userAgent.toLowerCase();

  var isIPhone = is('iphone');
  var isIPad = is('ipad');
  var isIPod = is('ipad');
  var isChrome = is('chrome') || is('crmo');
  var isFirefox = is('firefox');


  function is (string) {
    return ua.search(string) >= 0;
  }

  var detect = function (browser) {
    browser = browser.toLowerCase();

    "use strict";
    if (browser === 'chrome' || browser === 'safari') {
      var isChrome = is('chrome'),
          isSafari = is("safari");

      if (isSafari) {
        if (browser === 'chrome') {
          //Chrome
          return isChrome;
        }
        //Safari
        return !isChrome;
      }
      if (isMobile()) {
        //Safari homescreen Agent has only 'Mobile'
        return true;
      }
      return false;
    }
    return (is(browser));
  };

  var isMobile = function () {
    return is('mobile') || is('android');
  };

  var isIOS = function () {
    return isIPad || isIPod || isIPhone;
  };

  var isAndroidChrome = function () {
    return is('android') && isChrome;
  };

  var getIOSVersion = function () {
    var ver = /i.*OS (\d+)_(\d+)(?:_(\d+))?/i.exec(ua);
    return ver[1];
  };

  var isHomeMode = function () {
    try {
      var iOS = window.navigator.standalone,
          IE = (window.external && window.external.msIsSiteMode && window.external.msIsSiteMode());

      return iOS || IE;
    } catch (err) {
      _log(err, log.ERROR);

      return false;
    }

  };

  return {
    is: is,
    detect: detect,
    isMobile: isMobile,
    isIOS: isIOS,
    isIPhone: isIPhone,
    isAndroidChrome: isAndroidChrome,
    getIOSVersion: getIOSVersion,
    isHomeMode: isHomeMode
  };
});


