/******************************************************************************
 * App model. Persistent.
 *****************************************************************************/
define([
  'backbone',
  'backbone.localStorage'
], function (Backbone) {

  'use strict';

  var App = Backbone.Model.extend({

    id: 'app',

    localStorage: new Store(app.NAME),

    /**
     * Initializes the object.
     */
    initialize: function () {
      this.fetch();
      if (!this.get('appVer')) {
        this.save ('appVer', app.VERSION);
      }
    }
  });

  return App;
});