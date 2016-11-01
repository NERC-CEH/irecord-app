/** ****************************************************************************
 * Functions to work with device information.
 *
 * Checks if the page is in the home screen (app) mode.
 * Generic function to detect the browser/device vendor.
 *
 * Note: Chrome has to have and ID of both Chrome and Safari therefore
 * Safari has to have an ID of only Safari and not Chrome
 *****************************************************************************/
import { Log } from 'helpers';

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
    const isSafari = is('safari');

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
  if (window.cordova && window.device) {
    return window.device.platform === 'iOS';
  }

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
    Log(err, 'e');

    return false;
  }
}

function isAndroid() {
  if (window.cordova && window.device) {
    return window.device.platform === 'Android';
  }
  return is('android');
}

function isOnline() {
  if (window.cordova && window.device) {
    return window.navigator.connection.type !== window.Connection.NONE;
  }
  return window.navigator.onLine;
}

function connectionWifi() {
  if (window.cordova && window.device) {
    return window.navigator.connection.type === window.Connection.WIFI;
  }
  return window.navigator.onLine;
}

function getVersion() {
  if (window.cordova) {
    return window.device.version;
  }
  return '';
}

function getPlatform() {
  let devicePlatform;
  if (window.cordova) {
    devicePlatform = window.device.platform;
  } else if (isAndroidChrome()) {
    devicePlatform = 'Android';
  } else if (isIOS()) {
    devicePlatform = 'iOS';
  }

  return devicePlatform;
}

export default {
  is,
  detect,
  isMobile,
  isIOS,
  isIPhone,
  isFirefox,
  isAndroidChrome,
  getIOSVersion,
  isHomeMode,
  isAndroid,
  isOnline,
  connectionWifi,
  getVersion,
  getPlatform,
};

