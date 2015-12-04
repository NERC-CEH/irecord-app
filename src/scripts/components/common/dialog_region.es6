/******************************************************************************
 * Messages the user
 *****************************************************************************/
define([
  'marionette',
  'JST',
  'app'
], function (marionette, JST, app) {
  "use strict";

  let DialogRegion = marionette.Region.extend({
    el: '#dialog',

    constructor: function(){
      _.bindAll(this);
      marionette.Region.prototype.constructor.apply(this, arguments);

      //attach events
      this.on("view:show", this.showModal, this);
      this.$el.on('click #dialog', this._onContainerClick);
    },

    hideAllowed: true, //hide the dialog on clicking the container

    getEl: function(selector){
      var $el = $(selector);
      $el.on("hidden", this.close);
      return $el;
    },

    /**
     * Creates dialog
     *
     * @param view
     * className
     * hideAllowed
     *
     * title
     * body
     *
     * buttons:
     *  title
     *  id
     *  onclick
     */
    show: function (view) {
      if (!view) return;

      if (!(view instanceof marionette.ItemView)){
        let that = this;
        this.hideAllowed = typeof view.hideAllowed != 'undefined' ? view.hideAllowed : true ;

        let model = new Backbone.Model({
            title: view.title || '',
            body: view.body || '',
            buttons: view.buttons
        });
        view = new marionette.ItemView({
            template: view.template || JST['common/dialog'],
            className: 'content ' + (view.className ? view.className : ''),

            model: model
          });

        _.each(view.model.get('buttons'), function (button) {
          view.$el.on('click button#' + button.id, button.onClick || that.hide)
        });
      }
      this.$el.fadeIn(300);

      view.on("close", this.hide, this);
      marionette.Region.prototype.show.call(this, view);
    },

    hide: function () {
      if (!this.hideAllowed) {
        return;
      }

      this.$el.fadeOut(300);
      this.empty();
    },

    showLoader: function () {
      this.hideAllowed = false;

      let view = new marionette.ItemView({
        template: _.template('<span class="icon icon-plus spin"></span>')
      });

      this.show(view);
    },

    hideLoader: function () {
      this.hideAllowed = true;
      this.hide();
    },

    error: function (error) {
      let view = {
        className: 'error',
        title: 'Error',
        body: error.message,
        buttons: [{
          id: 'ok',
          title: 'OK'
        }]
      }
      this.show(view);
    },

    _onContainerClick: function (e) {
      if ($(e.target).prop('id') === 'dialog') {
        this.hide(e);
      }
    }
  });

  return DialogRegion;
});


