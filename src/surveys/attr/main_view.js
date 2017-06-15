/** ****************************************************************************
 * Surveys List main view.
 *****************************************************************************/
import _ from 'lodash';
import $ from 'jquery';
import Marionette from 'backbone.marionette';
import Device from 'helpers/device';
import Log from 'helpers/log';
import DateHelp from 'helpers/date';
import StringHelp from 'helpers/string';
import JST from 'JST';
import typeaheadSearchFn from 'common/typeahead_search';

export default Marionette.View.extend({
  initialize(options) {
    switch (options.attr) {
      case 'recorders':
        this.template = JST['surveys/attr/recorders'];
        break;

      case 'vice-county':
        this.template = JST['common/input'];
        break;

      default:
        this.template = JST[`samples/attr/${options.attr}`];
    }
  },

  events: {
    'click button.add-new': 'addNew',
  },

  addtypeaheadSuggestions() {
    const that = this;
    const viceCounties = this.options.viceCounties;
    const codes = [];
    const names = viceCounties.map((a) => {
      codes.push(a.code);
      return a.name;
    });
    const $typeahead = this.$el.find('.typeahead');
    $typeahead.typeahead(
      {
        hint: false,
        highlight: true,
        minLength: 2,
      },
      {
        limit: 3,
        name: 'names',
        source: typeaheadSearchFn(names.concat(codes), 3),
      });

    $typeahead.bind('typeahead:select', () => {
      that.trigger('save');
    });
  },

  addNew() {
    $('<input type="text"/>').insertAfter(this.$el.find('button'));
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
      case 'recorders':
        values[attr] = [];
        const $inputs = this.$el.find('input');
        $inputs.each((index, input) => {
          const val = input.value;
          if (val) {
            values[attr].unshift(StringHelp.escape(val));
          }
        });
        break;
      case 'vice-county':
        value = this.$el.find('input').val();
        values[attr] = value;
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
      case 'recorders':
        templateData.message = 'If anyone helped with the identification please enter their name here.';
        templateData.value = this.model.get(this.options.attr) || [];
        break;
      case 'vice-county':
        templateData.typeahead = true;
        const vc = this.model.get(this.options.attr) || {};
        templateData.value = vc.name;
        break;
      case 'comment':
        templateData.value = this.model.get(this.options.attr);
        break;

      default:
        Log('Samples:Attribute:MainView: no such attribute.', 'e');
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
      case 'vice-county':
      case 'recorders':
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

    this.addtypeaheadSuggestions();
  },
});
