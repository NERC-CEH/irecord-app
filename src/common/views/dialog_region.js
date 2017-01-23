/** ****************************************************************************
 * Messages the user
 *****************************************************************************/
import $ from 'jquery';
import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import _ from 'lodash';
import App from 'app';
import JST from 'JST';
import '../styles/dialog.scss';

const errorsTable = {
  25: {
    body: 'Sorry, looks like there was a problem with the internal database.</br> ' +
    '<b>Please close the app and start it again.</b>',
    buttons: [{
      title: 'Restart',
      onClick: function onClick() {
        App.restart();
      },
    }],
  },
};

const StandardDialogView = Marionette.View.extend({
  template: JST['common/dialog'],
  className() {
    let classes = 'content';
    if (this.options.class) {
      classes += ` ${this.options.class}`;
    }
    return classes;
  },

  regions: {
    header: '.dialog-header',
    body: '.dialog-body',
    footer: '.dialog-footer',
  },

  initialize(options = {}) {
    this.template = options.template || this.template;
  },

  onAttach() {
    // add header
    if (this.options.title) {
      if (this.options.title instanceof Marionette.View) {
        this.showChildView('header', this.options.title);
      } else {
        const title = new Marionette.View({
          tagName: 'h3',
          template: _.template(this.options.title),
        });
        this.showChildView('header', title);
      }
    }

    // add body
    if (this.options.body) {
      if (this.options.body instanceof Marionette.View) {
        this.showChildView('body', this.options.body);
      } else {
        const body = new Marionette.View({
          template: _.template(this.options.body),
        });
        this.showChildView('body', body);
      }
    }

    // add buttons
    if (this.options.buttons) {
      if (this.options.buttons instanceof Marionette.View) {
        this.showChildView('footer', this.options.buttons);
      } else {
        const ButtonView = Marionette.View.extend({
          id() {
            return this.model.id || Math.floor(Math.random() * 10000);
          },
          tagName: 'button',
          className() {
            const className = this.model.get('class');
            return `btn ${(className || '')}`;
          },
          template: _.template('<%- obj.title %>'),
          events: {
            click() {
              const onClick = this.model.attributes.onClick;
              onClick && onClick();
            },
          },
        });

        const ButtonsArrayView = Marionette.CollectionView.extend({
          className: 'dialog-buttons',
          collection: new Backbone.Collection(this.options.buttons),
          childView: ButtonView,
        });

        this.showChildView('footer', new ButtonsArrayView());
      }
    }
  },
});

export default Marionette.Region.extend({
  el: '#dialog',

  constructor(...args) {
    _.bindAll(this);
    Marionette.Region.prototype.constructor.apply(this, args);

    // attach events
    this.on('view:show', this.showModal, this);
    this.$el.on('click #dialog', this._onContainerClick);
  },

  hideAllowed: true, // hide the dialog on clicking the container

  getEl(selector) {
    const $el = $(selector);
    $el.on('hidden', this.close);
    return $el;
  },

  /**
   * Creates dialog
   *
   * @param options
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
  show(options) {
    const that = this;
    let view;

    if (!options) return;

    this.onHide = options.onHide;
    this.hideAllowed = typeof options.hideAllowed !== 'undefined' ? options.hideAllowed : true;

    if (!options.view || !(options.view instanceof Marionette.View)) {
      // create a standard dialog
      if (options.timeout) {
        this.timeout = setTimeout(() => {
          that.hide();
        }, options.timeout);
      }

      view = new StandardDialogView(options);
      view.on('hide', this.hide);
    } else {
      // passed a view so lets just show it
      view = options.view;
    }

    this.$el.fadeIn(300);

    view.on('close', this.hide, this);
    Marionette.Region.prototype.show.call(this, view);
  },

  hide(permission) {
    if (!permission && !this.hideAllowed) {
      return;
    }

    this.hideAllowed = true;

    // turn off timeout
    if (this.timeout) {
      this.timeout = clearTimeout(this.timeout);
    }

    this.$el.fadeOut(300);
    this.empty();
    this.onHide && this.onHide();
  },

  showLoader() {
    const view = new Marionette.View({
      template: _.template('<span class="icon icon-plus spin"></span>'),
    });

    this.show({ view, hideAllowed: false });
  },

  hideLoader() {
    this.hideAllowed = true;
    this.hide();
  },

  error: function error(err = {}) {
    let options = {
      class: 'error',
      title: 'Yikes!',
      body: err.message || err,
      buttons: [{
        id: 'ok',
        title: 'OK',
        onClick: this.hide,
      }],
    };

    // lookup for codes
    if (err.code) {
      const tableErrorOptions = errorsTable[err.code];
      if (tableErrorOptions) {
        options = _.extend(options, tableErrorOptions);
      }
    }

    this.show(options);
  },

  _onContainerClick(e) {
    if ($(e.target).prop('id') === 'dialog') {
      this.hide(e);
    }
  },
});
