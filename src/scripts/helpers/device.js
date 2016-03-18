/** ****************************************************************************
 * Functions to work with device information.
 *
 * Checks if the page is in the home screen (app) mode.
 * Generic function to detect the browser/device vendor.
 *
 * Note: Chrome has to have and ID of both Chrome and Safari therefore
 * Safari has to have an ID of only Safari and not Chrome
 *****************************************************************************/
const ua = navigator.userAgent.toLowerCase();

function is(string) {
  return ua.search(string) >= 0;
}

const isIPhone = is('iphone');
const isIPad = is('ipad');
const isIPod = is('ipad');
const isChrome = is('chrome') || is('crmo');
const isFirefox = is('firefox');

function isMobile() {
  return is('mobile') || is('android');
}

function detect(browserName) {
  const browser = browserName.toLowerCase();

  if (browser === 'chrome' || browser === 'safari') {
    const isChrome = is('chrome'),
      isSafari = is('safari');

    if (isSafari) {
      if (browser === 'chrome') {
        // Chrome
        return isChrome;
      }
      // Safari
      return !isChrome;
    }
    if (isMobile()) {
      // Safari homescreen Agent has only 'Mobile'
      return true;
    }
    return false;
  }
  return (is(browser));
}

function isIOS() {
  return isIPad || isIPod || isIPhone;
}

function isAndroidChrome() {
  return is('android') && isChrome;
}

function getIOSVersion() {
  const ver = /i.*OS (\d+)_(\d+)(?:_(\d+))?/i.exec(ua);
  return ver[1];
}

function isHomeMode() {
  try {
    const iOS = window.navigator.standalone;
    const IE = (window.external && window.external.msIsSiteMode &&
    window.external.msIsSiteMode());

    return iOS || IE;
  } catch (err) {
    console.error(err);

    return false;
  }
}

function isAndroid() {
  if (window.cordova && window.device) {
    return window.device.platform === 'Android';
  }
  return is('android');
}

export default {
  is,
  detect,
  isMobile,
  isIOS,
  isIPhone,
  isAndroidChrome,
  getIOSVersion,
  isHomeMode,
  isAndroid,
};

