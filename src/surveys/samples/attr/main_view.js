/** ****************************************************************************
 * Surveys Sample Attr main view.
 *****************************************************************************/
import Marionette from 'backbone.marionette';
import Log from 'helpers/log';
import StringHelp from 'helpers/string';
import DateHelp from 'helpers/date';
import Device from 'helpers/device';
import JST from 'JST';

export default Marionette.View.extend({
  initialize(options) {
    switch (options.attr) {
      case 'identifiers':
        this.template = JST['common/input'];
        break;

      default:
        this.template = JST[`samples/attr/${options.attr}`];
    }
  },

  events: {
    'click input[type="radio"]': 'saveNumber',
    'input input[type="range"]': 'updateRangeInputValue',
    'change input[type="number"]': 'updateRangeSliderValue',
  },

  getValues() {
    const values = {};
    let value;
    const attr = this.options.attr;
    switch (attr) {
      case 'date': {
        value = this.$el.find('input').val();
        const date = new Date(value);
        if (date.toString() !== 'Invalid Date') {
          values[attr] = new Date(date);
        }
        break;
      }
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

    switch (this.options.attr) {
      case 'date':
        templateData.date = DateHelp.toDateInputValue(this.model.get('date'));
        templateData.maxDate = DateHelp.toDateInputValue(new Date());
        break;
      case 'identifiers':
        templateData.message = 'If anyone helped with the identification please enter their name here.';
        templateData.value = this.model.get(this.options.attr);
        break;
      case 'comment':
        templateData.value = this.model.get(this.options.attr);
        break;

      default:
        Log('Surveys:Sample:Attribute:MainView: no such attribute.', 'e');
        return null;
    }

    return templateData;
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
