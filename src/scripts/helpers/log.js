/** ****************************************************************************
 * Takes care of application execution logging.
 *
 * Depends on morel.
 *
 * Uses 5 levels of logging:
 *  0: none
 *  1: errors
 *  2: warnings
 *  3: information
 *  4: debug
 *
 * Levels values defined in core app module.
 *****************************************************************************/

import $ from 'jquery';
import CONFIG from 'config'; // Replaced with alias

const ERROR = 'e';
const WARNING = 'w';
const INFO = 'i';
const DEBUG = 'd';


/**
 * Prints and posts an error to the mobile authentication log.
 *
 * @param error Object holding a 'message', and optionally 'url' and 'line' fields.
 *              String holding a 'message
 * @private
 */
function error(errorMessage) {
  let err = errorMessage;
  if (typeof err === 'string' || err instanceof String) {
    err = {
      message: err,
    };
  }
  console.error(err.message, err.url, err.line, err.column, err.obj);

  // todo: clean this up
  $('#loader #animation span.icon').remove();
  $('#loader #animation .error').html(
    `<center><b>Oh no, Error! </b></center><br/>${err.message}
    [${err.line}, ${err.column}] ${err.obj}`);

  // google analytics error logging
  if ((CONFIG.ga && CONFIG.ga.status) &&
    (CONFIG.log && CONFIG.log.ga_error)) {

    // require(['ga'], function (ga) {
    //  //check if the error did not occur before the analytics is loaded
    //  if (ga) {
    //    ga('send', 'exception', {
    //      'exDescription':
    //      err.message + ' ' +
    //      err.url + ' ' +
    //      err.line + ' ' +
    //      err.column + ' ' +
    //      err.obj
    //    });
    //  }
    // });
  }
}

function log(message, type = DEBUG) {
  // do nothing if logging turned off
  if (!(CONFIG.log && CONFIG.log.states)) {
    return;
  }

  if (CONFIG.log.states.indexOf(type) >= 0) {
    switch (type) {
      case ERROR:
        error(message);
        break;
      case WARNING:
        console.warn(message);
        break;
      case INFO:
        console.log(message);
        break;
      case DEBUG:
      /* falls through */
      default:
        // IE does not support console.debug
        if (!console.debug) {
          console.log(message);
          break;
        }
        console.debug(message);
    }
  }
}

//
// //Hook into window.error function
// window.onerror = function (message, url, line, column, obj) {
//  "use strict";
//  window.onerror = null;
//
//  var err = {
//    'message': message,
//    'url': url || '',
//    'line': line || -1,
//    'column': column || -1,
//    'obj': obj || ''
//  };
//
//  error(err);
//
//  window.onerror = this; // turn on error handling again
//  return true; // suppress normal error reporting
// };

export { log as default };
