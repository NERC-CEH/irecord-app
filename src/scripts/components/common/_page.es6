/******************************************************************************
 * A default JQM page view.
 *****************************************************************************/
define([
  'backbone',
  'log'
], function (Backbone, log) {
  'use strict';

  var Page = Backbone.View.extend({
    tagName: 'div',
    role: "page",

    /**
     * Initializes the page view by rendering the template and appending it to
     * the body.
     *
     * @param id
     */
    initialize: function (id) {
      log('views.Page(' + id + '): initialize', 'd');

      this.el.id = id;
      this.id = id;
      this.template = app.templates['p_' + id]; //p_ prefix for page

      this.render();
      this.appendBackButtonListeners();
    },

    /**
     * Renders the page view.
     *
     * @returns {Page}
     */
    render: function () {
      log('views.Page(' + this.id + '): render', 'd');

      $(this.el).html(this.template());
      $('body').append($(this.el));

      return this;
    },

    appendEventListeners: function () {
      this.appendBackButtonListeners();
    },

    /**
     * Append element attributes.
     *
     * @returns {{data-role: (string|Page.role)}}
     */
    attributes: function () {
      return {
        "data-role": this.role
      };
    },

    /**
     * For JQM buttons to work correctly using backbone we need to append a listener
     * to bring the history back.
     */
    appendBackButtonListeners: function () {
      log('views.Page(' + this.id + '): appending Back button listeners', 'd');

      this.$el.find('a[data-rel="back"]').on('click', function (e) {
        window.history.back();
        return false;
      });
    }
  });

  return Page;
});