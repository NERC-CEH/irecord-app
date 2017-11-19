import Marionette from 'backbone.marionette';
import _ from 'lodash';
import RadioInputView from 'common/views/radioInputView';
import RangeInputView from 'common/views/rangeInputView';
import CONFIG from 'config';

export default Marionette.View.extend({
  template: _.template(`
    <div class="info-message">
      <p>
        ${CONFIG.indicia.surveys.general.occurrence.number.label}
      </p>
    </div>
    <div id="slider"></div>
    <div id="selection"></div>
  `),

  regions: {
    slider: {
      el: '#slider',
      replaceElement: true,
    },
    selection: {
      el: '#selection',
      replaceElement: true,
    },
  },

  onRender() {
    // slider view
    const sliderView = new RangeInputView({
      default: this.options.defaultNumber,
    });
    // reset ranges on slider change
    sliderView.on('change', () => this.resetRangeInputValue());
    this.sliderView = sliderView;
    const sliderRegion = this.getRegion('slider');
    sliderRegion.show(sliderView);

    // ranges selection
    // don't show any selected default range if the slider value exists
    const defaultRange = this.options.defaultNumber ? -1 : this.options.default;
    const selectionView = new RadioInputView({
      config: this.options.config,
      default: defaultRange,
    });
    // on save
    selectionView.on('save', e => {
      sliderView.resetValue(); // so that getValues wouldn't pick it up
      this.trigger('save', e);
    });
    this.selectionView = selectionView;
    const selectionRegion = this.getRegion('selection');
    selectionRegion.show(selectionView);
  },

  getValues() {
    const value = this.sliderView.getValues();
    const rangeValue = this.selectionView.getValues();

    return [value, rangeValue];
  },

  resetRangeInputValue() {
    // unset ranges selection
    this.selectionView.resetValue();
  },
});
