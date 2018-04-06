/** ****************************************************************************
 * Main app development configuration file.
 *
 * Use this to overwrite/extend the config.js file.
 **************************************************************************** */
import $ from 'jquery';
import config from './config';

const newConfig = $.extend(true, config, {
  // overwrite indicia configuration
  indicia: {},
});

export default newConfig;
