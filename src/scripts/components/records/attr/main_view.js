/** ****************************************************************************
 * Record Attribute main view.
 *****************************************************************************/
import $ from 'jquery';
import Marionette from 'marionette';
import Device from '../../../helpers/device';
import DateHelp from '../../../helpers/date';
import StringHelp from '../../../helpers/string';
import Log from '../../../helpers/log';
import JST from '../../../JST';

// http://stackoverflow.com/questions/846221/logarithmic-slider
function LogSlider(options) {
  options = options || {};
  this.minpos = options.minpos || 0;
  this.maxpos = options.maxpos || 100;
  this.minlval = Math.log(options.minval || 1);
  this.maxlval = Math.log(options.maxval || 100000);

  this.scale = (this.maxlval - this.minlval) / (this.maxpos - this.minpos);
}

LogSlider.prototype = {
  // Calculate value from a slider position
  value: function(position) {
    return Math.exp((position - this.minpos) * this.scale + this.minlval);
  },
  // Calculate slider position from a value
  position: function(value) {
    return this.minpos + (Math.log(value) - this.minlval) / this.scale;
  }
};

var logsl = new LogSlider({maxpos: 100, minval: 1, maxval: 500});

export default Marionette.ItemView.extend({
  initialize(options) {
    this.template = JST[`records/attr/${options.attr}`];
  },

  events: {
    'click input[type="radio"]': 'saveNumber',
    'input input[type="range"]': 'updateRangeInputValue',
    'change input[type="number"]': 'updateRangeSliderValue',
  },

  saveNumber() {
    // unset slider val
    const $rangeOutput = this.$el.find('#rangeVal')
    $rangeOutput.val('');
    this.trigger('save');
  },

  getValues() {
    const values = {};
    let value;
    const attr = this.options.attr;
    let $inputs;
    switch (attr) {
      case 'date':
        value = this.$el.find('input').val();
        values[attr] = new Date(value);
        break;
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
    const occ = this.model.occurrences.at(0);

    switch (this.options.attr) {
      case 'date':
        templateData.date = DateHelp.toDateInputValue(this.model.get('date'));
        templateData.maxDate = DateHelp.toDateInputValue(new Date());
        break;
      case 'number':
        const number = occ.get('number');
        if (number) {
          templateData.number = number;
          templateData.numberPosition = logsl.position(number).toFixed(0);
        } else {
          templateData[occ.get('number-ranges')] = true;
        }
        break;
      case 'stage':
        templateData[occ.get('stage')] = true;
        break;
      case 'comment':
        templateData.comment = occ.get('comment');
        break;
      default:
        Log('No such attribute', 'e');
        return null;
    }

    return templateData;
  },

  updateRangeSliderValue(e) {
    const $input = $(e.target);
    const $rangeOutput = this.$el.find('#range')

    let value = logsl.position($input.val()).toFixed(0);
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
    const $rangeOutput = this.$el.find('#rangeVal')

    let value = logsl.value($input.val()).toFixed(0);
    $rangeOutput.val(value);

    // unset ranges selection
    const $inputs = this.$el.find('input[type="radio"]');
    $inputs.each((int, elem) => {
      $(elem).prop('checked', false);
    });
  },

  onShow() {
    const that = this;
    switch (this.options.attr) {
      case 'date':
        // this.$el.find('input').focus();
        const $input = this.$el.find('input').focus();
        if (Device.isAndroid()) {
          const options = {
            date: new Date(this.model.get('date')),
            mode: 'date',
            androidTheme: 5,
            allowOldDates: true,
            allowFutureDates: false,
          };

          window.datePicker.show(options, function (date) {
            $input.val(DateHelp.toDateInputValue(new Date(date)));
          });
        }
        break;
      case 'comment':
        // this.$el.find('textarea').focus();
        const $textarea = this.$el.find('textarea').focus();
        if (window.cordova && Device.isAndroid()) {
          window.Keyboard.show();
          $textarea.focusout(() => {
            window.Keyboard.hide();
          });
        }
        break;
      default:
    }
  },
});

