/** ****************************************************************************
 * Takes care of application execution logging.
 *
 * Depends on indicia.
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
import Raven from 'raven-js';
import CONFIG from 'config';

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
function error(err = {}) {
  if (typeof err === 'string' || err instanceof String) {
    err = {
      message: err,
    };
  }

  if (Raven) {
    Raven.captureException(err);
  }

  console.error(err.message, err.url, err.line, err.column, err.obj);
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
      // if (typeof console.trace === 'function') console.trace();
    }
  }
}

export { log as default };
