/******************************************************************************
 * Welcome page view.
 *****************************************************************************/
define([
  'marionette',
  'JST',
  'log'
], function (Marionette, JST, log) {
  'use strict';

  let View = Marionette.ItemView.extend({
    template: JST['common/location/main']
  });

  return View;
});
