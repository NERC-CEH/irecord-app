/******************************************************************************
 * A default JQM page view.
 *****************************************************************************/
define([
  'backbone'
], function (Backbone) {
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
      _log('views.Page(' + id + '): initialize', log.DEBUG);

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
      _log('views.Page(' + this.id + '): render', log.DEBUG);

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
      _log('views.Page(' + this.id + '): appending Back button listeners', log.DEBUG);

      this.$el.find('a[data-rel="back"]').on('click', function (e) {
        window.history.back();
        return false;
      });
    }
  });

  return Page;
});