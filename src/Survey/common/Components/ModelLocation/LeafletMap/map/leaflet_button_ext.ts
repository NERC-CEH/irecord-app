import L from 'leaflet';
import './leaflet_button_ext.scss';

/**
 * https://gist.github.com/ejh/2935327
 */
export default L.Control.extend({
  options: {
    position: 'bottomleft',
  },
  initialize(options: any) {
    this._button = {};
    this.setButton(options);
    this.options = { ...this.options, ...options };
  },

  onAdd(map: any) {
    this._map = map;
    const containerClassName =
      'leaflet-control-button ' + (this.options.containerClassName || ''); // eslint-disable-line
    const container = L.DomUtil.create('div', containerClassName);

    if (this.options.title) {
      container.title = this.options.title;
    }

    this._container = container;

    this._update();
    return this._container;
  },

  onRemove() {},

  setButton(options: any) {
    const button = {
      body: options.body, // string
      text: options.text, // string
      iconUrl: options.iconUrl, // string
      onClick: options.onClick, // callback function
      hideText: !!options.hideText, // forced bool
      maxWidth: options.maxWidth || 70, // number
      doToggle: options.doToggle, // bool
      toggleStatus: options.toggleStatus, // bool
      title: options.title ? options.title : '', // string
    };

    this._button = button;
    this._update();
  },

  getText() {
    return this._button.text;
  },

  getIconUrl() {
    return this._button.iconUrl;
  },

  destroy() {
    this._button = {};
    this._update();
  },

  toggle(e?: any) {
    if (typeof e === 'boolean') {
      this._button.toggleStatus = e;
    } else {
      this._button.toggleStatus = !this._button.toggleStatus;
    }
    this._update();
  },

  _update() {
    if (!this._map) {
      return;
    }

    this._container.innerHTML = '';
    this._makeButton(this._button);
  },

  _makeButton(button: any) {
    const className =
      'leaflet-buttons-control-button ' + (this.options.className || ''); // eslint-disable-line
    const newButton = L.DomUtil.create('div', className, this._container);
    if (button.toggleStatus) {
      L.DomUtil.addClass(newButton, 'leaflet-buttons-control-toggleon');
    }
    if (button.body) {
      // MY MOD
      newButton.innerHTML = button.body;
    } else {
      const image = L.DomUtil.create(
        'img',
        'leaflet-buttons-control-img',
        newButton
      );
      image.setAttribute('src', button.iconUrl);

      if (button.text !== '') {
        L.DomUtil.create('br', '', newButton); // there must be a better way

        const span = L.DomUtil.create(
          'span',
          'leaflet-buttons-control-text',
          newButton
        );
        const text = document.createTextNode(button.text); // is there an L.DomUtil for this?
        span.appendChild(text);
        if (button.hideText) {
          L.DomUtil.addClass(span, 'leaflet-buttons-control-text-hide');
        }
      }
    }

    L.DomEvent.addListener(newButton, 'click', L.DomEvent.stop)
      .addListener(newButton, 'click', button.onClick, this)
      .addListener(newButton, 'click', this._clicked, this);
    L.DomEvent.disableClickPropagation(newButton);
    return newButton;
  },

  _clicked() {
    // 'this' refers to button
    if (this._button.doToggle) {
      if (this._button.toggleStatus) {
        // currently true, remove class
        L.DomUtil.removeClass(
          this._container.childNodes[0],
          'leaflet-buttons-control-toggleon'
        );
      } else {
        L.DomUtil.addClass(
          this._container.childNodes[0],
          'leaflet-buttons-control-toggleon'
        );
      }
      this.toggle();
    }
  },
} as any);
