/** ****************************************************************************
 * Sample Attribute main view.
 *****************************************************************************/
import $ from 'jquery';
import Marionette from 'backbone.marionette';
import Device from 'helpers/device';
import DateHelp from 'helpers/date';
import StringHelp from 'helpers/string';
import Log from 'helpers/log';
import JST from 'JST';
import CONFIG from 'config';

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
    return Math.exp(((position - this.minpos) * this.scale) + this.minlval);
  },
  // Calculate slider position from a value
  position(value) {
    return this.minpos + ((Math.log(value) - this.minlval) / this.scale);
  },
};

const logsl = new LogSlider({ maxpos: 100, minval: 1, maxval: 500 });

export default Marionette.View.extend({
  initialize(options) {
    switch (options.attr) {
      case 'stage':
        this.template = JST['common/radio'];
        break;

      case 'identifiers':
        this.template = JST['common/input'];
        break;

      default:
        this.template = JST[`samples/attr/${options.attr}`];
    }
  },

  events: {
    'click input[type="radio"]': 'saveRadio',
    'input input[type="range"]': 'updateRangeInputValue',
    'change input[type="number"]': 'updateRangeSliderValue',
  },

  saveRadio() {
    // unset slider val
    const $rangeOutput = this.$el.find('#rangeVal');
    $rangeOutput.val('');
    this.trigger('save');
  },

  getValues() {
    const values = {};
    let value;
    const attr = this.options.attr;
    let $inputs;
    switch (attr) {
      case 'date': {
        value = this.$el.find('input').val();
        const date = new Date(value);
        if (DateHelp.validate(date)) {
          values[attr] = date;
        }
        break;
      }
      case 'number':
        const numberRangesConfig = CONFIG.indicia.occurrence['number-ranges'];

        value = this.$el.find('#rangeVal').val();
        if (value) {
          // slider
          values[attr] = value;
        } else {
          // ranges selection
          $inputs = this.$el.find('input[type="radio"]');
          $inputs.each((int, elem) => {
            if ($(elem).prop('checked')) {
              const newVal = $(elem).val();
              // don't set default
              if (newVal !== numberRangesConfig.default) {
                values['number-ranges'] = newVal;
              }
            }
          });
        }
        break;
      case 'stage':
        const stageConfig = CONFIG.indicia.occurrence.stage;

        $inputs = this.$el.find('input');
        $inputs.each((int, elem) => {
          if ($(elem).prop('checked')) {
            const newVal = $(elem).val();
            // don't set default
            if (newVal !== stageConfig.default) {
              values[attr] = newVal;
            }
          }
        });
        break;
      case 'identifiers':
        value = this.$el.find('input').val();
        values[attr] = StringHelp.escape(value);
        break;
      case 'comment':
        value = this.$el.find('textarea').val();
        values[attr] = StringHelp.escape(value);
        break;
      default:
    }

    return values;
  },

  serializeData() {
    const occ = this.model.getOccurrence();
    let templateData = {};
    let selected;

    switch (this.options.attr) {
      case 'date':
        templateData.date = DateHelp.toDateInputValue(this.model.get('date'));
        templateData.maxDate = DateHelp.toDateInputValue(new Date());
        break;
      case 'number': {
        const numberRangesConfig = CONFIG.indicia.occurrence['number-ranges'];
        let number = occ.get('number');
        if (number) {
          templateData.number = number;
          templateData.numberPosition = logsl.position(number).toFixed(0);
        } else {
          number = occ.get('number-ranges') || numberRangesConfig.default;
          templateData[number] = true;
        }
        break;
      }
      case 'stage':
        const stageConfig = CONFIG.indicia.occurrence.stage;
        selected = occ.get('stage') || stageConfig.default;
        templateData = {
          message: 'Please pick the life stage.',
          selection: Object.keys(stageConfig.values).map(key => ({ value: key })),
          selected,
        };
        break;
      case 'identifiers':
        templateData.message = 'If anyone helped with the identification please enter their name here.';
        templateData.value = occ.get(this.options.attr);
        break;
      case 'comment':
        templateData.value = occ.get(this.options.attr);
        break;

      default:
        Log('Samples:Attribute:MainView: no such attribute.', 'e');
        return null;
    }

    return templateData;
  },

  updateRangeSliderValue(e) {
    const $input = $(e.target);
    const $rangeOutput = this.$el.find('#range');

    const value = logsl.position($input.val()).toFixed(0);
    $rangeOutput.val(value);

    // unset ranges selection
    const $inputs = this.$el.find('input[type="radio"]');
    $inputs.each((int, elem) => {
      $(elem).prop('checked', false);
    });
  },

  updateRangeInputValue(e) {
    const $input = $(e.target);
    if (!$input.val()) {
      // no need to do anything on input clear
      return;
    }
    const $rangeOutput = this.$el.find('#rangeVal');

    const value = logsl.value($input.val()).toFixed(0);
    $rangeOutput.val(value);

    // unset ranges selection
    const $inputs = this.$el.find('input[type="radio"]');
    $inputs.each((int, elem) => {
      $(elem).prop('checked', false);
    });
  },

  onAttach() {
    let $input;
    switch (this.options.attr) {
      case 'date':
        $input = this.$el.find('input').focus();
        if (Device.isAndroid()) {
          const options = {
            date: new Date(this.model.get('date')),
            mode: 'date',
            androidTheme: 5,
            allowOldDates: true,
            allowFutureDates: false,
          };

          window.datePicker.show(options, (date) => {
            $input.val(DateHelp.toDateInputValue(new Date(date)));
          });
        }
        break;
      case 'comment':
        $input = this.$el.find('textarea').focus();
        if (window.cordova && Device.isAndroid()) {
          window.Keyboard.show();
          $input.focusout(() => {
            window.Keyboard.hide();
          });
        }
        break;
      case 'identifiers':
        $input = this.$el.find('input').focus();
        if (window.cordova && Device.isAndroid()) {
          window.Keyboard.show();
          $input.focusout(() => {
            window.Keyboard.hide();
          });
        }
        break;
      default:
    }
  },
});

