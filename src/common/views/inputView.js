/**
 * Input view.
 */
import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import JST from 'JST';
import StringHelp from 'helpers/string';
import DateHelp from 'helpers/date';
import Device from 'helpers/device';
import typeaheadSearchFn from 'helpers/typeahead_search';

export default Marionette.View.extend({
  template: JST['common/input'],

  initialize() {
    const config = this.options.config || {};

    this.model = new Backbone.Model({
      type: this.options.type || config.type || 'text',
      max: this.options.max || config.max,
      message: this.options.label || config.label,
      value: this.options.default || config.default,
    });

    this.type = this.model.get('type');

    if (this.type === 'date') {
      this.model.set('max', DateHelp.toDateInputValue(this.model.get('max')));
      this.model.set('value', DateHelp.toDateInputValue(this.model.get('value')));
    }
  },

  getValues() {
    const value = this.$el.find('input').val();

    const valid = this.validate(value);
    if (!valid) {
      return null;
    }

    if (this.type === 'date') {
      const date = new Date(value);
      if (DateHelp.validate(date)) {
        return date;
      }
    }

    return StringHelp.escape(value);
  },

  validate(value) {
    if (this.options.validate) {
      const valid = this.options.validate(value);
      if (!valid) {
        return false;
      }
    }

    if (this.type === 'date') {
      return DateHelp.validate(new Date(value));
    }

    return true;
  },

  onAttach() {
    const $input = this.$el.find('input').focus();
    if (window.cordova && Device.isAndroid()) {
      if (this.type === 'date') {
        const options = {
          date: new Date(this.model.get('value')),
          mode: 'date',
          androidTheme: 5,
          allowOldDates: true,
          allowFutureDates: false,
        };

        window.datePicker.show(options, (date) => {
          $input.val(DateHelp.toDateInputValue(new Date(date)));
        });
        return;
      }

      window.Keyboard.show();
      $input.focusout(() => {
        window.Keyboard.hide();
      });
    }

    if (this.options.typeahead) {
      this.addtypeaheadSuggestions();
    }
  },

  addtypeaheadSuggestions() {
    const that = this;
    const lookup = this.options.typeahead;
    const $typeahead = this.$el.find('input');
    $typeahead.typeahead(
      {
        hint: false,
        highlight: true,
        minLength: 2,
      },
      {
        limit: 3,
        name: 'names',
        source: typeaheadSearchFn(lookup, 3),
      });

    $typeahead.bind('typeahead:select', () => {
      that.trigger('save');
    });
  },
});
