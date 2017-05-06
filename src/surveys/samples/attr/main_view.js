/** ****************************************************************************
 * Surveys Sample Attr main view.
 *****************************************************************************/
import $ from 'jquery';
import Marionette from 'backbone.marionette';
import Log from 'helpers/log';
import StringHelp from 'helpers/string';
import DateHelp from 'helpers/date';
import Device from 'helpers/device';
import CONFIG from 'config';
import JST from 'JST';

export default Marionette.View.extend({
  initialize(options) {
    switch (options.attr) {
      case 'stage':
      case 'status':
        this.template = JST['common/radio'];
        break;

      case 'abundance':
      case 'identifiers':
        this.template = JST['common/input'];
        break;

      default:
        this.template = JST[`samples/attr/${options.attr}`];
    }
  },

  events: {
    'click input[type="radio"]': 'saveRadio',
  },

  saveRadio() {
    this.trigger('save');
  },

  getValues() {
    const values = {};
    let value;
    let $inputs;
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
      case 'abundance':
      case 'identifiers':
        value = this.$el.find('input').val();
        values[attr] = StringHelp.escape(value);
        break;
      case 'status':
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
      case 'comment':
        value = this.$el.find('textarea').val();
        values[attr] = StringHelp.escape(value);
        break;
      default:
    }

    return values;
  },

  serializeData() {
    let templateData = {};
    const occ = this.model.getOccurrence();

    let selected;
    switch (this.options.attr) {
      case 'date':
        templateData.date = DateHelp.toDateInputValue(this.model.get('date'));
        templateData.maxDate = DateHelp.toDateInputValue(new Date());
        break;
      case 'abundance':
        templateData.pattern = "/^(\d+|[DAFOR]|LA|LF)$/";
        templateData.message = 'Abundance (DAFOR, LA, LF or count).';
        templateData.value = occ.get(this.options.attr);
        break;
      case 'identifiers':
        templateData.message = 'If anyone helped with the identification please enter their name here.';
        templateData.value = occ.get(this.options.attr);
        break;

      case 'status':
        const statusConfig = CONFIG.indicia.surveys.plant.occurrence.status;
        selected = occ.get('status') || statusConfig.default;
        templateData = {
          message: 'Please pick the status.',
          selection: Object.keys(statusConfig.values),
          selected,
        };
        break;
      case 'stage':
        const stageConfig = CONFIG.indicia.surveys.plant.occurrence.stage;
        selected = occ.get('stage') || stageConfig.default;
        templateData = {
          message: 'Please pick the life stage.',
          selection: Object.keys(stageConfig.values),
          selected,
        };
        break;
      case 'comment':
        templateData.value = occ.get(this.options.attr);
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
