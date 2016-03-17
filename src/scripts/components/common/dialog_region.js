/******************************************************************************
 * Messages the user
 *****************************************************************************/
import $ from 'jquery';
import Backbone from 'backbone';
import Marionette from 'marionette';
import _ from '../../../vendor/lodash/js/lodash';
import JST from '../../JST';

let StandardDialogView = Marionette.LayoutView.extend({
  template: JST['common/dialog'],
  className: function () {
    let classes = 'content';
    if (this.options.class) {
      classes += ' ' + this.options.class;
    }
    return classes;
  },

  regions: {
    header: '.dialog-header',
    body: '.dialog-body',
    footer: '.dialog-footer',
  },

  initialize: function (options) {
    options || (options = {});

    this.template = options.template || this.template;
  },

  onShow: function () {
    let that = this;

    //add header
    if (this.options.title) {
      if (this.options.title instanceof Marionette.ItemView) {
        this.header.show(this.options.title);
      } else {
        let title = new Marionette.ItemView({
          tagName: 'h3',
          template: _.template(this.options.title)
        });
        this.header.show(title);
      }
    }

    //add body
    if (this.options.body) {
      if (this.options.body instanceof Marionette.ItemView) {
        this.body.show(this.options.body);
      } else {
        let body = new Marionette.ItemView({
          template: _.template(this.options.body)
        });
        this.body.show(body);
      }
    }

    //add buttons
    if (this.options.buttons) {
      if (this.options.buttons instanceof Marionette.ItemView) {
        this.footer.show(this.options.buttons);
      } else {
        let ButtonView = Marionette.ItemView.extend({
          id: function () {
            return this.model.id || Math.floor(Math.random() * 10000)
          },
          tagName: 'button',
          className: function () {
            let className = this.model.get('class');
            return 'btn ' + (className ? className : '')
          },
          template: _.template('<%- obj.title %>'),
          events: {
            'click': function (e) {
              let onClick = this.model.attributes.onClick;
              onClick && onClick();
            }
          }
        });

        let ButtonsArrayView =  Marionette.CollectionView.extend({
          className: 'dialog-buttons',
          collection: new Backbone.Collection(this.options.buttons),
          childView: ButtonView
        });

        this.footer.show(new ButtonsArrayView());
      }
    }
  }
});

export default Marionette.Region.extend({
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
  show: function (options) {
    let that = this;
    let view;

    if (!options) return;

    this.onHide = options.onHide;
    this.hideAllowed = typeof options.hideAllowed != 'undefined' ? options.hideAllowed : true;

    if (!options.view || !(options.view instanceof Marionette.ItemView)){
      //create a standard dialog
      if (options.timeout) {
        this.timeout = setTimeout(function() {
          that.hide();
        }, options.timeout);
      }

      view = new StandardDialogView(options);
      view.on('hide', this.hide);
    } else {
      //passed a view so lets just show it
      view = options.view;
    }

    this.$el.fadeIn(300);

    view.on("close", this.hide, this);
    Marionette.Region.prototype.show.call(this, view);
  },

  hide: function () {
    if (!this.hideAllowed) {
      return;
    }

    //turn off timeout
    if (this.timeout) {
      this.timeout = clearTimeout(this.timeout);
    }

    this.$el.fadeOut(300);
    this.empty();
    this.onHide && this.onHide();
  },

  showLoader: function () {
    let view = new Marionette.ItemView({
      template: _.template('<span class="icon icon-plus spin"></span>')
    });

    this.show({view: view, hideAllowed: false});
  },

  hideLoader: function () {
    this.hideAllowed = true;
    this.hide();
  },

  error: function (error) {
    let options = {
      class: 'error',
      title: 'Error',
      body: error.message,
      buttons: [{
        id: 'ok',
        title: 'OK',
        onClick: this.hide
      }]
    }
    this.show(options);
  },

  _onContainerClick: function (e) {
    if ($(e.target).prop('id') === 'dialog') {
      this.hide(e);
    }
  }
});

