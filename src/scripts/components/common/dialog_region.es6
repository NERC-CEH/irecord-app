/******************************************************************************
 * Messages the user
 *****************************************************************************/
define([
  'marionette',
  'JST'
], function (Marionette, JST) {
  "use strict";

  let DialogRegion = Marionette.Region.extend({
    el: '#dialog',

    constructor: function(){
      _.bindAll(this);
      Marionette.Region.prototype.constructor.apply(this, arguments);

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

      if (!(view instanceof Marionette.ItemView)){
        //create a standard dialog
        let options = view;
        let that = this;
        this.hideAllowed = typeof view.hideAllowed != 'undefined' ? view.hideAllowed : true ;

        let View = Marionette.LayoutView.extend({
          template: view.template || JST['common/dialog'],
          className: 'content ' + (view.className ? view.className : ''),

          regions: {
            header: '.dialog-header',
            body: '.dialog-body',
            footer: '.dialog-footer'
          },

          onShow: function () {
            let that = this;
            //add header
            if (options.title) {
              if (options.title instanceof Marionette.ItemView) {
                this.header.show(options.title);
              } else {
                let title = new Marionette.ItemView({
                  tagName: 'h3',
                  template: _.template(options.title)
                });
                this.header.show(title);
              }
            }

            //add body
            if (options.body) {
              if (options.body instanceof Marionette.ItemView) {
                this.body.show(options.body);
              } else {
                let body = new Marionette.ItemView({
                  template: _.template(options.body)
                });
                this.body.show(body);
              }
            }


            //add buttons
            if (options.buttons) {
              if (options.buttons instanceof Marionette.ItemView) {
                this.footer.show(options.buttons);
              } else {
                let ButtonView = Marionette.ItemView.extend({
                  id: function () {
                    return this.model.id || Math.floor(Math.random() * 10000)
                  },
                  tagName: 'button',
                  className: function () {
                    return 'btn ' + this.model.get('class')
                  },
                  template: _.template('<%- obj.title %>'),
                  events: {
                    'click': function (e) {
                      let onClick = this.model.attributes.onClick || that.hide;
                      onClick();
                    }
                  }
                });

                let ButtonsArrayView =  Marionette.CollectionView.extend({
                  className: 'dialog-buttons',
                  collection: new Backbone.Collection(options.buttons),
                  childView: ButtonView
                });

                this.footer.show(new ButtonsArrayView());
              }
            }
          }
        });
        view = new View();
      }

      this.$el.fadeIn(300);

      view.on("close", this.hide, this);
      Marionette.Region.prototype.show.call(this, view);
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

      let view = new Marionette.ItemView({
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


