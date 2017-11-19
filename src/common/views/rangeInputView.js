/**
 * Range slider input view.
 */
import $ from 'jquery';
import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import JST from 'JST';
import StringHelp from 'helpers/string';

// http://stackoverflow.com/questions/846221/logarithmic-slider
function LogSlider(options = {}) {
  this.minpos = options.minpos || 0;
  this.maxpos = options.maxpos || 100;
  this.minlval = Math.log(options.minval || 1);
  this.maxlval = Math.log(options.maxval || 100000);

  this.scale = (this.maxlval - this.minlval) / (this.maxpos - this.minpos);
}

LogSlider.prototype = {
  // Calculate value from a slider position
  value(position) {
    return Math.exp((position - this.minpos) * this.scale + this.minlval);
  },
  // Calculate slider position from a value
  position(value) {
    return this.minpos + (Math.log(value) - this.minlval) / this.scale;
  },
};

const logsl = new LogSlider({ maxpos: 100, minval: 1, maxval: 500 });

export default Marionette.View.extend({
  template: JST['common/range_input'],

  events: {
    'input input[type="range"]': 'updateRangeInputValue',
    'change input[type="number"]': 'updateRangeSliderValue',
  },

  initialize() {
    const config = this.options.config || {};

    this.model = new Backbone.Model({
      message: this.options.label || config.label,
      value: this.options.default || config.default,
    });

    this.model.set(
      'position',
      logsl.position(this.model.get('value') || 1).toFixed(0)
    );
  },

  getValues() {
    const value = this.$el.find('input[type="number"]').val();
    return StringHelp.escape(value);
  },

  updateRangeInputValue(e) {
    const $input = $(e.target);
    if (!$input.val()) {
      // no need to do anything on input clear
      return;
    }
    const $rangeOutput = this.$el.find('input[type="number"]');

    const value = logsl.value($input.val()).toFixed(0);
    $rangeOutput.val(value);
    this.trigger('change');
  },

  updateRangeSliderValue(e) {
    const $input = $(e.target);
    const $rangeOutput = this.$el.find('input[type="range"]');

    const value = logsl.position($input.val()).toFixed(0);
    $rangeOutput.val(value);
    this.trigger('change');
  },

  resetValue() {
    const $rangeOutput = this.$el.find('input[type="number"]');
    $rangeOutput.val(null);
  },
});
