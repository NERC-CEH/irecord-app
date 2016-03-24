/** ****************************************************************************
 * Record Attribute main view.
 *****************************************************************************/
import $ from 'jquery';
import Marionette from 'marionette';
import device from '../../../helpers/device';
import log from '../../../helpers/log';
import JST from '../../../JST';

export default Marionette.ItemView.extend({
  initialize(options) {
    this.template = JST[`records/attr/${options.attr}`];
  },

  triggers() {
    switch (this.options.attr) {
      case 'stage':
      // fallthrough
      case 'number':
        return {
          'click input': 'save',
        };
      default:
    }
    return null;
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
        $inputs = this.$el.find('input');
        $inputs.each((int, elem) => {
          if ($(elem).prop('checked')) {
            values[attr] = $(elem).val();
          }
        });
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
        values[attr] = value.escape();
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
        templateData.date = this.model.get('date').toDateInputValue();
        break;
      case 'number':
        templateData[occ.get('number')] = true;
        break;
      case 'stage':
        templateData[occ.get('stage')] = true;
        break;
      case 'comment':
        templateData.comment = occ.get('comment');
        break;
      default:
        log('No such attribute', 'e');
        return null;
    }

    return templateData;
  },

  onShow() {
    switch (this.options.attr) {
      case 'date':
        // this.$el.find('input').focus();
        const $input = this.$el.find('input').focus();
        if (device.isAndroid()) {
          const options = {
            date: new Date(this.model.get('date')),
            mode: 'date',
            androidTheme: 5,
            allowOldDates: true,
            allowFutureDates: false,
          };

          window.datePicker.show(options, function (date) {
            $input.val(new Date(date).toDateInputValue());
          });
        }
        break;
      case 'comment':
        // this.$el.find('textarea').focus();
        const $textarea = this.$el.find('textarea').focus();
        if (window.cordova && device.isAndroid()) {
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

