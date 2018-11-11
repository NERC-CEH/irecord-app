/**
 * Radio input view.
 */
import Backbone from 'backbone';
import $ from 'jquery';
import Marionette from 'backbone.marionette';
import template from 'templates/radio.tpl';

export default Marionette.View.extend({
  template,

  triggers: {
    'ionSelect ion-radio': 'save'
  },

  initialize() {
    const config = this.options.config || {};

    let selection = this.options.selection;
    if (!selection) {
      selection = Object.keys(config.values).map(key => ({ value: key }));
      // add default
      config.default && selection.unshift({ value: config.default });
    }

    this.model = new Backbone.Model({
      value: this.options.default || config.default,
      message: this.options.info || config.info,
      selection,
      selected: this.options.default || config.default
    });
  },

  getValues() {
    let values;
    const $inputs = this.$el.find('ion-radio');
    $inputs.each((int, elem) => {
      if ($(elem).prop('checked')) {
        const newVal = $(elem).val();
        // don't set default
        if (newVal !== this.options.config.default) {
          values = newVal;
        }
      }
    });

    return values;
  },

  resetValue() {
    const $inputs = this.$el.find('ion-radio');
    $inputs.each((int, elem) => {
      $(elem).prop('checked', false);
    });
  }
});
