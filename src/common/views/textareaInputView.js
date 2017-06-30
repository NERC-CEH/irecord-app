/**
 * Textarea view.
 */
import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import JST from 'JST';
import StringHelp from 'helpers/string';
import Device from 'helpers/device';

export default Marionette.View.extend({
  template: JST['common/textarea'],

  initialize() {
    const config = this.options.config || {};

    this.model = new Backbone.Model({
      value: this.options.default || config.default,
      message: this.options.label || config.label,
    });
  },

  getValues() {
    const value = this.$el.find('textarea').val();
    return StringHelp.escape(value);
  },

  onAttach() {
    const $input = this.$el.find('textarea').focus();
    if (window.cordova && Device.isAndroid()) {
      window.Keyboard.show();
      $input.focusout(() => {
        window.Keyboard.hide();
      });
    }
  },
});
