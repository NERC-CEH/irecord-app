/******************************************************************************
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
define(['app-config'], function (CONFIG) {
  "use strict";

  let ERROR = 'e',
      WARNING = 'w',
      INFO = 'i',
      DEBUG = 'd';

  let Log = {
    core: function (message, type = DEBUG) {
      //do nothing if logging turned off
      if (!(CONFIG.log && CONFIG.log.states)) {
        return;
      }

      if (CONFIG.log.states.indexOf(type) >= 0) {
        switch (type) {
          case ERROR:
            Log.error(message);
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
            //IE does not support console.debug
            if (!console.debug) {
              console.log(message);
              break;
            }
            console.debug(message);
        }
      }
    },


    /**
     * Prints and posts an error to the mobile authentication log.
     *
     * @param error Object holding a 'message', and optionally 'url' and 'line' fields.
     *              String holding a 'message
     * @private
     */
    error: function (error) {
      "use strict";
      if (typeof error === 'string' || error instanceof String) {
        error = {
          message: error
        }
      }
      console.error(error.message, error.url, error.line, error.column, error.obj);

      //todo: clean this up
      $('#loader #animation span.icon').remove();
      $('#loader #animation .error').html(
        '<center><b>Oh no, Error! </b></center><br/>' + error.message +
        ' [' +  error.line + ', '  + error.column + '] ' +
        error.obj);

      //google analytics error logging
      if ((CONFIG.ga && CONFIG.ga.status) &&
        (CONFIG.log && CONFIG.log.ga_error)){

        require(['ga'], function (ga) {
          //check if the error did not occur before the analytics is loaded
          if (ga) {
            ga('send', 'exception', {
              'exDescription':
              error.message + ' ' +
              error.url + ' ' +
              error.line + ' ' +
              error.column + ' ' +
              error.obj
            });
          }
        });
      }
    }
  };

  //Hook into window.error function
  window.onerror = function (message, url, line, column, obj) {
    "use strict";
    window.onerror = null;

    var error = {
      'message': message,
      'url': url || '',
      'line': line || -1,
      'column': column || -1,
      'obj': obj || ''
    };

    Log.error(error);

    window.onerror = this; // turn on error handling again
    return true; // suppress normal error reporting
  };

  return Log.core;
});
