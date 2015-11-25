'use strict';

/******************************************************************************
 * Welcome page view.
 *****************************************************************************/
define(['marionette', 'JST', 'log'], function (Marionette, JST, log) {
  'use strict';

  var View = Marionette.ItemView.extend({
    tagName: 'li',
    className: 'table-view-cell alert',
    template: JST['records/list/list-none']
  });

  return View;
});
