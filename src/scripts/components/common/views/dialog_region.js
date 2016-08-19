/** ****************************************************************************
 * Messages the user
 *****************************************************************************/
import $ from 'jquery';
import Backbone from 'backbone';
import Marionette from 'marionette';
import _ from '../../../../vendor/lodash/js/lodash';
import App from '../../../app';
import JST from '../../../JST';

const StandardDialogView = Marionette.LayoutView.extend({
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

  onShow() {
    // add header
    if (this.options.title) {
      if (this.options.title instanceof Marionette.ItemView) {
        this.header.show(this.options.title);
      } else {
        const title = new Marionette.ItemView({
          tagName: 'h3',
          template: _.template(this.options.title),
        });
        this.header.show(title);
      }
    }

    // add body
    if (this.options.body) {
      if (this.options.body instanceof Marionette.ItemView) {
        this.body.show(this.options.body);
      } else {
        const body = new Marionette.ItemView({
          template: _.template(this.options.body),
        });
        this.body.show(body);
      }
    }

    // add buttons
    if (this.options.buttons) {
      if (this.options.buttons instanceof Marionette.ItemView) {
        this.footer.show(this.options.buttons);
      } else {
        const ButtonView = Marionette.ItemView.extend({
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

        this.footer.show(new ButtonsArrayView());
      }
    }
  },
});

export default Marionette.Region.extend({
  el: '#dialog',

  constructor() {
    _.bindAll(this);
    Marionette.Region.prototype.constructor.apply(this, arguments);

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
  show(options) {
    const that = this;
    let view;

    if (!options) return;

    this.onHide = options.onHide;
    this.hideAllowed = typeof options.hideAllowed !== 'undefined' ? options.hideAllowed : true;

    if (!options.view || !(options.view instanceof Marionette.ItemView)) {
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

  hide() {
    if (!this.hideAllowed) {
      return;
    }

    // turn off timeout
    if (this.timeout) {
      this.timeout = clearTimeout(this.timeout);
    }

    this.$el.fadeOut(300);
    this.empty();
    this.onHide && this.onHide();
  },

  showLoader() {
    const view = new Marionette.ItemView({
      template: _.template('<span class="icon icon-plus spin"></span>'),
    });

    this.show({ view, hideAllowed: false });
  },

  hideLoader() {
    this.hideAllowed = true;
    this.hide();
  },

  error: function error(error = {}) {
    let options = {
      class: 'error',
      title: 'Yikes!',
      body: error.message || error,
      buttons: [{
        id: 'ok',
        title: 'OK',
        onClick: this.hide,
      }],
    };

    // lookup for codes
    if (error.code) {
      const tableErrorOptions = errorsTable[error.code];
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

const errorsTable = {
  25: {
    body: 'Sorry, looks like there was a problem with the internal database.</br> ' + '<b>Please close the app and start it again.</b>',
    buttons: [{
      title: 'Restart',
      onClick: function onClick() {
        App.restart();
      },
    }],
  },
};
