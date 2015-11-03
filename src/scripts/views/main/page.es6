/******************************************************************************
 * Welcome page view.
 *****************************************************************************/
define([
  'views/_page',
  'templates',
  'conf'
], function (DefaultPage) {
  'use strict';

  var Page = DefaultPage.extend({
    id: 'main',

    template: app.jst['main/page'],

    initialize: function () {
      _log('views.MainPage: initialize', log.DEBUG);
      this.render();
      return this;
    },

    render: function () {
      _log('views.MainPage: render', log.DEBUG);

      this.$el.html(this.template());
      $('body').append($(this.el));
      return this;
    }
  });

  return Page;
});
