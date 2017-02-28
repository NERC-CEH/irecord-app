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
    this.template = JST[`samples/attr/${options.attr}`];
  },

  events: {
    'click input[type="radio"]': 'saveNumber',
    'input input[type="range"]': 'updateRangeInputValue',
    'change input[type="number"]': 'updateRangeSliderValue',
  },

  saveNumber() {
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
        if (date.toString() !== 'Invalid Date') {
          values[attr] = new Date(date);
        }
        break;
      }
      case 'number':
        value = this.$el.find('#rangeVal').val();
        if (value) {
          // slider
          values[attr] = value;
        } else {
          // ranges selection
          $inputs = this.$el.find('input[type="radio"]');
          $inputs.each((int, elem) => {
            if ($(elem).prop('checked')) {
              values['number-ranges'] = $(elem).val();
            }
          });
        }
        break;
      case 'stage':
        $inputs = this.$el.find('input');
        $inputs.each((int, elem) => {
          if ($(elem).prop('checked')) {
            values[attr] = $(elem).val();
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
    const templateData = {};
    const occ = this.model.getOccurrence();

    switch (this.options.attr) {
      case 'date':
        templateData.date = DateHelp.toDateInputValue(this.model.get('date'));
        templateData.maxDate = DateHelp.toDateInputValue(new Date());
        break;
      case 'number': {
        let number = occ.get('number');
        if (number) {
          templateData.number = number;
          templateData.numberPosition = logsl.position(number).toFixed(0);
        } else {
          number = occ.get('number-ranges') || 'default';
          templateData[number] = true;
        }
        break;
      }
      case 'stage':
        templateData[occ.get('stage')] = true;
        break;
      case 'identifiers':
        templateData.identifiers = occ.get('identifiers');
        break;
      case 'comment':
        templateData.comment = occ.get('comment');
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

