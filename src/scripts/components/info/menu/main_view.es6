/******************************************************************************
 * Welcome page view.
 *****************************************************************************/
define([
  'marionette',
  'log',
  'JST'
], function (Marionette, Log, JST) {
  'use strict';

  var View = Marionette.ItemView.extend({
    tagName: 'ul',
    className: 'table-view buttons',
    
    template: JST['info/menu/main'],

    events: {
      'click #logout-button': 'logout'
    },

    modelEvents: {
      'change': 'render'
    },

    serializeDate: function () {
      return {
        surname: this.model.get('surname')
      }
    },

    logout: function () {
      this.trigger('user:logout');
    }
  });

  return View;
});
