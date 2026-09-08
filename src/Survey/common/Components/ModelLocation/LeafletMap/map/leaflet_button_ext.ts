import L from 'leaflet';
import './leaflet_button_ext.scss';

type ButtonOptions = L.ControlOptions & {
  containerClassName?: string;
  className?: string;
  title?: string;
  body?: string;
  text?: string;
  iconUrl?: string;
  onClick?: (event: Event) => void;
  hideText?: boolean;
  maxWidth?: number;
  doToggle?: boolean;
  toggleStatus?: boolean;
};

type ButtonState = {
  body: string;
  text: string;
  iconUrl: string;
  hideText: boolean;
  maxWidth: number;
  onClick?: (event: Event) => void;
  doToggle?: boolean;
  toggleStatus?: boolean;
  title?: string;
};

export default class LeafletButton extends L.Control {
  options: ButtonOptions = { position: 'bottomleft' };

  private button: ButtonState = {
    body: '',
    text: '',
    iconUrl: '',
    hideText: false,
    maxWidth: 70,
  };

  private container?: HTMLElement;

  private map?: L.Map;

  constructor(options: ButtonOptions) {
    super(options);
    this.options = { ...this.options, ...options };
    this.setButton(options);
  }

  onAdd(map: L.Map) {
    this.map = map;
    const className = `leaflet-control-button ${
      this.options.containerClassName || ''
    }`;
    this.container = L.DomUtil.create('div', className);
    if (this.options.title) this.container.title = this.options.title;
    this.update();
    return this.container;
  }

  setButton(options: ButtonOptions) {
    this.button = {
      body: options.body || '',
      text: options.text || '',
      iconUrl: options.iconUrl || '',
      onClick: options.onClick,
      hideText: !!options.hideText,
      maxWidth: options.maxWidth || 70,
      doToggle: options.doToggle,
      toggleStatus: options.toggleStatus,
      title: options.title || '',
    };
    this.update();
  }

  getText() {
    return this.button.text;
  }

  getIconUrl() {
    return this.button.iconUrl;
  }

  destroy() {
    this.button = {
      body: '',
      text: '',
      iconUrl: '',
      hideText: false,
      maxWidth: 70,
    };
    this.update();
  }

  toggle(status?: boolean) {
    this.button.toggleStatus =
      typeof status === 'boolean' ? status : !this.button.toggleStatus;
    this.update();
  }

  private update() {
    if (!this.map || !this.container) return;

    this.container.innerHTML = '';
    this.makeButton(this.button);
  }

  private makeButton(button: ButtonState) {
    const className = `leaflet-buttons-control-button ${
      this.options.className || ''
    }`;
    const element = L.DomUtil.create('div', className, this.container);
    if (button.toggleStatus)
      L.DomUtil.addClass(element, 'leaflet-buttons-control-toggleon');

    if (button.body) {
      element.innerHTML = button.body;
    } else {
      const image = L.DomUtil.create(
        'img',
        'leaflet-buttons-control-img',
        element
      );
      image.setAttribute('src', button.iconUrl);

      if (button.text) {
        L.DomUtil.create('br', '', element);
        const span = L.DomUtil.create(
          'span',
          'leaflet-buttons-control-text',
          element
        );
        span.appendChild(document.createTextNode(button.text));
        if (button.hideText)
          L.DomUtil.addClass(span, 'leaflet-buttons-control-text-hide');
      }
    }

    L.DomEvent.on(element, 'click', L.DomEvent.stop)
      .on(element, 'click', button.onClick || (() => undefined), this)
      .on(element, 'click', this.clicked, this);
    L.DomEvent.disableClickPropagation(element);
    return element;
  }

  private clicked() {
    if (!this.button.doToggle || !this.container?.firstElementChild) return;

    const child = this.container.firstElementChild as HTMLElement;
    if (this.button.toggleStatus) {
      L.DomUtil.removeClass(child, 'leaflet-buttons-control-toggleon');
    } else {
      L.DomUtil.addClass(child, 'leaflet-buttons-control-toggleon');
    }
    this.toggle();
  }
}
