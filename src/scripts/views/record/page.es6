/******************************************************************************
 * Welcome page view.
 *****************************************************************************/
define([
  'views/_page',
  'JST',
  'helpers/log'
], function (DefaultPage, JST, log) {
  'use strict';

  var Page = DefaultPage.extend({
    id: 'record',

    template: JST['record/page'],

    initialize: function () {
      log('views.RecordPage: initialize', 'd');
      this.render();
      return this;
    },

    render: function () {
      log('views.RecordPage: render', 'd');

      this.$el.html(this.template());
      $('#app').append($(this.el));
      return this;
    }
  });

  return Page;
});
