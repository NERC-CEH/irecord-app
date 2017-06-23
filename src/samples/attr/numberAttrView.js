import Marionette from 'backbone.marionette';
import _ from 'lodash';
import RadioInputView from 'common/views/radioInputView';
import RangeInputView from 'common/views/rangeInputView';

export default Marionette.View.extend({
  template: _.template(`
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
    const sliderView = new RangeInputView({
      config: this.options.config,
      default: this.options.default,
    });
    sliderView.on('change', this.resetRangeInputValue);
    this.sliderView = sliderView;
    const sliderRegion = this.getRegion('slider');
    sliderRegion.show(sliderView);


    const selectionView = new RadioInputView({
      config: this.options.config,
      default: this.options.default,
    });
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
    this.selectRegion.resetValue();
  },
});
